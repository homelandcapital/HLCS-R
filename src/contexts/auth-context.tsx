
"use client";

import type { AuthenticatedUser, GeneralUser, Agent, PlatformAdmin, UserRole } from '@/lib/types';
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';
import type { AuthChangeEvent, Session, User as SupabaseAuthUser } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types'; // Ensure this path is correct

type UserProfile = Database['public']['Tables']['users']['Row'];
// type SavedPropertyRow = Database['public']['Tables']['saved_properties']['Row']; // Not directly used in this refined version

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
    // Fetch base profile without .single() to handle no rows or multiple rows explicitly
    const { data: userProfilesData, error: profileQueryError } = await supabase
      .from('users')
      .select('*')
      .eq('id', supabaseUser.id);

    if (profileQueryError) {
      console.error('Error querying user profile. Message:', profileQueryError.message);
      console.error('Error querying user profile. Details:', profileQueryError.details);
      console.error('Error querying user profile. Hint:', profileQueryError.hint);
      console.error('Error querying user profile. Code:', profileQueryError.code);
      console.error('Full profileQueryError object:', profileQueryError);
      toast({ title: 'Profile Error', description: `Could not load your profile data. ${profileQueryError.message || 'Please check console for details.'}`, variant: 'destructive'});
      return null;
    }

    if (!userProfilesData || userProfilesData.length === 0) {
      console.warn('User profile not found in public.users for id:', supabaseUser.id);
      toast({ title: 'Profile Not Found', description: 'Your user profile could not be found. Please contact support or try re-registering.', variant: 'destructive'});
      // It might be good to sign out the user here if their profile is missing,
      // as the app might not function correctly.
      // await supabase.auth.signOut(); 
      return null;
    }

    if (userProfilesData.length > 1) {
      console.error('Multiple user profiles found for id (data integrity issue):', supabaseUser.id);
      toast({ title: 'Profile Error', description: 'Multiple profiles found for your account. Please contact support.', variant: 'destructive'});
      return null; // Or handle by picking the first, though this indicates a deeper issue
    }
    
    const baseProfile = userProfilesData[0] as UserProfile; // We've established it's a single profile

    let authenticatedUser: AuthenticatedUser;

    if (baseProfile.role === 'user') {
      const { data: savedPropsData, error: savedPropsError } = await supabase
        .from('saved_properties')
        .select('property_id')
        .eq('user_id', baseProfile.id);

      if (savedPropsError) {
        console.error('Error fetching saved properties:', savedPropsError.message);
        // Non-critical for login, so we might not toast here or return null,
        // just log and proceed with an empty array for saved properties.
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
        phone: baseProfile.phone || '', // Ensure phone is handled if nullable in DB
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

  }, [toast]); // Removed supabase from dependencies as it's stable

  useEffect(() => {
    setLoading(true);
    const getInitialSession = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      setSession(initialSession);
      if (initialSession?.user) {
        const profile = await fetchUserProfileAndRelatedData(initialSession.user);
        setUser(profile);
      }
      setLoading(false);
    };

    getInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        setSession(session);
        setLoading(true); 
        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await fetchUserProfileAndRelatedData(session.user);
          setUser(profile);
          if (profile) {
            if (profile.role === 'agent') router.push('/agents/dashboard');
            else if (profile.role === 'platform_admin') router.push('/admin/dashboard');
            else router.push('/users/dashboard');
          } else {
            // If profile fetch failed after sign-in, user might be in a bad state.
            // Consider signing them out or redirecting to an error page.
            console.warn("Profile fetch failed after SIGNED_IN event. User might be redirected or signed out.");
            // await supabase.auth.signOut(); // Example: sign out if profile is crucial
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          router.push('/'); // Or your login page
        } else if (event === 'USER_UPDATED' && session?.user) {
            // This event can be triggered by password recovery, email change confirmation, etc.
            // Re-fetch profile if necessary.
            const profile = await fetchUserProfileAndRelatedData(session.user);
            setUser(profile);
        }
        setLoading(false);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [fetchUserProfileAndRelatedData, router]);


  const signInWithPassword = async (email: string, password: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({ title: 'Login Failed', description: error.message, variant: 'destructive' });
      setLoading(false); 
    }
    // Success is handled by onAuthStateChange which will also set loading to false
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
      // Supabase options for user_metadata can be added here if needed during signup
      // options: { data: { name: profileSpecificData.name, role: userRole, ... } }
      // However, we are creating a separate public.users row, so auth metadata might be redundant here
      // unless used for RLS on auth.users before public.users row exists.
    });

    if (signUpError) {
      toast({ title: 'Registration Failed', description: signUpError.message, variant: 'destructive' });
      return { error: signUpError, data: null };
    }

    if (signUpData.user) {
      // Insert into public.users table
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: signUpData.user.id, // Link to the auth.users table
          email: signUpData.user.email!, 
          role: userRole,
          name: profileSpecificData.name,
          phone: userRole === 'agent' ? (profileSpecificData as Partial<Agent>).phone : null,
          agency: userRole === 'agent' ? (profileSpecificData as Partial<Agent>).agency : null,
          // avatar_url can be set later or from options.data if provided during signup
        });

      if (profileError) {
        console.error("Error creating profile during signup. Message:", profileError.message);
        console.error("Full profileError object:", profileError);
        toast({ title: 'Profile Creation Failed', description: `Profile creation failed: ${profileError.message}. Please contact support.`, variant: 'destructive' });
        
        // Important: Attempt to clean up the auth user if profile creation fails
        // This requires admin privileges for the Supabase client, or specific RLS.
        // For client-side, this might not be directly possible without a server-side function.
        // Consider informing the user and logging this for manual cleanup.
        // For now, we'll just sign out the partially created user from the client.
        console.warn("Orphaned auth user might exist due to profile creation failure. ID:", signUpData.user.id);
        await supabase.auth.signOut(); 
        return { error: profileError, data: null };
      }
      // For email verification flows, user won't be "SIGNED_IN" until verified.
      // Toast for registration success/email verification prompt:
      if (signUpData.user.identities && signUpData.user.identities.length === 0) {
        // This case might indicate an issue, or a user already exists but is unverified
        toast({ title: 'Registration Not Complete', description: `There was an issue with registration. If you've registered before, try logging in or resetting your password.`, variant: 'destructive' });
      } else {
        toast({ title: 'Registration Almost Complete!', description: `Welcome, ${profileSpecificData.name}! Please check your email (${email}) to verify your account.` });
      }
    } else {
      // This case (no signUpData.user and no signUpError) should be rare but indicates an issue.
      toast({ title: 'Registration Issue', description: 'Could not complete registration. Please try again.', variant: 'destructive' });
      return { error: new Error("User data not returned from signup"), data: null };
    }
    return { error: null, data: signUpData };
  };

  const signUpUser = async (name: string, email: string, password: string) => {
    setLoading(true);
    const result = await commonSignUp(email, password, 'user', { name });
    if(result.error) setLoading(false);
    // setLoading(false) will be handled by onAuthStateChange or if an error occurs earlier
    return result;
  };

  const signUpAgent = async (name: string, email: string, password: string, phone: string, agency?: string) => {
    setLoading(true);
    const result = await commonSignUp(email, password, 'agent', { name, phone, agency });
    if(result.error) setLoading(false);
    return result;
  };

  const signOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
        toast({ title: 'Logout Failed', description: error.message, variant: 'destructive' });
        setLoading(false);
    } else {
        // setUser(null) and router.push('/') are handled by onAuthStateChange
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
      router.push('/agents/login'); // Or a general login page
      return;
    }

    const generalUser = user as GeneralUser;
    const currentlySaved = (generalUser.savedPropertyIds || []).includes(propertyId);
    let updatedSavedIds: string[];
    let toastMessage = "";

    // Optimistic UI update can be considered here
    // For simplicity, we update after DB operation

    setLoading(true); // Indicate an operation is in progress

    if (currentlySaved) {
      const { error } = await supabase
        .from('saved_properties')
        .delete()
        .match({ user_id: generalUser.id, property_id: propertyId });

      if (error) {
        console.error('Error unsaving property:', error.message);
        toast({ title: 'Error', description: 'Could not unsave property. ' + error.message, variant: 'destructive' });
        setLoading(false);
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
        setLoading(false);
        return;
      }
      updatedSavedIds = [...(generalUser.savedPropertyIds || []), propertyId];
      toastMessage = "Property saved!";
    }
    
    // Update local user state
    const updatedUser: GeneralUser = { ...generalUser, savedPropertyIds: updatedSavedIds };
    setUser(updatedUser); // This will trigger re-renders for components consuming 'user'
    setLoading(false);
    
    toast({ title: toastMessage });

  }, [session, user, router, toast]); // supabase removed as it's stable


  return (
    <AuthContext.Provider value={{
      isAuthenticated: !!user && !!session, // isAuthenticated depends on both user profile and session
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
