import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  planId: string;
  planLabel: string;
  billingPeriod: string;
  price: number;
  quantity: number;
  image?: string;
  variantId?: string;
  variantLabel?: string;
  extraPrice?: number;
}

interface CartStore {
  items: CartItem[];
  discountCode: string | null;
  discountAmount: number;
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  applyDiscount: (code: string, amount: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      discountCode: null,
      discountAmount: 0,
      addItem: (newItem) => set((state) => {
        const existingIdx = state.items.findIndex(
          (item) => item.productId === newItem.productId && item.planId === newItem.planId && item.variantId === newItem.variantId
        );
        if (existingIdx > -1) {
          const updatedItems = [...state.items];
          updatedItems[existingIdx].quantity += newItem.quantity;
          return { items: updatedItems };
        }
        return { items: [...state.items, { ...newItem, id: Math.random().toString(36).substring(7) }] };
      }),
      removeItem: (itemId) => set((state) => ({
        items: state.items.filter((i) => i.id !== itemId)
      })),
      updateQuantity: (itemId, qty) => set((state) => ({
        items: state.items.map((i) => i.id === itemId ? { ...i, quantity: Math.max(1, qty) } : i)
      })),
      applyDiscount: (code, amount) => set({ discountCode: code, discountAmount: amount }),
      clearCart: () => set({ items: [], discountCode: null, discountAmount: 0 }),
    }),
    {
      name: 'plano-cart-storage',
    }
  )
);
