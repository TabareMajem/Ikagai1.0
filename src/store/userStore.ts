import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  type: 'elder' | 'volunteer';
  name: string;
  email: string;
}

interface UserState {
  user: User | null;
  error: string | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  clearUser: () => void;
  initialize: () => Promise<void>;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      error: null,
      loading: true,
      setUser: (user) => set({ user, error: null }),
      setError: (error) => set({ error }),
      setLoading: (loading) => set({ loading }),
      clearUser: () => set({ user: null, error: null }),
      initialize: async () => {
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) throw error;
          
          if (session?.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profile) {
              set({
                user: {
                  id: session.user.id,
                  type: profile.type,
                  name: profile.name,
                  email: profile.email,
                },
                loading: false,
              });
            }
          } else {
            set({ loading: false });
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An unknown error occurred',
            loading: false 
          });
        }
      },
    }),
    {
      name: 'ikigai-user-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);