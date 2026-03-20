import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

// Demo users - no authentication needed
const DEMO_VENDOR: User = {
  id: 'vendor-demo',
  name: 'Fresh Farms Vendor',
  role: 'vendor',
  phone: '9876543210',
  email: 'vendor@freshlink.com',
  rating: 4.5,
  shopName: 'Fresh Farms',
  shopAddress: 'Madhapur, Hyderabad',
  shopDescription: 'Premium quality fresh produce',
  upiId: 'freshfarms@upi',
  location: { lat: 17.4400, lng: 78.3489, address: 'Madhapur, Hyderabad' },
  totalOrders: 150,
};

const DEMO_BUSINESS: User = {
  id: 'business-demo',
  name: 'Hotel Grand Kitchen',
  role: 'business',
  phone: '9988776655',
  email: 'business@freshlink.com',
  businessType: 'Restaurant',
  deliveryAddress: 'Jubilee Hills, Hyderabad',
  location: { lat: 17.4325, lng: 78.4073, address: 'Jubilee Hills, Hyderabad' },
  totalOrders: 85,
};

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setVendorMode: () => void;
  setBusinessMode: () => void;
  logout: () => void;
  setCurrentUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: 'demo-token',
      isAuthenticated: false,
      isLoading: false,

      setVendorMode: () => {
        set({ user: DEMO_VENDOR, token: 'demo-token', isAuthenticated: true });
      },

      setBusinessMode: () => {
        set({ user: DEMO_BUSINESS, token: 'demo-token', isAuthenticated: true });
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },

      setCurrentUser: (user) => set({ user, isAuthenticated: true }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
