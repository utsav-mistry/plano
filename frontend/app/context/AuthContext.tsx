'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { User } from '@/types';
import { defaultRouteForRole } from '@/lib/role-routing';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: any, redirectTo?: string) => Promise<void>;
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
    const storedToken = localStorage.getItem('plano_token');
    const storedUser = localStorage.getItem('plano_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      verifyAuth();           // Validate token is still alive
    } else {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** 
   * Calls GET /auth/me — backend returns the User object directly as `data`.
   * If the token is invalid/expired the request throws and we force logout.
   */
  const verifyAuth = async () => {
    try {
      const response = await api.auth.me();
      if (response.success && response.data) {
        // Backend returns user directly as data (not wrapped in { user })
        const freshUser = response.data as unknown as User;
        setUser(freshUser);
        localStorage.setItem('plano_user', JSON.stringify(freshUser));
      }
    } catch (err) {
      console.error('Session verification failed', err);
      // Token is stale/invalid — clear and redirect to login
      setUser(null);
      setToken(null);
      localStorage.removeItem('plano_token');
      localStorage.removeItem('plano_user');
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: any, redirectTo?: string) => {
    try {
      setIsLoading(true);
      const response = await api.auth.login(credentials);
      if (response.success && response.data) {
        // Backend returns { user, token }
        const { user, token } = response.data as any;
        setUser(user);
        setToken(token);
        localStorage.setItem('plano_token', token);
        localStorage.setItem('plano_user', JSON.stringify(user));
        router.push(redirectTo || defaultRouteForRole(user?.role));
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
        router.push(`/verify-email?email=${encodeURIComponent(data.email)}&registered=1`);
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
