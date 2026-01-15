import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import api from '../services/api';
import type { Admin } from '../types';

export interface AuthState {
  admin: Admin | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<Admin>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<Admin | null>;
}

export const useAuthStore = create()(
  persist(
    (set) => ({
      admin: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/admin/auth/login', { email, password });
          const { admin, accessToken } = response.data.data;

          Cookies.set('adminAccessToken', accessToken, { expires: 7 });
          set({ admin, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await api.post('/admin/auth/logout');
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          Cookies.remove('adminAccessToken');
          set({ admin: null, isAuthenticated: false });
        }
      },

      checkAuth: async () => {
        const token = Cookies.get('adminAccessToken');
        if (!token) {
          set({ admin: null, isAuthenticated: false });
          return;
        }

        try {
          const response = await api.get('/admin/auth/me');
          set({ admin: response.data.data.admin, isAuthenticated: true });
        } catch (error) {
          Cookies.remove('adminAccessToken');
          set({ admin: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: 'admin-auth-storage',
      partialize: (state: any) => ({
        admin: state.admin,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);