
"use client";

import type { AuthenticatedUser, GeneralUser, Agent, PlatformAdmin, UserRole } from '@/lib/types';
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
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
  getSupabaseSession: () => Session | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const router = useRouter();
  const { toast } = useToast();

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
      toast({ title: 'Profile Not Found', description: 'Your user profile could not be found. This might happen if registration was interrupted. Please contact support or try re-registering.', variant: 'destructive'});
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
        // Non-critical, proceed with empty saved properties
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
    let isMounted = true;

    const initializeAuth = async () => {
      if (!isMounted) return;
      setLoading(true);
      try {
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Error getting initial session:", sessionError);
          if (isMounted) {
            setUser(null);
            setSession(null);
          }
          return;
        }

        if (isMounted) setSession(initialSession);

        if (initialSession?.user) {
          const profile = await fetchUserProfileAndRelatedData(initialSession.user);
          if (isMounted) setUser(profile);
        } else {
          if (isMounted) setUser(null);
        }
      } catch (error) {
        console.error("Unhandled error during auth initialization:", error);
        if (isMounted) {
          setUser(null);
          setSession(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, currentSession: Session | null) => {
        if (!isMounted) return;

        setSession(currentSession);

        if (event === 'SIGNED_IN' && currentSession?.user) {
          setLoading(true);
          try {
            const profile = await fetchUserProfileAndRelatedData(currentSession.user);
            if (isMounted) setUser(profile);
            if (profile) {
              if (profile.role === 'agent') router.push('/agents/dashboard');
              else if (profile.role === 'platform_admin') router.push('/admin/dashboard');
              else router.push('/users/dashboard');
            } else {
               console.warn("Profile fetch failed after SIGNED_IN event. User might be stuck or profile missing.");
            }
          } catch (e) { 
            console.error("Error on SIGNED_IN profile fetch:", e); 
            if (isMounted) setUser(null); 
          } finally { 
            if (isMounted) setLoading(false); 
          }
        } else if (event === 'SIGNED_OUT') {
          if (isMounted) {
            setUser(null);
            router.push('/');
            // No explicit setLoading for SIGNED_OUT as UI usually just updates to logged-out state
          }
        } else if (event === 'USER_UPDATED' && currentSession?.user) {
          setLoading(true);
          try {
            const profile = await fetchUserProfileAndRelatedData(currentSession.user);
            if (isMounted) setUser(profile);
          } catch (e) { 
            console.error("Error on USER_UPDATED profile fetch:", e); 
            // Potentially keep old profile or set to null based on error type
            // For now, just log. setUser(null) might be too drastic.
          } finally { 
            if (isMounted) setLoading(false); 
          }
        }
      }
    );

    return () => {
      isMounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, [fetchUserProfileAndRelatedData, router]); // Removed 'user' from dependency array


  const signInWithPassword = async (email: string, password: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({ title: 'Login Failed', description: error.message, variant: 'destructive' });
      setLoading(false); 
    }
    // If no error, onAuthStateChange 'SIGNED_IN' event will handle further state and loading
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
          // avatar_url is not set here, can be updated later by user
        });

      if (profileError) {
        const pgError = profileError as PostgrestError;
        console.error("Error creating profile during signup. Message:", pgError.message);
        console.error("Error creating profile during signup. Details:", pgError.details);
        console.error("Error creating profile during signup. Hint:", pgError.hint);
        console.error("Error creating profile during signup. Code:", pgError.code);
        console.error("Full profileError object:", pgError);
        toast({ title: 'Profile Creation Failed', description: `Profile creation failed: ${pgError.message || 'Unknown error, see console.'}. Please contact support.`, variant: 'destructive' });
        
        console.warn("Orphaned auth user might exist due to profile creation failure. ID:", signUpData.user.id);
        // Important: Attempt to clean up the auth user if profile creation fails
        // This requires admin privileges and is complex to do from client-side securely.
        // Best to log and advise manual cleanup or retry.
        // For now, signing out the partially created user.
        await supabase.auth.signOut(); 
        return { error: profileError, data: null };
      }
      if (signUpData.user.identities && signUpData.user.identities.length === 0) {
        // This case indicates a potential issue like user already exists but is unconfirmed
        toast({ title: 'Registration Incomplete', description: `There was an issue. If you've registered before, try logging in or check your email for verification.`, variant: 'destructive' });
      } else {
        toast({ title: 'Registration Almost Complete!', description: `Welcome, ${profileSpecificData.name}! Please check your email (${email}) to verify your account.` });
      }
    } else {
      // This case (no user data after successful signUp call) should be rare.
      toast({ title: 'Registration Issue', description: 'Could not complete registration. Please try again.', variant: 'destructive' });
      return { error: new Error("User data not returned from signup"), data: null };
    }
    return { error: null, data: signUpData };
  };

  const signUpUser = async (name: string, email: string, password: string) => {
    setLoading(true);
    const result = await commonSignUp(email, password, 'user', { name });
    if(result.error) setLoading(false); // Ensure loading is false if signUp process fails early
    return result;
  };

  const signUpAgent = async (name: string, email: string, password: string, phone: string, agency?: string) => {
    setLoading(true);
    const result = await commonSignUp(email, password, 'agent', { name, phone, agency });
    if(result.error) setLoading(false); // Ensure loading is false if signUp process fails early
    return result;
  };

  const signOut = async () => {
    // setLoading(true); // Not strictly needed for signOut itself for Navbar UI
    const { error } = await supabase.auth.signOut();
    if (error) {
        toast({ title: 'Logout Failed', description: error.message, variant: 'destructive' });
        // setLoading(false); // Only if set true above
    } else {
        toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
    }
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

    // No global setLoading(true/false) here, this is a specific action, not auth loading.
    // Individual components can show their own loading state for this action if needed.

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
    setUser(updatedUser); // Update local user state immediately
    
    toast({ title: toastMessage });

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
