
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
  const [loading, setLoading] = useState(true); // This is the main loading state for initial auth determination
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    // console.log('[AuthContext] Component mounted.');
    return () => {
      isMountedRef.current = false;
      // console.log('[AuthContext] Component unmounted.');
    };
  }, []);

  const fetchUserProfileAndRelatedData = useCallback(async (supabaseUser: SupabaseAuthUser): Promise<AuthenticatedUser | null> => {
    // console.log(`[AuthContext] fetchUserProfileAndRelatedData: Called for user ${supabaseUser.id}.`);

    const { data: userProfilesData, error: profileQueryError } = await supabase
      .from('users')
      .select('*')
      .eq('id', supabaseUser.id);

    if (!isMountedRef.current) return null;

    if (profileQueryError) {
      const pgError = profileQueryError as PostgrestError;
      console.error('[AuthContext] fetchUserProfileAndRelatedData: Error fetching profile.', pgError.message);
      toast({ title: 'Profile Error', description: `Could not load your profile data. ${pgError.message || 'Please check console.'}`, variant: 'destructive'});
      return null;
    }

    if (!userProfilesData || userProfilesData.length === 0) {
      console.warn('[AuthContext] fetchUserProfileAndRelatedData: User profile not found for id:', supabaseUser.id);
      const { data: { session: activeSession } } = await supabase.auth.getSession();
      if (activeSession) {
         toast({ title: 'Profile Not Found', description: 'Your user profile could not be found. Please contact support.', variant: 'destructive'});
      }
      return null;
    }
    if (userProfilesData.length > 1) {
      console.error('[AuthContext] fetchUserProfileAndRelatedData: Multiple user profiles found for id:', supabaseUser.id);
      // This shouldn't happen with unique constraints but good to log.
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
      if (savedPropsError) console.error('[AuthContext] fetchUserProfileAndRelatedData: Error fetching saved properties:', savedPropsError.message);
      const savedPropertyIds = savedPropsData ? savedPropsData.map(sp => sp.property_id) : [];
      authenticatedUserToSet = { ...baseProfile, role: 'user', savedPropertyIds } as GeneralUser;
    } else if (baseProfile.role === 'agent') {
      authenticatedUserToSet = { ...baseProfile, role: 'agent', phone: baseProfile.phone || '' } as Agent;
    } else if (baseProfile.role === 'platform_admin') {
      authenticatedUserToSet = { ...baseProfile, role: 'platform_admin' } as PlatformAdmin;
    } else {
      console.error('[AuthContext] fetchUserProfileAndRelatedData: Unknown user role in profile:', baseProfile.role);
      return null;
    }
    // console.log(`[AuthContext] fetchUserProfileAndRelatedData: Successfully fetched profile for ${supabaseUser.id}.`);
    return authenticatedUserToSet;
  }, [toast]);


  useEffect(() => {
    // This effect handles the initial authentication check and sets up the listener.
    const performInitialAuthAndSetupListener = async () => {
      if (!isMountedRef.current) return;
      // console.log('[AuthContext] InitialEffect: Starting initial auth check and listener setup.');
      setLoading(true);

      // 1. Perform initial session check
      const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();

      if (!isMountedRef.current) { setLoading(false); return; }

      if (sessionError) {
        console.error("[AuthContext] InitialEffect: Error getting initial session:", sessionError.message);
        setUser(null);
        setSession(null);
      } else if (initialSession?.user) {
        // console.log('[AuthContext] InitialEffect: Initial session found. User:', initialSession.user.id);
        setSession(initialSession);
        const profile = await fetchUserProfileAndRelatedData(initialSession.user);
        if (isMountedRef.current) setUser(profile);
      } else {
        // console.log('[AuthContext] InitialEffect: No initial session.');
        setUser(null);
        setSession(null);
      }

      if (isMountedRef.current) {
        setLoading(false); // Initial auth determination complete
        // console.log('[AuthContext] InitialEffect: Initial auth check complete. loading: false.');
      }

      // 2. Setup Auth State Change Listener
      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (event: AuthChangeEvent, currentSession: Session | null) => {
          if (!isMountedRef.current) return;
          // console.log(`[AuthContext] onAuthStateChange: Event: ${event}, CurrentSession: ${!!currentSession}, User: ${currentSession?.user?.id || 'N/A'}`);
          
          setSession(currentSession); // Always update session state

          if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
            if (currentSession?.user) {
              // console.log(`[AuthContext] onAuthStateChange (${event}): User ${currentSession.user.id} present. Fetching/updating profile.`);
              const profile = await fetchUserProfileAndRelatedData(currentSession.user);
              if (isMountedRef.current) {
                setUser(profile);
                if (event === 'SIGNED_IN' && profile) {
                  // console.log(`[AuthContext] onAuthStateChange: SIGNED_IN successful for role ${profile.role}, redirecting...`);
                  if (profile.role === 'agent') router.push('/agents/dashboard');
                  else if (profile.role === 'platform_admin') router.push('/admin/dashboard');
                  else router.push('/users/dashboard');
                }
              }
            } else {
              if (isMountedRef.current) setUser(null);
            }
          } else if (event === 'SIGNED_OUT') {
            if (isMountedRef.current) setUser(null);
            // Navigation is handled by the signOut function itself
          } else if (event === 'TOKEN_REFRESHED') {
              if (currentSession?.user && currentSession.user.id !== user?.id) {
                  // console.log(`[AuthContext] onAuthStateChange (TOKEN_REFRESHED): User ID changed to ${currentSession.user.id}. Re-fetching profile.`);
                  const profile = await fetchUserProfileAndRelatedData(currentSession.user);
                   if (isMountedRef.current) setUser(profile);
              } else if (!currentSession?.user && user) { // User was present, but now session has no user
                  // console.log(`[AuthContext] onAuthStateChange (TOKEN_REFRESHED): No user in refreshed session. Clearing local user.`);
                  if (isMountedRef.current) setUser(null);
              }
          }
          // No primary setLoading toggles here after initial load.
        }
      );
      return () => {
        // console.log('[AuthContext] Cleaning up auth listener.');
        authListener?.subscription.unsubscribe();
      };
    };

    performInitialAuthAndSetupListener();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchUserProfileAndRelatedData, router]); // user?.id was removed to prevent loops on user object change itself.
                                                // fetchUserProfileAndRelatedData and router are stable.

  // This effect handles redirection IF a user is already logged in and tries to access auth pages.
  useEffect(() => {
    if (!loading && user && (pathname === '/agents/login' || pathname === '/agents/register')) {
      // console.log(`[AuthContext] RedirectEffect: User is authenticated and on auth page. Redirecting.`);
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
    // On success, onAuthStateChange will update user/session and handle navigation.
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
        
        if (pgError.code === '23505') { // Unique violation
          toast({ title: 'Email Already Registered', description: 'This email address is already in use.', variant: 'destructive' });
        } else {
          toast({ title: 'Profile Creation Failed', description: `Contact support: ${pgError.message}.`, variant: 'destructive' });
        }
        
        // Attempt to clean up the auth user if profile creation failed
        supabase.auth.signOut().then(() => supabase.auth.admin.deleteUser(signUpData.user!.id)).catch(delErr => {
            console.error("[AuthContext] commonSignUp: Error during cleanup after profile creation failure:", delErr);
        });
        return { error: profileError as Error, data: null };
      }

      if (signUpData.session === null && signUpData.user.identities && signUpData.user.identities.length > 0) {
        toast({ title: 'Registration Almost Complete!', description: `Welcome, ${profileSpecificData.name}! Please check your email (${email}) to verify your account.`, duration: 9000 });
      }
      // If session is present (auto-verification or already verified), onAuthStateChange handles it.
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
    // console.log('[AuthContext] signOut: Initiating sign out.');
    // setLoading(true); // No, main loading is for initial app load. SignOut is an action.

    try {
      const { error: signOutServiceError } = await supabase.auth.signOut();
      if (signOutServiceError) {
        console.error("[AuthContext] signOut: Supabase signOut service error:", signOutServiceError);
        // Don't necessarily show error if already signed out or session missing
        if (!(signOutServiceError.message.includes("Auth session missing") || signOutServiceError.message.includes("No active session"))) {
            toast({ title: 'Logout Failed', description: signOutServiceError.message, variant: 'destructive' });
        }
      }
       // Toast for successful logout can be here or after state update
    } catch (thrownError: any) {
      console.error("[AuthContext] signOut: Exception during Supabase signOut:", thrownError);
      if (!(thrownError.message.includes("Auth session missing") || thrownError.message.includes("No active session"))) {
        toast({ title: 'Logout Error', description: thrownError.message || 'An unexpected error occurred.', variant: 'destructive' });
      }
    } finally {
      if (isMountedRef.current) {
        setUser(null);
        setSession(null);
        router.push('/'); // Navigate after state is cleared
        toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
        // setLoading(false); // No, main loading is for initial app load.
        // console.log('[AuthContext] signOut: Complete.');
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
      // onAuthStateChange will trigger SIGNED_OUT effectively if the session is invalidated by password change
      // or force a sign out to ensure clean state
      await supabase.auth.signOut();
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
      console.error('[AuthContext] toggleSaveProperty: Error:', error.message);
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

