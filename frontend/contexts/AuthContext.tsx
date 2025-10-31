'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  LoginCredentials,
  RegisterData,
  login as apiLogin,
  register as apiRegister,
  getMe,
  storeAuthData,
  getStoredAuthData,
  clearAuthData,
} from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const { token: storedToken, user: storedUser } = getStoredAuthData();
        
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(storedUser);
          
          // Verify token is still valid
          try {
            const response = await getMe();
            setUser(response.data.user);
          } catch (error) {
            // Token invalid, clear data
            clearAuthData();
            setToken(null);
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await apiLogin(credentials);
      const { token: newToken, user: newUser } = response.data;
      
      storeAuthData(newToken, newUser);
      setToken(newToken);
      setUser(newUser);
      
      // Redirect based on role
      if (newUser.role === 'admin') {
        router.push('/admin/theaters');
      } else if (newUser.role === 'theater_owner') {
        router.push('/theaters');
      } else {
        router.push('/');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await apiRegister(data);
      const { token: newToken, user: newUser } = response.data;
      
      storeAuthData(newToken, newUser);
      setToken(newToken);
      setUser(newUser);
      
      // Redirect based on role
      if (newUser.role === 'admin') {
        router.push('/admin/theaters');
      } else if (newUser.role === 'theater_owner') {
        router.push('/theaters');
      } else {
        router.push('/');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const logout = () => {
    clearAuthData();
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!token && !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

