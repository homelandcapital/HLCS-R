
"use client";

import type { AuthenticatedUser, GeneralUser, Agent, PlatformAdmin, UserRole } from '@/lib/types';
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { useRouter, usePathname }  from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';
import type { AuthChangeEvent, Session, User as SupabaseAuthUser, PostgrestError } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

type UserProfile = Database['public']['Tables']['users']['Row'];

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthenticatedUser | null;
  loading: boolean; // True ONLY during initial auth resolution
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
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
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

    if (!isMountedRef.current) return null;

    if (profileQueryError) {
      const pgError = profileQueryError as PostgrestError;
      console.error('[AuthContext] Error fetching profile:', pgError.message);
      toast({ title: 'Profile Error', description: `Could not load your profile data. ${pgError.message || 'Please check console.'}`, variant: 'destructive'});
      return null;
    }

    if (!userProfilesData || userProfilesData.length === 0) {
      const { data: { session: activeSession } } = await supabase.auth.getSession();
      if (activeSession) {
         toast({ title: 'Profile Not Found', description: 'Your user profile could not be found. Please contact support.', variant: 'destructive'});
      }
      return null;
    }
    if (userProfilesData.length > 1) {
      console.error('[AuthContext] Multiple user profiles found for id:', supabaseUser.id);
      return null;
    }

    const baseProfile = userProfilesData[0] as UserProfile;
    let authenticatedUserToSet: AuthenticatedUser;

    if (baseProfile.role === 'user') {
      const { data: savedPropsData, error: savedPropsError } = await supabase
        .from('saved_properties')
        .select('property_id')
        .eq('user_id', baseProfile.id);
      if (!isMountedRef.current) return null;
      if (savedPropsError) console.error('[AuthContext] Error fetching saved properties:', savedPropsError.message);
      const savedPropertyIds = savedPropsData ? savedPropsData.map(sp => sp.property_id) : [];
      authenticatedUserToSet = { ...baseProfile, role: 'user', savedPropertyIds } as GeneralUser;
    } else if (baseProfile.role === 'agent') {
      authenticatedUserToSet = { ...baseProfile, role: 'agent', phone: baseProfile.phone || '' } as Agent;
    } else if (baseProfile.role === 'platform_admin') {
      authenticatedUserToSet = { ...baseProfile, role: 'platform_admin' } as PlatformAdmin;
    } else {
      console.error('[AuthContext] Unknown user role in profile:', baseProfile.role);
      return null;
    }
    return authenticatedUserToSet;
  }, [toast]);


  useEffect(() => {
    // This effect handles the initial authentication check.
    const checkInitialSession = async () => {
      if (!isMountedRef.current) return;
      const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
      if (!isMountedRef.current) { setLoading(false); return; }

      if (sessionError) {
        console.error("[AuthContext] Error getting initial session:", sessionError.message);
        setUser(null);
        setSession(null);
      } else if (initialSession?.user) {
        setSession(initialSession);
        const profile = await fetchUserProfileAndRelatedData(initialSession.user);
        if (isMountedRef.current) setUser(profile);
      } else {
        setUser(null);
        setSession(null);
      }
      if (isMountedRef.current) setLoading(false);
    };

    checkInitialSession();

    // This effect sets up the onAuthStateChange listener.
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, currentSession: Session | null) => {
        if (!isMountedRef.current) return;
        setSession(currentSession);

        if (event === 'INITIAL_SESSION' && currentSession?.user) {
          // Already handled by checkInitialSession if it ran first, but good as a fallback.
          // No need to set loading here as checkInitialSession would have done it.
          const profile = await fetchUserProfileAndRelatedData(currentSession.user);
          if (isMountedRef.current) setUser(profile);
        } else if (event === 'SIGNED_IN' && currentSession?.user) {
          const profile = await fetchUserProfileAndRelatedData(currentSession.user);
          if (isMountedRef.current) {
            setUser(profile);
            if (profile) {
              if (profile.role === 'agent') router.push('/agents/dashboard');
              else if (profile.role === 'platform_admin') router.push('/admin/dashboard');
              else router.push('/users/dashboard');
            }
          }
        } else if (event === 'SIGNED_OUT') {
          if (isMountedRef.current) setUser(null);
          // Navigation for explicit sign out is handled in signOutUser
        } else if (event === 'USER_UPDATED' && currentSession?.user) {
          const profile = await fetchUserProfileAndRelatedData(currentSession.user);
          if (isMountedRef.current) setUser(profile);
        } else if (event === 'TOKEN_REFRESHED') {
            if (currentSession?.user && currentSession.user.id !== user?.id) {
                const profile = await fetchUserProfileAndRelatedData(currentSession.user);
                 if (isMountedRef.current) setUser(profile);
            } else if (!currentSession?.user && user) {
                if (isMountedRef.current) setUser(null);
            }
        }
      }
    );
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [fetchUserProfileAndRelatedData, router, user?.id]); // Added user.id to deps for TOKEN_REFRESHED case

  useEffect(() => {
    if (!loading && user && (pathname === '/agents/login' || pathname === '/agents/register')) {
      if (user.role === 'agent') router.push('/agents/dashboard');
      else if (user.role === 'platform_admin') router.push('/admin/dashboard');
      else router.push('/users/dashboard');
    }
  }, [user, loading, pathname, router]);


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
        console.error("[AuthContext] commonSignUp: Error creating profile.", pgError.message);
        
        if (pgError.code === '23505') {
          toast({ title: 'Email Already Registered', description: 'This email address is already in use.', variant: 'destructive' });
        } else {
          toast({ title: 'Profile Creation Failed', description: `Contact support: ${pgError.message}.`, variant: 'destructive' });
        }
        
        supabase.auth.signOut().then(() => supabase.auth.admin.deleteUser(signUpData.user!.id)).catch(delErr => {
            console.error("[AuthContext] commonSignUp: Error during cleanup after profile creation failure:", delErr);
        });
        return { error: profileError as Error, data: null };
      }

      if (signUpData.session === null && signUpData.user.identities && signUpData.user.identities.length > 0) {
        toast({ title: 'Registration Almost Complete!', description: `Welcome, ${profileSpecificData.name}! Please check your email (${email}) to verify your account.`, duration: 9000 });
      }
    } else {
      toast({ title: 'Registration Issue', description: 'Could not complete registration. Please try again.', variant: 'destructive' });
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

  const signOutUser = async (): Promise<void> => {
    if (!isMountedRef.current) return Promise.resolve();

    const { data: { session: currentAuthSession } } = await supabase.auth.getSession();

    if (currentAuthSession) {
      try {
        const { error: signOutServiceError } = await supabase.auth.signOut();
        if (signOutServiceError) {
          // Only toast if it's not an "Auth session missing" error, which we are trying to avoid
          if (!(signOutServiceError.message.includes("Auth session missing") || signOutServiceError.message.includes("No active session"))) {
            console.error("[AuthContext] signOut: Supabase signOut service error:", signOutServiceError);
            toast({ title: 'Logout Failed', description: signOutServiceError.message, variant: 'destructive' });
          }
        }
      } catch (thrownError: any) {
         if (!(thrownError.message.includes("Auth session missing") || thrownError.message.includes("No active session"))) {
            console.error("[AuthContext] signOut: Exception during Supabase signOut:", thrownError);
            toast({ title: 'Logout Error', description: thrownError.message || 'An unexpected error occurred.', variant: 'destructive' });
         }
      }
    }
    // Always perform local cleanup and navigation
    if (isMountedRef.current) {
      setUser(null);
      setSession(null);
      router.push('/');
      // Only show success toast if there was potentially a session to sign out from,
      // or if the user object was previously non-null, indicating they were logged in.
      if (user || currentAuthSession) {
        toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
      }
    }
  };

  const sendPasswordResetEmail = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/update-password` });
    if (error) {
      toast({ title: 'Password Reset Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Password Reset Email Sent', description: 'If an account exists, a reset link has been sent.', duration: 9000 });
    }
    return { error };
  };

  const updateUserPassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast({ title: 'Password Update Failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Password Updated', description: 'Please log in with your new password.' });
      await supabase.auth.signOut(); // This will trigger SIGNED_OUT event
    }
    return { error };
  };

  const getSupabaseSession = () => {
    return session;
  };

  const isPropertySaved = useCallback((propertyId: string): boolean => {
    return !!(user && user.role === 'user' && (user as GeneralUser).savedPropertyIds?.includes(propertyId));
  }, [user]);

  const toggleSaveProperty = useCallback(async (propertyId: string) => {
    if (!user || user.role !== 'user') {
      toast({ title: "Login Required", description: "Log in as a user to save properties." });
      router.push('/agents/login');
      return;
    }

    const generalUser = user as GeneralUser;
    const currentlySaved = (generalUser.savedPropertyIds || []).includes(propertyId);
    let updatedSavedIds: string[];

    try {
      if (currentlySaved) {
        const { error } = await supabase.from('saved_properties').delete().match({ user_id: generalUser.id, property_id: propertyId });
        if (error) throw error;
        updatedSavedIds = (generalUser.savedPropertyIds || []).filter(id => id !== propertyId);
        toast({ title: "Property Unsaved" });
      } else {
        const { error } = await supabase.from('saved_properties').insert({ user_id: generalUser.id, property_id: propertyId });
        if (error) throw error;
        updatedSavedIds = [...(generalUser.savedPropertyIds || []), propertyId];
        toast({ title: "Property Saved!" });
      }
      if (isMountedRef.current) setUser({ ...generalUser, savedPropertyIds: updatedSavedIds });
    } catch (error: any) {
      console.error('[AuthContext] Error toggling save property:', error.message);
      toast({ title: 'Error Saving Property', description: error.message, variant: 'destructive' });
    }
  }, [user, router, toast]);

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
      signOut: signOutUser,
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
