import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

/**
 * Hook para gerenciar autenticação com Supabase
 */
export const useSupabaseAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se o Supabase está configurado
    if (!isSupabaseConfigured()) {
      console.warn('Supabase não configurado - usando modo desenvolvimento');
      setLoading(false);
      return;
    }

    // Buscar sessão atual
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro ao buscar sessão:', error);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('Erro inesperado ao buscar sessão:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Escutar mudanças na autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  /**
   * Login com email e senha
   */
  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      return { 
        data: null, 
        error: { message: 'Supabase não configurado' } 
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { data, error };
    } catch (error) {
      console.error('Erro no login:', error);
      return { 
        data: null, 
        error: { message: 'Erro inesperado no login' } 
      };
    }
  };

  /**
   * Registro com email e senha
   */
  const signUp = async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      return { 
        data: null, 
        error: { message: 'Supabase não configurado' } 
      };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      return { data, error };
    } catch (error) {
      console.error('Erro no registro:', error);
      return { 
        data: null, 
        error: { message: 'Erro inesperado no registro' } 
      };
    }
  };

  /**
   * Logout
   */
  const signOut = async () => {
    if (!isSupabaseConfigured()) {
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      console.error('Erro no logout:', error);
      return { error: { message: 'Erro inesperado no logout' } };
    }
  };

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };
};