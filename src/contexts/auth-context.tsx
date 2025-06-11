
"use client";

import type { AuthenticatedUser, GeneralUser, Agent, PlatformAdmin, UserRole } from '@/lib/types';
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';
import type { AuthChangeEvent, Session, User as SupabaseAuthUser, PostgrestError, AuthApiError } from '@supabase/supabase-js';
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
  const initialCheckPerformedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchUserProfileAndRelatedData = useCallback(async (supabaseUser: SupabaseAuthUser): Promise<AuthenticatedUser | null> => {
    if (!isMountedRef.current) return null;
    console.log(`[AuthContext] fetchUserProfileAndRelatedData: Called for user ${supabaseUser.id} at ${new Date().toISOString()}`);
    const functionStartTime = Date.now();

    let profile: AuthenticatedUser | null = null;
    try {
      console.log(`[AuthContext] fetchUserProfileAndRelatedData: Querying 'users' table for ${supabaseUser.id} at ${new Date().toISOString()}`);
      const usersQueryStartTime = Date.now();
      const { data: userProfilesData, error: profileQueryError } = await supabase
        .from('users')
        .select('*')
        .eq('id', supabaseUser.id);
      const usersQueryEndTime = Date.now();
      console.log(`[AuthContext] fetchUserProfileAndRelatedData: 'users' table query for ${supabaseUser.id} completed in ${usersQueryEndTime - usersQueryStartTime}ms.`);
      console.log('[AuthContext] userProfilesData:', userProfilesData);


      if (profileQueryError) {
        const pgError = profileQueryError as PostgrestError;
        console.error('[AuthContext] fetchUserProfileAndRelatedData: Error fetching user profile. Message:', pgError.message, 'Details:', pgError.details, 'Hint:', pgError.hint, 'Code:', pgError.code);
        if (isMountedRef.current) toast({ title: 'Profile Error', description: `Could not load your profile data. ${pgError.message || 'Please check console for details.'}`, variant: 'destructive'});
        return null;
      }

      if (!userProfilesData || userProfilesData.length === 0) {
        console.warn('[AuthContext] fetchUserProfileAndRelatedData: User profile not found in public.users for id:', supabaseUser.id);
        if (isMountedRef.current) toast({ title: 'Profile Not Found', description: 'Your user profile data is missing. Please contact support or try re-registering.', variant: 'destructive'});
        return null;
      }
      if (userProfilesData.length > 1) {
        console.error('[AuthContext] fetchUserProfileAndRelatedData: Multiple user profiles found for id (data integrity issue):', supabaseUser.id);
        if (isMountedRef.current) toast({ title: 'Profile Error', description: 'Multiple profiles found for your account. Please contact support.', variant: 'destructive'});
        return null;
      }

      const baseProfile = userProfilesData[0] as UserProfile;
      let authenticatedUser: AuthenticatedUser;

      if (baseProfile.role === 'user') {
        console.log(`[AuthContext] fetchUserProfileAndRelatedData: User role is 'user'. Querying 'saved_properties' for ${baseProfile.id} at ${new Date().toISOString()}`);
        const savedPropsQueryStartTime = Date.now();
        const { data: savedPropsData, error: savedPropsError } = await supabase
          .from('saved_properties')
          .select('property_id')
          .eq('user_id', baseProfile.id);
        const savedPropsQueryEndTime = Date.now();
        console.log(`[AuthContext] fetchUserProfileAndRelatedData: 'saved_properties' query for ${baseProfile.id} completed in ${savedPropsQueryEndTime - savedPropsQueryStartTime}ms.`);

        if (savedPropsError) console.error('[AuthContext] fetchUserProfileAndRelatedData: Error fetching saved properties:', savedPropsError.message);
        const savedPropertyIds = savedPropsData ? savedPropsData.map(sp => sp.property_id) : [];
        authenticatedUser = { ...baseProfile, role: 'user', savedPropertyIds } as GeneralUser;
      } else if (baseProfile.role === 'agent') {
        authenticatedUser = { ...baseProfile, role: 'agent', phone: baseProfile.phone || '' } as Agent;
      } else if (baseProfile.role === 'platform_admin') {
        authenticatedUser = { ...baseProfile, role: 'platform_admin' } as PlatformAdmin;
      } else {
        console.error('[AuthContext] fetchUserProfileAndRelatedData: Unknown user role in profile:', baseProfile.role);
        if (isMountedRef.current) toast({ title: 'Profile Error', description: `Unknown user role: ${baseProfile.role}.`, variant: 'destructive'});
        return null;
      }
      profile = authenticatedUser;
    } catch (error: any) {
        console.error(`[AuthContext] fetchUserProfileAndRelatedData: Unexpected error during profile processing for ${supabaseUser.id}:`, error.message, error);
        if (isMountedRef.current) toast({ title: 'Profile Processing Error', description: `An unexpected error occurred: ${error.message}`, variant: 'destructive'});
        return null;
    } finally {
        const functionEndTime = Date.now();
        if (profile) {
            console.log(`[AuthContext] fetchUserProfileAndRelatedData: Successfully fetched and processed profile for ${supabaseUser.id} in ${functionEndTime - functionStartTime}ms.`);
        } else {
            console.log(`[AuthContext] fetchUserProfileAndRelatedData: Finished with no profile for ${supabaseUser.id} in ${functionEndTime - functionStartTime}ms.`);
        }
    }
    return profile;
  }, [toast]);


  const performInitialAuthCheckInternal = useCallback(async (): Promise<{ user: AuthenticatedUser | null, session: Session | null, errorOccurred: boolean }> => {
    console.log("[AuthContext] performInitialAuthCheckInternal: Starting...");
    try {
      const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
      if (!isMountedRef.current) return { user: null, session: null, errorOccurred: true };

      if (sessionError) {
        console.error("[AuthContext] performInitialAuthCheckInternal: Error getting initial session:", sessionError.message);
        return { user: null, session: null, errorOccurred: true };
      }

      if (initialSession?.user) {
        console.log(`[AuthContext] performInitialAuthCheckInternal: Initial session found. Fetching profile for user: ${initialSession.user.id}`);
        const profile = await fetchUserProfileAndRelatedData(initialSession.user);
        return { user: profile, session: initialSession, errorOccurred: !profile };
      } else {
        console.log("[AuthContext] performInitialAuthCheckInternal: No initial session found.");
        return { user: null, session: initialSession, errorOccurred: false };
      }
    } catch (error: any) {
      console.error("[AuthContext] performInitialAuthCheckInternal: Unhandled error:", error.message, error.stack, error);
      return { user: null, session: null, errorOccurred: true };
    }
  }, [fetchUserProfileAndRelatedData]);

  useEffect(() => {
    if (!initialCheckPerformedRef.current) {
      console.log("[AuthContext] useEffect: Mounting and performing initial auth check.");
      setLoading(true);
      performInitialAuthCheckInternal()
        .then(result => {
          console.log('[AuthContext] performInitialAuthCheckInternal.then result:', { result, isMountedRef: isMountedRef.current });
          if (isMountedRef.current) {
            setUser(result.user);
            setSession(result.session);
          }
        })
        .catch(error => {
          console.error("[AuthContext] useEffect: Critical error in performInitialAuthCheckInternal promise chain:", error);
          if (isMountedRef.current) {
            setUser(null);
            setSession(null);
          }
        })
        .finally(() => {
          if (isMountedRef.current) {
            console.log("[AuthContext] useEffect: Initial auth check complete. setLoading(false).");
            setLoading(false);
            initialCheckPerformedRef.current = true;
          }
        });
    }

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, currentEventSession: Session | null) => {
        if (!isMountedRef.current) {
          console.log("[AuthContext] onAuthStateChange: Unmounted, skipping event:", event);
          return;
        }
        console.log(`[AuthContext] onAuthStateChange: Event: ${event}, Event Session: ${!!currentEventSession}, User in Event Session: ${currentEventSession?.user?.id || 'N/A'}, Time: ${new Date().toISOString()}`);
        
        setSession(currentEventSession); // Update local session state immediately from the event

        if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
          if (isMountedRef.current) {
             console.log(`[AuthContext] onAuthStateChange: Event ${event}. Attempting to verify session with supabase.auth.getUser().`);
             setLoading(true);
          }
          try {
            // Get the most up-to-date user from Supabase Auth
            const { data: { user: verifiedUser }, error: getUserError } = await supabase.auth.getUser();

            if (getUserError) {
              console.error(`[AuthContext] onAuthStateChange: supabase.auth.getUser() error after ${event}:`, getUserError.message);
              if (isMountedRef.current) {
                setUser(null);
                if (getUserError.message.toLowerCase().includes("invalid refresh token") || (getUserError as AuthApiError).status === 401 || (getUserError as AuthApiError).status === 403) {
                  console.log(`[AuthContext] onAuthStateChange: Invalid token detected for event ${event}. Forcing sign out.`);
                  await supabase.auth.signOut(); // This will trigger a SIGNED_OUT event
                } else {
                  setLoading(false);
                }
              }
            } else if (verifiedUser) {
              console.log(`[AuthContext] onAuthStateChange: supabase.auth.getUser() successful after ${event}. User: ${verifiedUser.id}. Fetching profile.`);
              const profile = await fetchUserProfileAndRelatedData(verifiedUser);
              if (isMountedRef.current) {
                setUser(profile);
                if (profile && event === 'SIGNED_IN') {
                    if (profile.role === 'agent') router.push('/agents/dashboard');
                    else if (profile.role === 'platform_admin') router.push('/admin/dashboard');
                    else router.push('/users/dashboard');
                }
              }
            } else { // No verified user from supabase.auth.getUser()
              console.log(`[AuthContext] onAuthStateChange: supabase.auth.getUser() returned no user after ${event}. Treating as signed out.`);
              if (isMountedRef.current) setUser(null);
            }
          } catch (e: any) {
            console.error(`[AuthContext] onAuthStateChange: Unhandled error during ${event} processing:`, e.message);
            if (isMountedRef.current) setUser(null);
          } finally {
            if (isMountedRef.current) {
              console.log(`[AuthContext] onAuthStateChange: Finished processing ${event}. setLoading(false).`);
              setLoading(false);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          if (isMountedRef.current) {
            console.log("[AuthContext] onAuthStateChange: SIGNED_OUT event. Updating state and navigating.");
            setUser(null);
            setSession(null); // Ensure session is also cleared
            setLoading(false); // Final loading state update
            toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
            router.push('/');
          }
        } else if (event === 'PASSWORD_RECOVERY') {
          if (isMountedRef.current) {
            console.log("[AuthContext] onAuthStateChange: PASSWORD_RECOVERY event. User should check email.");
            setLoading(false);
          }
        } else if (event === 'INITIAL_SESSION') {
           console.log("[AuthContext] onAuthStateChange: INITIAL_SESSION event. This is typically handled by performInitialAuthCheckInternal.");
           // If initial check already ran and set loading to false, and no user in currentEventSession, ensure consistency.
           if (initialCheckPerformedRef.current && !currentEventSession?.user && isMountedRef.current && !loading) {
             // setUser(null); // Already handled by performInitialAuthCheckInternal
           }
        }
      }
    );

    return () => {
      console.log("[AuthContext] useEffect: Cleaning up auth listener.");
      isMountedRef.current = false;
      authListener?.subscription.unsubscribe();
    };
  }, [fetchUserProfileAndRelatedData, router, toast, loading]);


  const signInWithPassword = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({ title: 'Login Failed', description: error.message, variant: 'destructive' });
    }
    // onAuthStateChange will handle setting user and loading state.
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
        console.error("[AuthContext] commonSignUp: Error creating profile. Message:", pgError.message, "Details:", pgError.details);
        if (pgError.code === '23505' && pgError.message.includes('users_email_key')) {
          toast({ title: 'Email Already Registered', description: 'This email address is already registered. Please try logging in.', variant: 'destructive'});
        } else {
          toast({ title: 'Profile Creation Failed', description: `Profile creation failed: ${pgError.message || 'Unknown error, see console.'}. Please contact support.`, variant: 'destructive' });
        }
        if (signUpData.user?.id) {
          console.warn(`[AuthContext] commonSignUp: Profile creation failed for auth user: ${signUpData.user.id}. Attempting to sign out user from auth table for cleanup.`);
          supabase.auth.signOut().catch(signOutCleanupError => {
            console.error("[AuthContext] commonSignUp: Error during cleanup signOut after profile creation failure:", signOutCleanupError);
          });
        }
        return { error: profileError as Error, data: null };
      }

      if (signUpData.session === null && signUpData.user.identities && signUpData.user.identities.length > 0) {
        toast({ title: 'Registration Almost Complete!', description: `Welcome, ${profileSpecificData.name}! Please check your email (${email}) to verify your account.` });
      } // SIGNED_IN event will handle session if it exists
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
    console.log("[AuthContext] signOut: Initiating sign out.");
    if (!isMountedRef.current) {
      console.log("[AuthContext] signOut: Component unmounted, skipping sign out.");
      return;
    }
    setLoading(true); 

    try {
      const { error: signOutServiceError } = await supabase.auth.signOut();
      // The onAuthStateChange listener will handle the SIGNED_OUT event for UI updates (setUser, setSession, setLoading, toast, navigation).
      // We only toast an error here if the signOut call itself fails abruptly.
      if (isMountedRef.current && signOutServiceError) {
        console.error("[AuthContext] signOut: Supabase signOut service error:", signOutServiceError.message);
        toast({ title: 'Logout Failed', description: signOutServiceError.message, variant: 'destructive' });
        setLoading(false); // Reset loading if the sign out call failed and SIGNED_OUT event might not fire as expected.
      }
      // If signOutServiceError is null, we expect onAuthStateChange(SIGNED_OUT) to handle everything else.
    } catch (thrownError: any) {
      console.error("[AuthContext] signOut: Exception during Supabase signOut:", thrownError.message);
      if (isMountedRef.current) {
        toast({ title: 'Logout Error', description: thrownError.message || 'An unexpected error occurred during logout.', variant: 'destructive' });
        setLoading(false); // Reset loading if an exception occurred
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
        if (isMountedRef.current) toast({ title: 'Password Reset Error', description: error.message, variant: 'destructive' });
      } else {
        if (isMountedRef.current) toast({ title: 'Password Reset Email Sent', description: 'If an account exists for this email, a reset link has been sent. Please check your inbox (and spam folder).', duration: 9000 });
      }
    } catch (e) {
      errorResult = e instanceof Error ? e : new Error("Unknown error sending password reset email");
      if (isMountedRef.current) toast({ title: 'Password Reset Error', description: errorResult.message, variant: 'destructive' });
    }
    return { error: errorResult };
  };

  const updateUserPassword = async (newPassword: string) => {
    // We rely on Supabase client to use the session from the recovery link
    let errorResult: Error | null = null;
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      errorResult = updateError;

      if (updateError) {
        if (isMountedRef.current) toast({ title: 'Password Update Failed', description: updateError.message, variant: 'destructive' });
      } else {
        if (isMountedRef.current) {
          // Don't toast success here, onAuthStateChange(SIGNED_OUT) after signOut will handle it
          await supabase.auth.signOut();
          // A "Password Updated. Please login." toast can be added in SIGNED_OUT if desired, or rely on general "Logged Out"
        }
      }
    } catch (e) {
      errorResult = e instanceof Error ? e : new Error("Unknown error updating password");
      if (isMountedRef.current) toast({ title: 'Password Update Error', description: errorResult.message, variant: 'destructive' });
    }
    return { error: errorResult };
  };


  const getSupabaseSession = () => {
    return session; // Return the session state managed by AuthContext
  };

  const isPropertySaved = useCallback((propertyId: string): boolean => {
    if (user && user.role === 'user') {
        return ((user as GeneralUser).savedPropertyIds || []).includes(propertyId);
    }
    return false;
  }, [user]);

  const toggleSaveProperty = useCallback(async (propertyId: string) => {
    if (!session?.user || !user || user.role !== 'user') {
      if (isMountedRef.current) toast({ title: "Login Required", description: "You need to be logged in as a user to save properties.", variant: "default" });
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
          console.error('[AuthContext] toggleSaveProperty: Error unsaving property:', error.message);
          if (isMountedRef.current) toast({ title: 'Error', description: 'Could not unsave property. ' + error.message, variant: 'destructive' });
          return;
        }
        updatedSavedIds = (generalUser.savedPropertyIds || []).filter(id => id !== propertyId);
        toastMessage = "Property removed from saved items.";
      } else {
        const { error } = await supabase
          .from('saved_properties')
          .insert({ user_id: generalUser.id, property_id: propertyId });

        if (error) {
          console.error('[AuthContext] toggleSaveProperty: Error saving property:', error.message);
          if (isMountedRef.current) toast({ title: 'Error', description: 'Could not save property. ' + error.message, variant: 'destructive' });
          return;
        }
        updatedSavedIds = [...(generalUser.savedPropertyIds || []), propertyId];
        toastMessage = "Property saved!";
      }

      const updatedUser: GeneralUser = { ...generalUser, savedPropertyIds: updatedSavedIds };
      if(isMountedRef.current) setUser(updatedUser);
      if (isMountedRef.current) toast({ title: toastMessage });
    } catch (e: any) {
      console.error("[AuthContext] toggleSaveProperty: Unexpected error:", e.message, e);
      if (isMountedRef.current) toast({ title: "Error", description: `An unexpected error occurred: ${e.message}.`, variant: "destructive"});
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

