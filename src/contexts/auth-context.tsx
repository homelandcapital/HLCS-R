
"use client";

import type { AuthenticatedUser, GeneralUser, Agent, PlatformAdmin, UserRole } from '@/lib/types';
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';
import type { AuthChangeEvent, Session, User as SupabaseAuthUser } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types'; // Ensure this path is correct

type UserProfile = Database['public']['Tables']['users']['Row'];
type SavedPropertyRow = Database['public']['Tables']['saved_properties']['Row'];

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
    const { data: baseProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', supabaseUser.id)
      .single<UserProfile>();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      toast({ title: 'Profile Error', description: 'Could not load your profile data.', variant: 'destructive'});
      return null;
    }

    if (!baseProfile) {
        toast({ title: 'Profile Error', description: 'User profile not found.', variant: 'destructive'});
        return null;
    }

    // Construct the AuthenticatedUser based on role
    let authenticatedUser: AuthenticatedUser;

    if (baseProfile.role === 'user') {
      const { data: savedPropsData, error: savedPropsError } = await supabase
        .from('saved_properties')
        .select('property_id')
        .eq('user_id', baseProfile.id);

      if (savedPropsError) {
        console.error('Error fetching saved properties:', savedPropsError);
        // Non-critical, proceed with empty saved properties
      }
      const savedPropertyIds = savedPropsData ? savedPropsData.map(sp => sp.property_id) : [];
      
      authenticatedUser = {
        ...baseProfile,
        role: 'user', // Explicitly set role to satisfy TypeScript
        savedPropertyIds,
      } as GeneralUser;

    } else if (baseProfile.role === 'agent') {
      authenticatedUser = {
        ...baseProfile,
        role: 'agent', // Explicitly set role
        phone: baseProfile.phone || '', // Ensure phone is string, not null
      } as Agent;
    } else if (baseProfile.role === 'platform_admin') {
      authenticatedUser = {
        ...baseProfile,
        role: 'platform_admin', // Explicitly set role
      } as PlatformAdmin;
    } else {
        console.error('Unknown user role:', baseProfile.role);
        toast({ title: 'Profile Error', description: 'Unknown user role.', variant: 'destructive'});
        return null;
    }
    
    return authenticatedUser;

  }, [toast]);

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
        setLoading(true); // Set loading true while fetching profile
        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await fetchUserProfileAndRelatedData(session.user);
          setUser(profile);
          if (profile) {
            if (profile.role === 'agent') router.push('/agents/dashboard');
            else if (profile.role === 'platform_admin') router.push('/admin/dashboard');
            else router.push('/users/dashboard');
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          router.push('/');
        } else if (event === 'USER_UPDATED' && session?.user) {
            const profile = await fetchUserProfileAndRelatedData(session.user);
            setUser(profile);
        }
        setLoading(false);
      }
    );

    return () => {
      authListener?.unsubscribe();
    };
  }, [fetchUserProfileAndRelatedData, router]);


  const signInWithPassword = async (email: string, password: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    // setLoading(false); // onAuthStateChange will handle loading state
    if (error) {
      toast({ title: 'Login Failed', description: error.message, variant: 'destructive' });
      setLoading(false); // Ensure loading is false on error
    } else {
      toast({ title: 'Login Successful', description: 'Welcome back!' });
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
          email: signUpData.user.email!, // email will exist on successful signUp
          role: userRole,
          name: profileSpecificData.name,
          phone: userRole === 'agent' ? (profileSpecificData as Partial<Agent>).phone : null,
          agency: userRole === 'agent' ? (profileSpecificData as Partial<Agent>).agency : null,
        });

      if (profileError) {
        console.error("Error creating profile:", profileError);
        toast({ title: 'Profile Creation Failed', description: profileError.message, variant: 'destructive' });
        await supabase.auth.signOut(); // Sign out the partially created user
        return { error: profileError, data: null };
      }
      // onAuthStateChange will fetch the full profile after SIGNED_IN event
      toast({ title: 'Registration Successful!', description: `Welcome, ${profileSpecificData.name}! Please check your email to verify your account.` });
    }
    return { error: null, data: signUpData };
  };

  const signUpUser = async (name: string, email: string, password: string) => {
    setLoading(true);
    // `commonSignUp` will set user and trigger onAuthStateChange which sets loading to false
    const result = await commonSignUp(email, password, 'user', { name });
    if(result.error) setLoading(false); // Ensure loading is false if signup itself fails
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
    await supabase.auth.signOut();
    // setUser(null); // onAuthStateChange will handle this
    // setLoading(false); // onAuthStateChange will handle this
    // router.push('/'); // onAuthStateChange will handle this
    toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
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

    setLoading(true); // Indicate activity

    if (currentlySaved) {
      const { error } = await supabase
        .from('saved_properties')
        .delete()
        .match({ user_id: generalUser.id, property_id: propertyId });

      if (error) {
        toast({ title: 'Error', description: 'Could not unsave property.', variant: 'destructive' });
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
        toast({ title: 'Error', description: 'Could not save property.', variant: 'destructive' });
        setLoading(false);
        return;
      }
      updatedSavedIds = [...(generalUser.savedPropertyIds || []), propertyId];
      toastMessage = "Property saved!";
    }
    
    // Update local user state
    const updatedUser: GeneralUser = { ...generalUser, savedPropertyIds: updatedSavedIds };
    setUser(updatedUser);
    setLoading(false);
    
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

