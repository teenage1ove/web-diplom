import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@shared/types';
import { getErrorMessage } from '@shared/lib/utils';
import { authApi } from '../api';
import type { LoginRequest, RegisterRequest } from '../api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isInitializing: boolean; // Only true during initial auth check on app mount
  error: string | null;

  // Actions
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isInitializing: true,
      error: null,

      login: async (data: LoginRequest) => {
        set({ error: null });
        try {
          const response = await authApi.login(data);

          // Токены теперь в httpOnly cookies, не нужно сохранять в localStorage

          set({
            user: response.user,
            isAuthenticated: true,
            error: null,
          });
        } catch (error: unknown) {
          const message = getErrorMessage(error, 'Ошибка при входе');
          set({ error: message });
          throw error;
        }
      },

      register: async (data: RegisterRequest) => {
        set({ error: null });
        try {
          const response = await authApi.register(data);

          // Токены теперь в httpOnly cookies, не нужно сохранять в localStorage

          set({
            user: response.user,
            isAuthenticated: true,
            error: null,
          });
        } catch (error: unknown) {
          const message = getErrorMessage(error, 'Ошибка при регистрации');
          set({ error: message });
          throw error;
        }
      },

      logout: () => {
        authApi.logout();
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        });
      },

      checkAuth: async () => {
        // Токены в cookies, просто пытаемся получить текущего пользователя
        set({ isInitializing: true });

        try {
          const user = await authApi.getCurrentUser();
          set({
            user,
            isAuthenticated: true,
            isInitializing: false,
            error: null,
          });
        } catch {
          // Если не удалось получить пользователя, значит не авторизован
          set({
            user: null,
            isAuthenticated: false,
            isInitializing: false,
            error: null,
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
