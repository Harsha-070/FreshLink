import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  stockId: string;
  name: string;
  vendorId: string;
  vendorName: string;
  quantity: number;
  pricePerKg: number;
  unit: string;
  image: string;
  maxQuantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (stockId: string) => void;
  updateQuantity: (stockId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item: CartItem) => {
        set((state) => {
          const existing = state.items.find((i) => i.stockId === item.stockId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.stockId === item.stockId
                  ? { ...i, quantity: Math.min(i.quantity + item.quantity, i.maxQuantity) }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        });
      },

      removeItem: (stockId: string) => {
        set((state) => ({
          items: state.items.filter((i) => i.stockId !== stockId),
        }));
      },

      updateQuantity: (stockId: string, quantity: number) => {
        set((state) => {
          if (quantity <= 0) {
            return { items: state.items.filter((i) => i.stockId !== stockId) };
          }
          return {
            items: state.items.map((i) =>
              i.stockId === stockId
                ? { ...i, quantity: Math.min(quantity, i.maxQuantity) }
                : i
            ),
          };
        });
      },

      clearCart: () => set({ items: [] }),

      getTotal: () => {
        return get().items.reduce((sum, item) => sum + item.pricePerKg * item.quantity, 0);
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: 'freshlink-cart',
    }
  )
);
