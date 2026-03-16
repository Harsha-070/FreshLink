import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../lib/api';

interface User {
  id: string;
  name: string;
  role: 'vendor' | 'business';
  email?: string;
  phone?: string;
  location?: any;
  rating?: number;
  totalOrders?: number;
  businessType?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  sendOtp: (identifier: string, type: 'phone' | 'email') => Promise<string | null>;
  verifyOtp: (identifier: string, otp: string, role: string, name?: string) => Promise<void>;
  demoLogin: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setCurrentUser: (user: User) => void;
  setRole: (role: 'vendor' | 'business') => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      sendOtp: async (identifier, type) => {
        set({ isLoading: true });
        try {
          const data = await api.sendOtp(identifier, type);
          set({ isLoading: false });
          return data.otp || null; // null if real email/SMS was sent
        } catch (err: any) {
          set({ isLoading: false });
          throw err;
        }
      },

      verifyOtp: async (identifier, otp, role, name?) => {
        set({ isLoading: true });
        try {
          const data = await api.verifyOtp(identifier, otp, role, name);
          localStorage.setItem('freshlink-token', data.token);
          set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
        } catch (err: any) {
          set({ isLoading: false });
          throw err;
        }
      },

      demoLogin: async (email, password) => {
        set({ isLoading: true });
        try {
          const data = await api.demoLogin(email, password);
          localStorage.setItem('freshlink-token', data.token);
          set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
        } catch (err: any) {
          set({ isLoading: false });
          throw err;
        }
      },

      logout: () => {
        localStorage.removeItem('freshlink-token');
        localStorage.removeItem('auth-storage');
        set({ user: null, token: null, isAuthenticated: false });
      },

      setCurrentUser: (user) => set({ user, isAuthenticated: true }),
      setRole: (role) =>
        set((state) => ({
          user: state.user ? { ...state.user, role } : null,
        })),
    }),
    {
      name: 'auth-storage',
    }
  )
);
