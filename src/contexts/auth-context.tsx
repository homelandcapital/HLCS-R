
// src/contexts/auth-context.tsx
"use client";

import type { AuthenticatedUser } from '@/lib/types';
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthenticatedUser | null;
  login: (userDetails: AuthenticatedUser) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedAuth = localStorage.getItem('estateListAuth');
      if (storedAuth) {
        const parsedAuth = JSON.parse(storedAuth);
        if (parsedAuth.isAuthenticated && parsedAuth.user) {
          setIsAuthenticated(true);
          setUser(parsedAuth.user as AuthenticatedUser);
        }
      }
    } catch (error) {
      console.error("Failed to parse auth state from localStorage", error);
      localStorage.removeItem('estateListAuth');
    }
    setLoading(false);
  }, []);

  const login = useCallback((userDetails: AuthenticatedUser) => {
    setIsAuthenticated(true);
    setUser(userDetails);
    try {
      localStorage.setItem('estateListAuth', JSON.stringify({ isAuthenticated: true, user: userDetails }));
    } catch (error) {
      console.error("Failed to save auth state to localStorage", error);
    }
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setUser(null);
    try {
      localStorage.removeItem('estateListAuth');
    } catch (error) {
      console.error("Failed to remove auth state from localStorage", error);
    }
    router.push('/'); // Redirect to home on logout
  }, [router]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
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
