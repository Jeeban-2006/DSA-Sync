import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  avatar?: string;
  joinDate: Date;
  currentStreak: number;
  longestStreak: number;
  totalProblemsSolved: number;
  level: number;
  xp: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      hasHydrated: false,

      login: (token, user) => {
        set({ token, user, isAuthenticated: true });
      },

      logout: () => {
        set({ token: null, user: null, isAuthenticated: false });
      },

      updateUser: (userData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
      },

      setHasHydrated: (state) => {
        set({ hasHydrated: state });
      },
    }),
    {
      name: 'dsa-sync-auth',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
