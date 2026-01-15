import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';
import type { Cart, CartItem } from '@/lib/types';

interface CartState {
  cart: Cart | null;
  itemCount: number;
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, variantId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: null,
      itemCount: 0,
      isLoading: false,

      fetchCart: async () => {
        set({ isLoading: true });
        try {
          const response = await api.get('/cart');
          const cart = response.data.data;
          set({
            cart,
            itemCount: cart.items.reduce((sum: number, item: CartItem) => sum + item.quantity, 0),
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      addToCart: async (productId: string, variantId: string, quantity = 1) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/cart/items', {
            productId,
            variantId,
            quantity,
          });
          const cart = response.data.data;
          set({
            cart,
            itemCount: cart.items.reduce((sum: number, item: CartItem) => sum + item.quantity, 0),
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      updateQuantity: async (itemId: string, quantity: number) => {
        set({ isLoading: true });
        try {
          const response = await api.put(`/cart/items/${itemId}`, { quantity });
          const cart = response.data.data;
          set({
            cart,
            itemCount: cart.items.reduce((sum: number, item: CartItem) => sum + item.quantity, 0),
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      removeItem: async (itemId: string) => {
        set({ isLoading: true });
        try {
          const response = await api.delete(`/cart/items/${itemId}`);
          const cart = response.data.data;
          set({
            cart,
            itemCount: cart.items.reduce((sum: number, item: CartItem) => sum + item.quantity, 0),
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      clearCart: async () => {
        set({ isLoading: true });
        try {
          await api.delete('/cart');
          set({ cart: null, itemCount: 0, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      getItemCount: () => {
        return get().itemCount;
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        itemCount: state.itemCount,
      }),
    }
  )
);