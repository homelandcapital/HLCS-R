
"use client";

import type { AuthenticatedUser, GeneralUser, Agent, PlatformAdmin, UserRole } from '@/lib/types';
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';
import type { AuthChangeEvent, Session, User as SupabaseAuthUser, PostgrestError } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

type UserProfile = Database['public']['Tables']['users']['Row'];

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthenticatedUser | null;
  loading: boolean;
  isPropertySaved: (propertyId: string) => boolean;
  toggleSaveProperty: (propertyId: string) => void;
  signInWithPassword: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpUser: (name: string, email: string, password: string) => Promise<{ error: Error | null; data: { user: SupabaseAuthUser | null; } | null }>;
  signUpAgent: (name: string, email: string, password: string, phone: string, agency?: string) => Promise<{ error: Error | null; data: { user: SupabaseAuthUser | null; } | null }>;
  signOut: () => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<{ error: Error | null }>;
  updateUserPassword: (newPassword: string) => Promise<{ error: Error | null }>;
  getSupabaseSession: () => Session | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchUserProfileAndRelatedData = useCallback(async (supabaseUser: SupabaseAuthUser): Promise<AuthenticatedUser | null> => {
    const { data: userProfilesData, error: profileQueryError } = await supabase
      .from('users')
      .select('*')
      .eq('id', supabaseUser.id);

    if (profileQueryError) {
      const pgError = profileQueryError as PostgrestError;
      console.error('Error fetching user profile. Message:', pgError.message);
      console.error('Error fetching user profile. Details:', pgError.details);
      console.error('Error fetching user profile. Hint:', pgError.hint);
      console.error('Error fetching user profile. Code:', pgError.code);
      console.error('Full profileError object:', pgError);
      toast({ title: 'Profile Error', description: `Could not load your profile data. ${pgError.message || 'Please check console for details.'}`, variant: 'destructive'});
      return null;
    }

    if (!userProfilesData || userProfilesData.length === 0) {
      console.warn('User profile not found in public.users for id:', supabaseUser.id);
      const { data: { session: currentAuthSession } } = await supabase.auth.getSession();
      if (currentAuthSession) { 
         toast({ title: 'Profile Not Found', description: 'Your user profile could not be found. This might happen if registration was interrupted or profile data is missing. Please contact support or try re-registering.', variant: 'destructive'});
      }
      return null;
    }

    if (userProfilesData.length > 1) {
      console.error('Multiple user profiles found for id (data integrity issue):', supabaseUser.id);
      toast({ title: 'Profile Error', description: 'Multiple profiles found for your account. Please contact support.', variant: 'destructive'});
      return null;
    }
    
    const baseProfile = userProfilesData[0] as UserProfile;

    let authenticatedUser: AuthenticatedUser;

    if (baseProfile.role === 'user') {
      const { data: savedPropsData, error: savedPropsError } = await supabase
        .from('saved_properties')
        .select('property_id')
        .eq('user_id', baseProfile.id);

      if (savedPropsError) {
        console.error('Error fetching saved properties:', savedPropsError.message);
      }
      const savedPropertyIds = savedPropsData ? savedPropsData.map(sp => sp.property_id) : [];
      
      authenticatedUser = {
        ...baseProfile,
        role: 'user',
        savedPropertyIds,
      } as GeneralUser;

    } else if (baseProfile.role === 'agent') {
      authenticatedUser = {
        ...baseProfile,
        role: 'agent',
        phone: baseProfile.phone || '', 
      } as Agent;
    } else if (baseProfile.role === 'platform_admin') {
      authenticatedUser = {
        ...baseProfile,
        role: 'platform_admin',
      } as PlatformAdmin;
    } else {
        console.error('Unknown user role in profile:', baseProfile.role);
        toast({ title: 'Profile Error', description: `Unknown user role: ${baseProfile.role}.`, variant: 'destructive'});
        return null;
    }
    
    return authenticatedUser;

  }, [toast]);

  useEffect(() => {
    const initializeAuth = async () => {
      if (!isMountedRef.current) return;
      setLoading(true);
      try {
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Error getting initial session:", sessionError);
          if (isMountedRef.current) {
            setUser(null);
            setSession(null);
          }
          return;
        }

        if (isMountedRef.current) setSession(initialSession);

        if (initialSession?.user) {
          const profile = await fetchUserProfileAndRelatedData(initialSession.user);
          if (isMountedRef.current) setUser(profile);
        } else {
          if (isMountedRef.current) setUser(null);
        }
      } catch (error) {
        console.error("Unhandled error during auth initialization:", error);
        if (isMountedRef.current) {
          setUser(null);
          setSession(null);
        }
      } finally {
        if (isMountedRef.current) setLoading(false);
      }
    };

    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, currentSession: Session | null) => {
        if (!isMountedRef.current) return;

        setSession(currentSession);

        if (event === 'SIGNED_IN' && currentSession?.user) {
          if (!isMountedRef.current) return; 
          setLoading(true);
          try {
            const profile = await fetchUserProfileAndRelatedData(currentSession.user);
            if (isMountedRef.current) setUser(profile);
            if (profile) {
              if (profile.role === 'agent') router.push('/agents/dashboard');
              else if (profile.role === 'platform_admin') router.push('/admin/dashboard');
              else router.push('/users/dashboard');
            } else {
               console.warn("Profile fetch failed after SIGNED_IN event. User might be stuck or profile missing. Auth user exists but public.users profile couldn't be loaded.");
            }
          } catch (e) { 
            console.error("Error on SIGNED_IN profile fetch:", e); 
            if (isMountedRef.current) setUser(null); 
          } finally { 
            if (isMountedRef.current) setLoading(false); 
          }
        } else if (event === 'SIGNED_OUT') {
          if (isMountedRef.current) {
            setUser(null);
            setLoading(false); 
            router.push('/');
          }
        } else if (event === 'USER_UPDATED' && currentSession?.user) {
          if (!isMountedRef.current) return;
          setLoading(true);
          try {
            const profile = await fetchUserProfileAndRelatedData(currentSession.user);
            if (isMountedRef.current) setUser(profile);
          } catch (e) { 
            console.error("Error on USER_UPDATED profile fetch:", e); 
          } finally { 
            if (isMountedRef.current) setLoading(false); 
          }
        } else if (event === 'PASSWORD_RECOVERY' && currentSession) {
          if (isMountedRef.current) {
            console.log("PASSWORD_RECOVERY event detected. Session (temporary for password update):", currentSession);
            setSession(currentSession); 
            setLoading(false); 
            router.push('/update-password'); 
          }
        } else if (event === 'INITIAL_SESSION') {
            // setLoading(false) is handled by initializeAuth's finally block
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [fetchUserProfileAndRelatedData, router, toast]);


  const signInWithPassword = async (email: string, password: string) => {
    if (!isMountedRef.current) return { error: new Error("Component unmounted") };
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({ title: 'Login Failed', description: error.message, variant: 'destructive' });
       if (isMountedRef.current) setLoading(false); 
    }
    // setLoading(false) is handled by onAuthStateChange for SIGNED_IN or by the error case above
    return { error };
  };

  const commonSignUp = async (
    email: string, 
    password: string, 
    userRole: UserRole, 
    profileSpecificData: Partial<Omit<UserProfile, 'id' | 'email' | 'role' | 'avatar_url' | 'created_at' | 'updated_at' | 'name'> & { name: string }>
  ) => {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      toast({ title: 'Registration Failed', description: signUpError.message, variant: 'destructive' });
      return { error: signUpError, data: null };
    }

    if (signUpData.user) {
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: signUpData.user.id, 
          email: signUpData.user.email!, 
          role: userRole,
          name: profileSpecificData.name,
          phone: userRole === 'agent' ? (profileSpecificData as Partial<Agent>).phone : null,
          agency: userRole === 'agent' ? (profileSpecificData as Partial<Agent>).agency : null,
        });

      if (profileError) {
        const pgError = profileError as PostgrestError;
        console.error("Error creating profile during signup. Message:", pgError.message);
        console.error("Error creating profile during signup. Details:", pgError.details);
        console.error("Error creating profile during signup. Hint:", pgError.hint);
        console.error("Error creating profile during signup. Code:", pgError.code);
        console.error("Full profileError object:", pgError);

        if (pgError.code === '23505' && pgError.message.includes('users_email_key')) {
          toast({
            title: 'Email Already Registered',
            description: 'This email address is already registered. Please try logging in.',
            variant: 'destructive',
          });
        } else {
          toast({ title: 'Profile Creation Failed', description: `Profile creation failed: ${pgError.message || 'Unknown error, see console.'}. Please contact support.`, variant: 'destructive' });
        }
        
        if (signUpData.user?.id) {
          console.warn(`Profile creation failed for auth user: ${signUpData.user.id}. Signing out user from auth table to attempt cleanup.`);
          // Don't await this, let it happen in background; onAuthStateChange will handle UI.
          supabase.auth.signOut().catch(signOutError => {
            console.error("Error during cleanup signOut:", signOutError);
          });
        }
        return { error: profileError as Error, data: null };
      }

      if (signUpData.session === null && signUpData.user.identities && signUpData.user.identities.length > 0) {
        toast({ title: 'Registration Almost Complete!', description: `Welcome, ${profileSpecificData.name}! Please check your email (${email}) to verify your account.` });
      } else if (signUpData.session) {
        toast({ title: 'Registration Successful!', description: `Welcome, ${profileSpecificData.name}! You are now logged in.`});
      } else {
        toast({ title: 'Registration Incomplete', description: `There was an issue. If you've registered before, try logging in or check your email for verification.`, variant: 'destructive' });
      }
    } else {
      toast({ title: 'Registration Issue', description: 'Could not complete registration. User data not returned. Please try again.', variant: 'destructive' });
      return { error: new Error("User data not returned from signup"), data: null };
    }
    return { error: null, data: signUpData };
  };

  const signUpUser = async (name: string, email: string, password: string) => {
    if (!isMountedRef.current) return { error: new Error("Component unmounted"), data: null };
    setLoading(true);
    try {
      const result = await commonSignUp(email, password, 'user', { name });
      return result;
    } catch (e) {
      if (isMountedRef.current) {
        toast({ title: "Registration Error", description: "An unexpected error occurred during user signup.", variant: "destructive" });
      }
      return { error: e instanceof Error ? e : new Error("Unknown registration error"), data: null };
    } finally {
      // If commonSignUp itself doesn't trigger a SIGNED_IN (e.g. due to email verification needed, or error before auth.signUp call),
      // or if an error is thrown inside this function before commonSignUp, we need to reset loading.
      // However, if SIGNED_IN happens, onAuthStateChange will handle setLoading(false).
      // This check ensures loading is reset if no auth state change that resets it occurs.
      if (isMountedRef.current && !session?.user) { // A bit heuristic, assumes session reflects successful auth part
         // setLoading(false); // Potentially handled by onAuthStateChange
      }
    }
  };

  const signUpAgent = async (name: string, email: string, password: string, phone: string, agency?: string) => {
    if (!isMountedRef.current) return { error: new Error("Component unmounted"), data: null };
    setLoading(true);
    try {
      const result = await commonSignUp(email, password, 'agent', { name, phone, agency });
      return result;
    } catch (e) {
      if (isMountedRef.current) {
        toast({ title: "Registration Error", description: "An unexpected error occurred during agent signup.", variant: "destructive" });
      }
      return { error: e instanceof Error ? e : new Error("Unknown registration error"), data: null };
    } finally {
      // Similar logic as signUpUser
      if (isMountedRef.current && !session?.user) {
         // setLoading(false); // Potentially handled by onAuthStateChange
      }
    }
  };

  const signOut = async () => {
    if (!isMountedRef.current) return;
    setLoading(true); 
    const { error } = await supabase.auth.signOut();
    if (error) {
        toast({ title: 'Logout Failed', description: error.message, variant: 'destructive' });
        if (isMountedRef.current) setLoading(false); 
    } else {
        toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
        // setLoading(false) is handled by onAuthStateChange for SIGNED_OUT
    }
  };

  const sendPasswordResetEmail = async (email: string) => {
    if (!isMountedRef.current) return { error: new Error("Component unmounted") };
    setLoading(true);
    let errorResult: Error | null = null;
    try {
      const redirectTo = `${window.location.origin}/update-password`; 
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      errorResult = error;
      if (error) {
        toast({ title: 'Password Reset Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ 
          title: 'Password Reset Email Sent', 
          description: 'If an account exists for this email, a reset link has been sent. Please check your inbox (and spam folder).',
          duration: 9000 
        });
      }
    } catch (e) {
      errorResult = e instanceof Error ? e : new Error("Unknown error sending password reset email");
      if (isMountedRef.current) {
        toast({ title: 'Password Reset Error', description: errorResult.message, variant: 'destructive' });
      }
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
    return { error: errorResult };
  };

  const updateUserPassword = async (newPassword: string) => {
    if (!isMountedRef.current) return { error: new Error("Component unmounted") };
    if (!session) {
      toast({ title: 'Error', description: 'No active password recovery session. Please request a new reset link.', variant: 'destructive' });
      return { error: new Error("No active password recovery session.") };
    }

    setLoading(true);
    let errorResult: Error | null = null;

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      errorResult = updateError;

      if (updateError) {
        toast({ title: 'Password Update Failed', description: updateError.message, variant: 'destructive' });
      } else {
        toast({ title: 'Password Updated Successfully', description: 'Your password has been changed. Please log in with your new password.' });
        // Sign out the temporary recovery session. This will trigger onAuthStateChange SIGNED_OUT.
        // No need to await if onAuthStateChange handles redirection and final loading state.
        supabase.auth.signOut().catch(signOutError => {
            console.error("Error during signOut after password update:", signOutError);
            // If signOut itself errors, we might need to manually ensure loading is false
            // and redirect, but onAuthStateChange for SIGNED_OUT should ideally still fire or be handled.
            if (isMountedRef.current) setLoading(false); // Fallback if SIGNED_OUT event doesn't quickly reset
            router.push('/agents/login'); // Fallback redirect
        });
        // router.push('/agents/login') is handled by SIGNED_OUT event in onAuthStateChange
      }
    } catch (e) {
      errorResult = e instanceof Error ? e : new Error("Unknown error updating password");
      if (isMountedRef.current) {
        toast({ title: 'Password Update Error', description: errorResult.message, variant: 'destructive' });
      }
    } finally {
      // setLoading(false) will be handled by the onAuthStateChange for SIGNED_OUT if successful,
      // or if an error occurs before signOut, it should be set here.
      // If updateError occurred but signOut was not called, loading needs to be false.
      if (isMountedRef.current && errorResult) {
        setLoading(false);
      }
      // If no error, onAuthStateChange's SIGNED_OUT should handle setLoading(false).
      // Adding it here too can be a safeguard but might cause a quick flicker if not careful.
      // The current logic for SIGNED_OUT already handles setLoading(false).
    }
    return { error: errorResult };
  };


  const getSupabaseSession = () => {
    return session;
  };

  const isPropertySaved = useCallback((propertyId: string): boolean => {
    if (user && user.role === 'user') {
        return ((user as GeneralUser).savedPropertyIds || []).includes(propertyId);
    }
    return false;
  }, [user]);

  const toggleSaveProperty = useCallback(async (propertyId: string) => {
    if (!session?.user || !user || user.role !== 'user') {
      toast({
        title: "Login Required",
        description: "You need to be logged in as a user to save properties.",
        variant: "default",
      });
      router.push('/agents/login'); 
      return;
    }

    const generalUser = user as GeneralUser;
    const currentlySaved = (generalUser.savedPropertyIds || []).includes(propertyId);
    let updatedSavedIds: string[];
    let toastMessage = "";

    if (!isMountedRef.current) return;
    // No setLoading(true) here as this is a quick UI update, not a full page load indicator
    try {
      if (currentlySaved) {
        const { error } = await supabase
          .from('saved_properties')
          .delete()
          .match({ user_id: generalUser.id, property_id: propertyId });

        if (error) {
          console.error('Error unsaving property:', error.message);
          toast({ title: 'Error', description: 'Could not unsave property. ' + error.message, variant: 'destructive' });
          return;
        }
        updatedSavedIds = (generalUser.savedPropertyIds || []).filter(id => id !== propertyId);
        toastMessage = "Property removed from saved items.";
      } else {
        const { error } = await supabase
          .from('saved_properties')
          .insert({ user_id: generalUser.id, property_id: propertyId });
        
        if (error) {
          console.error('Error saving property:', error.message);
          toast({ title: 'Error', description: 'Could not save property. ' + error.message, variant: 'destructive' });
          return;
        }
        updatedSavedIds = [...(generalUser.savedPropertyIds || []), propertyId];
        toastMessage = "Property saved!";
      }
      
      const updatedUser: GeneralUser = { ...generalUser, savedPropertyIds: updatedSavedIds };
      if(isMountedRef.current) setUser(updatedUser); 
      
      toast({ title: toastMessage });
    } catch (e) {
      console.error("Error in toggleSaveProperty:", e);
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive"});
    }
    // No setLoading(false) here
  }, [session, user, router, toast]);


  return (
    <AuthContext.Provider value={{
      isAuthenticated: !!user && !!session, 
      user,
      loading,
      isPropertySaved,
      toggleSaveProperty,
      signInWithPassword,
      signUpUser,
      signUpAgent,
      signOut,
      sendPasswordResetEmail,
      updateUserPassword,
      getSupabaseSession
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
