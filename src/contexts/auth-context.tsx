
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

      if (savedPropsError) console.error('Error fetching saved properties:', savedPropsError.message);
      const savedPropertyIds = savedPropsData ? savedPropsData.map(sp => sp.property_id) : [];
      authenticatedUser = { ...baseProfile, role: 'user', savedPropertyIds } as GeneralUser;
    } else if (baseProfile.role === 'agent') {
      authenticatedUser = { ...baseProfile, role: 'agent', phone: baseProfile.phone || '' } as Agent;
    } else if (baseProfile.role === 'platform_admin') {
      authenticatedUser = { ...baseProfile, role: 'platform_admin' } as PlatformAdmin;
    } else {
      console.error('Unknown user role in profile:', baseProfile.role);
      toast({ title: 'Profile Error', description: `Unknown user role: ${baseProfile.role}.`, variant: 'destructive'});
      return null;
    }
    return authenticatedUser;
  }, [toast]);


  useEffect(() => {
    const performInitialAuthCheckInternal = async (): Promise<{ user: AuthenticatedUser | null, session: Session | null, errorOccurred: boolean }> => {
        try {
            const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();

            if (!isMountedRef.current) return { user: null, session: null, errorOccurred: true };

            if (sessionError) {
                console.error("Error getting initial session:", sessionError.message);
                return { user: null, session: null, errorOccurred: true };
            }

            if (initialSession?.user) {
                const profile = await fetchUserProfileAndRelatedData(initialSession.user);
                return { user: profile, session: initialSession, errorOccurred: !profile };
            } else {
                return { user: null, session: initialSession, errorOccurred: false };
            }
        } catch (error: any) {
            console.error("Unhandled error during initial auth check internal function:", error.message, error.stack, error);
            return { user: null, session: null, errorOccurred: true };
        }
    };

    performInitialAuthCheckInternal()
      .then(result => {
        if (isMountedRef.current) {
          setUser(result.user);
          setSession(result.session);
        }
      })
      .catch(error => {
        console.error("Critical error in performInitialAuthCheckInternal promise chain:", error);
        if (isMountedRef.current) {
          setUser(null);
          setSession(null);
        }
      })
      .finally(() => {
        if (isMountedRef.current) {
          setLoading(false);
        }
      });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, currentSession: Session | null) => {
        if (!isMountedRef.current) return;

        setSession(currentSession);

        if (event === 'SIGNED_IN' && currentSession?.user) {
          if (isMountedRef.current) setLoading(true);
          try {
            const profile = await fetchUserProfileAndRelatedData(currentSession.user);
            if (isMountedRef.current) setUser(profile);
            if (profile) {
              if (profile.role === 'agent') router.push('/agents/dashboard');
              else if (profile.role === 'platform_admin') router.push('/admin/dashboard');
              else router.push('/users/dashboard');
            } else {
               console.warn("Profile fetch failed after SIGNED_IN event. User not redirected.");
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
            // Navigation to home is handled by the signOut function's finally block now
          }
        } else if (event === 'USER_UPDATED' && currentSession?.user) {
          if (isMountedRef.current) setLoading(true);
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
            setLoading(false);
            router.push('/update-password');
          }
        } else if (event === 'INITIAL_SESSION') {
            if (!currentSession?.user && !loading && isMountedRef.current) {
              // Handled by performInitialAuthCheckInternal.finally
            }
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [fetchUserProfileAndRelatedData, router]);


  const signInWithPassword = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({ title: 'Login Failed', description: error.message, variant: 'destructive' });
    }
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
          console.warn(`Profile creation failed for auth user: ${signUpData.user.id}. Attempting to sign out user from auth table for cleanup.`);
          supabase.auth.signOut().catch(signOutCleanupError => {
            console.error("Error during cleanup signOut after profile creation failure:", signOutCleanupError);
          });
        }
        return { error: profileError as Error, data: null };
      }

      if (signUpData.session === null && signUpData.user.identities && signUpData.user.identities.length > 0) {
        toast({ title: 'Registration Almost Complete!', description: `Welcome, ${profileSpecificData.name}! Please check your email (${email}) to verify your account.` });
      } else if (signUpData.session) {
        // Handled by onAuthStateChange
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
    return await commonSignUp(email, password, 'user', { name });
  };

  const signUpAgent = async (name: string, email: string, password: string, phone: string, agency?: string) => {
     return await commonSignUp(email, password, 'agent', { name, phone, agency });
  };

  const signOut = async (): Promise<void> => {
    if (!isMountedRef.current) return Promise.resolve();
    setLoading(true);

    try {
      const { error: signOutServiceError } = await supabase.auth.signOut();

      if (signOutServiceError) {
        // This branch handles errors returned as a property of the result object.
        console.error("Supabase signOut service error:", signOutServiceError);
        if (isMountedRef.current) {
            if (signOutServiceError.message.toLowerCase().includes("auth session missing") || 
                signOutServiceError.message.toLowerCase().includes("no active session")) {
              toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
            } else {
              toast({ title: 'Logout Failed', description: signOutServiceError.message, variant: 'destructive' });
            }
        }
      } else {
        // No error property returned, successful signOut from Supabase.
        if (isMountedRef.current) {
          toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
        }
      }
    } catch (thrownError: any) {
      // This branch handles errors THROWN by supabase.auth.signOut().
      console.error("Exception during Supabase signOut:", thrownError);
      if (isMountedRef.current) {
          if (thrownError.name === 'AuthSessionMissingError' || 
              (thrownError.message && (thrownError.message.toLowerCase().includes("auth session missing") || thrownError.message.toLowerCase().includes("no active session")))) {
            toast({ title: 'Logged Out', description: 'You have been successfully logged out (session was already clear).' });
          } else {
            toast({ title: 'Logout Error', description: thrownError.message || 'An unexpected error occurred during logout.', variant: 'destructive' });
          }
      }
    } finally {
      // This block will always execute.
      if (isMountedRef.current) {
        setUser(null);
        setSession(null);
        router.push('/'); // Ensure navigation happens here.
        setLoading(false);
      }
    }
  };

  const sendPasswordResetEmail = async (email: string) => {
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
    }
    return { error: errorResult };
  };

  const updateUserPassword = async (newPassword: string) => {
    if (!session) {
      toast({ title: 'Error', description: 'No active password recovery session. Please request a new reset link.', variant: 'destructive' });
      return { error: new Error("No active password recovery session.") };
    }

    let errorResult: Error | null = null;
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      errorResult = updateError;

      if (updateError) {
        toast({ title: 'Password Update Failed', description: updateError.message, variant: 'destructive' });
      } else {
        toast({ title: 'Password Updated Successfully', description: 'Your password has been changed. Please log in with your new password.' });
        // Sign out after successful password update in recovery flow
        // The onAuthStateChange listener will handle redirection to login/home on SIGNED_OUT.
        supabase.auth.signOut().catch(signOutError => {
            console.error("Error during signOut after password update:", signOutError);
        });
      }
    } catch (e) {
      errorResult = e instanceof Error ? e : new Error("Unknown error updating password");
      if (isMountedRef.current) {
        toast({ title: 'Password Update Error', description: errorResult.message, variant: 'destructive' });
      }
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
