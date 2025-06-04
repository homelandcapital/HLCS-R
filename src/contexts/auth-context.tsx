
"use client";

import type { AuthenticatedUser, GeneralUser, Agent, PlatformAdmin, UserRole } from '@/lib/types';
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';
import type { AuthChangeEvent, Session, User as SupabaseAuthUser } from '@supabase/supabase-js';

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthenticatedUser | null;
  // login function signature will change
  // logout function will remain similar
  // loading state will be more tied to Supabase auth state
  loading: boolean;
  isPropertySaved: (propertyId: string) => boolean;
  toggleSaveProperty: (propertyId: string) => void;
  // New methods for Supabase auth
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

  const fetchUserProfile = useCallback(async (supabaseUser: SupabaseAuthUser): Promise<AuthenticatedUser | null> => {
    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', supabaseUser.id)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      toast({ title: 'Profile Error', description: 'Could not load your profile.', variant: 'destructive'});
      return null;
    }
    if (profile) {
        // Ensure savedPropertyIds is an array if it's a general user
        if (profile.role === 'user' && !Array.isArray(profile.savedPropertyIds)) {
            (profile as GeneralUser).savedPropertyIds = [];
        }
      return profile as AuthenticatedUser;
    }
    return null;
  }, [toast]);

  useEffect(() => {
    setLoading(true);
    const getInitialSession = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      setSession(initialSession);
      if (initialSession?.user) {
        const profile = await fetchUserProfile(initialSession.user);
        setUser(profile);
      }
      setLoading(false);
    };

    getInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        setSession(session);
        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await fetchUserProfile(session.user);
          setUser(profile);
          // Redirect based on role after profile fetch
          if (profile) {
            if (profile.role === 'agent') router.push('/agents/dashboard');
            else if (profile.role === 'platform_admin') router.push('/admin/dashboard');
            else router.push('/users/dashboard');
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          router.push('/');
        } else if (event === 'USER_UPDATED' && session?.user) {
            const profile = await fetchUserProfile(session.user);
            setUser(profile);
        }
      }
    );

    return () => {
      authListener?.unsubscribe();
    };
  }, [fetchUserProfile, router]);


  const signInWithPassword = async (email: string, password: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: 'Login Failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Login Successful', description: 'Welcome back!' });
      // Redirection is handled by onAuthStateChange
    }
    return { error };
  };

  const commonSignUp = async (email: string, password: string, userRole: UserRole, profileData: Omit<AuthenticatedUser, 'id' | 'email' | 'role' | 'avatarUrl' | 'created_at' | 'updated_at'>) => {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          // Supabase options.data is limited. We'll create the profile separately.
          // role: userRole, // Cannot directly set role here for security, will do in profile table
        }
      }
    });

    if (signUpError) {
      toast({ title: 'Registration Failed', description: signUpError.message, variant: 'destructive' });
      return { error: signUpError, data: null };
    }

    if (signUpData.user) {
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: signUpData.user.id, // Link to auth.users id
          email: signUpData.user.email,
          role: userRole,
          ...profileData,
          name: (profileData as any).name, // Ensure name is passed
          // avatar_url can be set later
        });

      if (profileError) {
        // Potentially delete the auth user if profile creation fails to avoid orphaned auth users
        // await supabase.auth.admin.deleteUser(signUpData.user.id) // Requires admin privileges, handle with care or server-side
        console.error("Error creating profile:", profileError);
        toast({ title: 'Profile Creation Failed', description: profileError.message, variant: 'destructive' });
        // Attempt to sign out the partially created user
        await supabase.auth.signOut();
        return { error: profileError, data: null };
      }
      // User is signed in by Supabase after signUp by default.
      // onAuthStateChange will fetch the profile.
      toast({ title: 'Registration Successful!', description: `Welcome, ${(profileData as any).name}! Check your email for verification.` });
    }
    return { error: null, data: signUpData };
  };


  const signUpUser = async (name: string, email: string, password: string) => {
    setLoading(true);
    const result = await commonSignUp(email, password, 'user', { name });
    setLoading(false);
    return result;
  };

  const signUpAgent = async (name: string, email: string, password: string, phone: string, agency?: string) => {
    setLoading(true);
    const result = await commonSignUp(email, password, 'agent', { name, phone, agency });
    setLoading(false);
    return result;
  };


  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null); // onAuthStateChange will also set this
    setLoading(false);
    router.push('/'); // Ensure redirection to home
    toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
  };

  const getSupabaseSession = () => {
    return session;
  };

  // Placeholder for saved properties, to be refactored with Supabase DB calls
  const isPropertySaved = useCallback((propertyId: string): boolean => {
    // TODO: Replace with Supabase query to `saved_properties` table
    if (user && user.role === 'user' && (user as GeneralUser).savedPropertyIds) {
        return ((user as GeneralUser).savedPropertyIds || []).includes(propertyId);
    }
    console.warn("isPropertySaved: Needs Supabase integration. User:", user);
    return false;
  }, [user]);

  const toggleSaveProperty = useCallback(async (propertyId: string) => {
    if (!session?.user || !user || user.role !== 'user') {
      toast({
        title: "Login Required",
        description: "You need to be logged in as a user to save properties.",
        variant: "default", // Changed from destructive for less alarming UX
      });
      router.push('/agents/login');
      return;
    }

    const generalUser = user as GeneralUser;
    const currentlySaved = (generalUser.savedPropertyIds || []).includes(propertyId);
    let updatedSavedIds: string[];
    let toastMessage = "";

    if (currentlySaved) {
      // Remove from saved_properties table
      const { error } = await supabase
        .from('saved_properties')
        .delete()
        .match({ user_id: generalUser.id, property_id: propertyId });

      if (error) {
        toast({ title: 'Error', description: 'Could not unsave property.', variant: 'destructive' });
        return;
      }
      updatedSavedIds = (generalUser.savedPropertyIds || []).filter(id => id !== propertyId);
      toastMessage = "Property removed from saved items.";
    } else {
      // Add to saved_properties table
      const { error } = await supabase
        .from('saved_properties')
        .insert({ user_id: generalUser.id, property_id: propertyId });
      
      if (error) {
        toast({ title: 'Error', description: 'Could not save property.', variant: 'destructive' });
        return;
      }
      updatedSavedIds = [...(generalUser.savedPropertyIds || []), propertyId];
      toastMessage = "Property saved!";
    }
    
    // Update local user state optimistically or re-fetch profile for savedPropertyIds
    // For simplicity, updating local state directly here. A re-fetch might be more robust.
    const updatedUser = { ...generalUser, savedPropertyIds: updatedSavedIds };
    setUser(updatedUser);
    
    toast({ title: toastMessage });

  }, [session, user, router, toast]);


  return (
    <AuthContext.Provider value={{
      isAuthenticated: !!user && !!session, // isAuthenticated based on both user profile and session
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
