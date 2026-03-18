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
  shopName?: string;
  shopAddress?: string;
  shopDescription?: string;
  upiId?: string;
  deliveryAddress?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (phone: string, password: string, role: 'vendor' | 'business') => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  setCurrentUser: (user: User) => void;
  refreshUser: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

interface RegisterData {
  name: string;
  phone: string;
  password: string;
  role: 'vendor' | 'business';
  email?: string;
  // Vendor fields
  shopName?: string;
  shopAddress?: string;
  shopDescription?: string;
  upiId?: string;
  // Business fields
  businessType?: string;
  deliveryAddress?: string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (phone, password, role) => {
        set({ isLoading: true });
        try {
          const data = await api.login(phone, password, role);
          localStorage.setItem('freshlink-token', data.token);
          set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
        } catch (err: any) {
          set({ isLoading: false });
          throw err;
        }
      },

      register: async (registerData) => {
        set({ isLoading: true });
        try {
          const data = await api.register(registerData);
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

      refreshUser: async () => {
        try {
          const data = await api.getMe();
          set({ user: data.user });
        } catch (err) {
          // If token is invalid, logout
          get().logout();
        }
      },

      updateProfile: async (profileData) => {
        set({ isLoading: true });
        try {
          const data = await api.updateProfile(profileData);
          set({ user: data.user, isLoading: false });
        } catch (err: any) {
          set({ isLoading: false });
          throw err;
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
