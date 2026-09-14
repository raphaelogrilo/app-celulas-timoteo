import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import {
  signInWithGoogle,
  logoutUser,
  getLiderByEmail,
  vincularAuthUserId,
} from '../services/authService';
import type { LiderUser } from '../types/celula';

interface AuthContextType {
  currentUser: User | null;
  liderData: LiderUser | null;
  isAdmin: boolean;
  isAuthorized: boolean;
  unauthorizedEmail: string | null;
  loading: boolean;
  loginGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshLiderData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [liderData, setLiderData] = useState<LiderUser | null>(null);
  const [unauthorizedEmail, setUnauthorizedEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAndValidateLider = async (user: User | null) => {
    if (!user || !user.email) {
      setCurrentUser(null);
      setLiderData(null);
      setUnauthorizedEmail(null);
      setLoading(false);
      return;
    }

    setCurrentUser(user);

    try {
      const lider = await getLiderByEmail(user.email);

      if (lider) {
        setLiderData(lider);
        setUnauthorizedEmail(null);

        // Se ainda não vinculou o Auth ID do Supabase ao registro do líder, vincula agora
        if (!lider.userId || lider.userId !== user.id) {
          await vincularAuthUserId(user.email, user.id);
        }
      } else {
        // Usuário logou no Google, mas o Admin ainda não autorizou o e-mail dele na tabela lideres
        setLiderData(null);
        setUnauthorizedEmail(user.email);
      }
    } catch (err) {
      console.error('Erro ao validar autorização do líder:', err);
      setLiderData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1. Obter sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      fetchAndValidateLider(session?.user ?? null);
    });

    // 2. Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        fetchAndValidateLider(session?.user ?? null);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loginGoogle = async () => {
    await signInWithGoogle();
  };

  const logout = async () => {
    await logoutUser();
    setCurrentUser(null);
    setLiderData(null);
    setUnauthorizedEmail(null);
  };

  const refreshLiderData = async () => {
    if (currentUser?.email) {
      const updated = await getLiderByEmail(currentUser.email);
      setLiderData(updated);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        liderData,
        isAdmin: liderData?.isAdmin ?? false,
        isAuthorized: !!liderData,
        unauthorizedEmail,
        loading,
        loginGoogle,
        logout,
        refreshLiderData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
