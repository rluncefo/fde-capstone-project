import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '../types';
import { login as apiLogin, getMe, logout as apiLogout } from '../api/auth';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      setIsLoading(false);
      return;
    }
    getMe()
      .then((me) => {
        setUser(me);
        setToken(storedToken);
      })
      .catch(() => {
        localStorage.removeItem('token');
        setToken(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const { token: newToken, user: newUser } = await apiLogin(email, password);
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
  }

  function logout() {
    apiLogout().catch(() => {
      // ignore logout errors — clear state regardless
    });
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
