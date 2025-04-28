'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: async () => {}
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/login') {
      setIsLoading(false);
      return;
    }
    checkSession();
  }, [pathname]);

  const checkSession = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/check-session', {
        credentials: 'include'
      });
      
      if (response.ok) {
        setIsAuthenticated(true);
        if (pathname === '/login') {
          router.push('/dashboard');
        }
      } else {
        setIsAuthenticated(false);
        if (pathname !== '/login') {
          router.push('/login');
        }
      }
    } catch (error) {
      if (pathname !== '/login') {
        console.error('Error al verificar la sesión:', error);
      }
      setIsAuthenticated(false);
      if (pathname !== '/login') {
        router.push('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch('http://localhost:4000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
      });

      if (response.ok) {
        setIsAuthenticated(true);
        router.push('/dashboard');
      } else {
        throw new Error('Credenciales incorrectas');
      }
    } catch (error) {
      console.error('Error durante el inicio de sesión:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch('http://localhost:4000/api/logout', {
        method: 'POST',
        credentials: 'include'
      });
      setIsAuthenticated(false);
      router.push('/login');
    } catch (error) {
      console.error('Error durante el cierre de sesión:', error);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 