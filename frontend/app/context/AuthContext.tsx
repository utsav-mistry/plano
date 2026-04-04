'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for stored token on load
    const storedToken = localStorage.getItem('plano_token');
    const storedUser = localStorage.getItem('plano_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      // Optionally verify the token with /auth/me
      verifyAuth();
    } else {
      setIsLoading(false);
    }
  }, []);

  const verifyAuth = async () => {
    try {
      const response = await api.auth.me();
      if (response.success) {
        setUser(response.data);
        localStorage.setItem('plano_user', JSON.stringify(response.data));
      }
    } catch (err) {
      console.error('Session verification failed', err);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: any) => {
    try {
      setIsLoading(true);
      const response = await api.auth.login(credentials);
      if (response.success && response.data) {
        const { user, token } = response.data;
        setUser(user);
        setToken(token);
        localStorage.setItem('plano_token', token);
        localStorage.setItem('plano_user', JSON.stringify(user));
        router.push('/');
      }
    } catch (err: any) {
      throw new Error(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any) => {
    try {
      setIsLoading(true);
      const response = await api.auth.register(data);
      if (response.success && response.data) {
        const { user, token } = response.data;
        setUser(user);
        setToken(token);
        localStorage.setItem('plano_token', token);
        localStorage.setItem('plano_user', JSON.stringify(user));
        router.push('/');
      }
    } catch (err: any) {
      throw new Error(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('plano_token');
    localStorage.removeItem('plano_user');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
