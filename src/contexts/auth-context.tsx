
// src/contexts/auth-context.tsx
"use client";

import type { AuthenticatedUser, GeneralUser } from '@/lib/types';
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthenticatedUser | null;
  login: (userDetails: AuthenticatedUser) => void;
  logout: () => void;
  loading: boolean;
  isPropertySaved: (propertyId: string) => boolean;
  toggleSaveProperty: (propertyId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedAuth = localStorage.getItem('homelandCapitalAuth'); // Changed storage key
      if (storedAuth) {
        const parsedAuth = JSON.parse(storedAuth);
        if (parsedAuth.isAuthenticated && parsedAuth.user) {
          // Ensure savedPropertyIds is an array for GeneralUser
          if (parsedAuth.user.role === 'user' && !Array.isArray(parsedAuth.user.savedPropertyIds)) {
            parsedAuth.user.savedPropertyIds = [];
          }
          setIsAuthenticated(true);
          setUser(parsedAuth.user as AuthenticatedUser);
        }
      }
    } catch (error) {
      console.error("Failed to parse auth state from localStorage", error);
      localStorage.removeItem('homelandCapitalAuth');
    }
    setLoading(false);
  }, []);

  const login = useCallback((userDetails: AuthenticatedUser) => {
    let userToStore = { ...userDetails };
    // Ensure savedPropertyIds is an array for GeneralUser on login
    if (userToStore.role === 'user' && !Array.isArray((userToStore as GeneralUser).savedPropertyIds)) {
      (userToStore as GeneralUser).savedPropertyIds = [];
    }
    setIsAuthenticated(true);
    setUser(userToStore);
    try {
      localStorage.setItem('homelandCapitalAuth', JSON.stringify({ isAuthenticated: true, user: userToStore }));
    } catch (error) {
      console.error("Failed to save auth state to localStorage", error);
    }
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setUser(null);
    try {
      localStorage.removeItem('homelandCapitalAuth');
    } catch (error) {
      console.error("Failed to remove auth state from localStorage", error);
    }
    router.push('/');
  }, [router]);

  const isPropertySaved = useCallback((propertyId: string): boolean => {
    if (user && user.role === 'user') {
      const generalUser = user as GeneralUser;
      return generalUser.savedPropertyIds?.includes(propertyId) || false;
    }
    return false;
  }, [user]);

  const toggleSaveProperty = useCallback((propertyId: string) => {
    if (!isAuthenticated || !user || user.role !== 'user') {
      toast({
        title: "Login Required",
        description: "You need to be logged in as a user to save properties.",
        variant: "destructive",
      });
      router.push('/agents/login'); // Or a generic login page if you have one
      return;
    }

    setUser(currentUser => {
      if (!currentUser || currentUser.role !== 'user') return currentUser;

      const generalUser = currentUser as GeneralUser;
      const currentSavedIds = generalUser.savedPropertyIds || [];
      let updatedSavedIds: string[];
      let toastMessage = "";

      if (currentSavedIds.includes(propertyId)) {
        updatedSavedIds = currentSavedIds.filter(id => id !== propertyId);
        toastMessage = "Property removed from saved items.";
      } else {
        updatedSavedIds = [...currentSavedIds, propertyId];
        toastMessage = "Property saved!";
      }
      
      const updatedUser = { ...generalUser, savedPropertyIds: updatedSavedIds };
      
      try {
        localStorage.setItem('homelandCapitalAuth', JSON.stringify({ isAuthenticated: true, user: updatedUser }));
      } catch (error) {
        console.error("Failed to save auth state to localStorage", error);
      }
      
      toast({
        title: toastMessage,
      });
      return updatedUser;
    });
  }, [user, isAuthenticated, router, toast]);


  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading, isPropertySaved, toggleSaveProperty }}>
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
