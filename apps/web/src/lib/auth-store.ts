'use client';

import { LoginInput, RegisterInput } from '@/lib/validations/auth';
import { getSupabaseFrontendClient } from '@/utils/supabase/client';
import { AuthError, Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';

interface Profile {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
}

interface AuthActions {
  initialize: () => Promise<void>;
  signIn: (data: LoginInput) => Promise<{ error: AuthError | null }>;
  signUp: (data: RegisterInput) => Promise<{ error: AuthError | null }>;
  signInWithOAuth: (provider: 'google' | 'facebook') => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (password: string) => Promise<{ error: AuthError | null }>;
  refreshSession: () => Promise<void>;
  clearAuth: () => void;
}

type AuthStore = AuthState & AuthActions;

const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  profile: null,
  session: null,
  loading: true,
  initialized: false,

  initialize: async () => {
    const supabase = getSupabaseFrontendClient();

    try {
      // Get initial session
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error('Error getting session:', error);
        set({ user: null, profile: null, session: null, loading: false, initialized: true });
        return;
      }

      if (session?.user) {
        // Get user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        set({
          user: session.user,
          profile: profile || null,
          session,
          loading: false,
          initialized: true,
        });
      } else {
        set({ user: null, profile: null, session: null, loading: false, initialized: true });
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          set({
            user: session.user,
            profile: profile || null,
            session,
            loading: false,
          });
        } else {
          set({ user: null, profile: null, session: null, loading: false });
        }
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ user: null, profile: null, session: null, loading: false, initialized: true });
    }
  },

  signIn: async (data: LoginInput) => {
    const supabase = getSupabaseFrontendClient();
    set({ loading: true });

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      return { error };
    } catch (error) {
      return { error: error as AuthError };
    } finally {
      set({ loading: false });
    }
  },

  signUp: async (data: RegisterInput) => {
    const supabase = getSupabaseFrontendClient();
    set({ loading: true });

    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone || null,
          },
        },
      });

      if (!error && authData.user) {
        // Profile will be created via database trigger or webhook
        // For now, we'll create it manually if needed
        const { error: profileError } = await supabase.from('profiles').insert({
          id: authData.user.id,
          email: authData.user.email!,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone || null,
          role: 'USER',
        });

        if (profileError) {
          console.error('Error creating profile:', profileError);
        }
      }

      return { error };
    } catch (error) {
      return { error: error as AuthError };
    } finally {
      set({ loading: false });
    }
  },

  signInWithOAuth: async (provider: 'google' | 'facebook') => {
    const supabase = getSupabaseFrontendClient();
    set({ loading: true });

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      // Note: We don't set loading to false here because the redirect happens immediately
      // The loading state will be reset when the user returns from OAuth
      return { error };
    } catch (error) {
      set({ loading: false });
      return { error: error as AuthError };
    }
  },

  signOut: async () => {
    const supabase = getSupabaseFrontendClient();
    set({ loading: true });

    try {
      const { error } = await supabase.auth.signOut();
      if (!error) {
        set({ user: null, profile: null, session: null });
      }
      return { error };
    } catch (error) {
      return { error: error as AuthError };
    } finally {
      set({ loading: false });
    }
  },

  resetPassword: async (email: string) => {
    const supabase = getSupabaseFrontendClient();
    set({ loading: true });

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password/update`,
      });

      return { error };
    } catch (error) {
      return { error: error as AuthError };
    } finally {
      set({ loading: false });
    }
  },

  updatePassword: async (password: string) => {
    const supabase = getSupabaseFrontendClient();
    set({ loading: true });

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      return { error };
    } catch (error) {
      return { error: error as AuthError };
    } finally {
      set({ loading: false });
    }
  },

  refreshSession: async () => {
    const supabase = getSupabaseFrontendClient();

    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.refreshSession();

      if (error) {
        console.error('Error refreshing session:', error);
        return;
      }

      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        set({
          user: session.user,
          profile: profile || null,
          session,
        });
      }
    } catch (error) {
      console.error('Session refresh error:', error);
    }
  },

  clearAuth: () => {
    set({ user: null, profile: null, session: null, loading: false });
  },
}));

export default useAuthStore;
