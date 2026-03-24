import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API_BASE = '/api';

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

  login: (email: string, password: string) => Promise<User>;
  register: (data: { name: string; email: string; password: string; role: 'vendor' | 'business'; phone?: string; shopName?: string; upiId?: string; shopAddress?: string; businessType?: string; deliveryAddress?: string }) => Promise<User>;
  logout: () => void;
  setVendorMode: () => void;
  setBusinessMode: () => void;
  setCurrentUser: (user: User) => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Login failed');
        set({ user: data.user, token: data.token, isAuthenticated: true });
        return data.user;
      },

      register: async (regData) => {
        const res = await fetch(`${API_BASE}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(regData),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Registration failed');
        set({ user: data.user, token: data.token, isAuthenticated: true });
        return data.user;
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },

      setVendorMode: () => {
        // Quick demo login as vendor
        fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'ravi@freshlink.com', password: 'password123' }),
        })
          .then(r => r.json())
          .then(data => {
            if (data.user) set({ user: data.user, token: data.token, isAuthenticated: true });
          })
          .catch(() => {});
      },

      setBusinessMode: () => {
        fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'spicekitchen@freshlink.com', password: 'password123' }),
        })
          .then(r => r.json())
          .then(data => {
            if (data.user) set({ user: data.user, token: data.token, isAuthenticated: true });
          })
          .catch(() => {});
      },

      setCurrentUser: (user) => set({ user, isAuthenticated: true }),

      updateProfile: async (data: Partial<User>) => {
        const { token } = get();
        const res = await fetch(`${API_BASE}/auth/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            'X-Role': get().user?.role || 'vendor',
          },
          body: JSON.stringify(data),
        });
        const result = await res.json();
        if (result.user) {
          set({ user: result.user });
        } else {
          const currentUser = get().user;
          if (currentUser) set({ user: { ...currentUser, ...data } });
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
