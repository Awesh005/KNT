import { create } from 'zustand';
import { authService } from '@/services/authService';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  requires2fa: boolean;
  challengeToken: string | null;
  pendingVerification: boolean;
  
  setAccessToken: (token: string | null) => void;
  clearAuth: () => void;
  
  login: (email: string, password?: string) => Promise<void>;
  verify2fa: (code: string) => Promise<void>;
  register: (name: string, email: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true, // Start true for initial app load
  error: null,
  requires2fa: false,
  challengeToken: null,
  pendingVerification: false,
  
  setAccessToken: (token) => set({ accessToken: token }),
  
  clearAuth: () => {
    localStorage.removeItem('auth_status');
    set({ user: null, accessToken: null, isAuthenticated: false, error: null, requires2fa: false, challengeToken: null, pendingVerification: false });
  },
  
  login: async (email: string, password?: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authService.login(email, password);
      if (data.requires2fa && data.challengeToken) {
        set({ isLoading: false, error: null, challengeToken: data.challengeToken, requires2fa: true });
        return;
      }
      localStorage.setItem('auth_status', 'true');
      set({ user: data.user, accessToken: data.accessToken, isAuthenticated: true, isLoading: false, requires2fa: false, challengeToken: null });
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Login failed';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  verify2fa: async (code: string) => {
    const challengeToken = get().challengeToken;
    if (!challengeToken) throw new Error('No 2FA session');
    set({ isLoading: true, error: null });
    try {
      const data = await authService.verify2fa(challengeToken, code);
      localStorage.setItem('auth_status', 'true');
      set({ user: data.user, accessToken: data.accessToken, isAuthenticated: true, isLoading: false, requires2fa: false, challengeToken: null });
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Invalid code';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  register: async (name: string, email: string, password?: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authService.register(name, email, password);
      if (data.emailVerificationRequired || !data.accessToken) {
        set({ isLoading: false, error: null, pendingVerification: true });
        return;
      }
      localStorage.setItem('auth_status', 'true');
      set({ user: data.user, accessToken: data.accessToken, isAuthenticated: true, isLoading: false });
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Registration failed';
      set({ error: message, isLoading: false });
      throw err;
    }
  },
  
  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
    } catch (err) {
      // ignore
    } finally {
      get().clearAuth();
      set({ isLoading: false });
    }
  },
  
  fetchUser: async () => {
    if (localStorage.getItem('auth_status') !== 'true') {
      set({ isLoading: false, isAuthenticated: false, user: null });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const data = await authService.getCurrentUser();
      set({ user: data.user, isAuthenticated: true, isLoading: false });
    } catch (err) {
      get().clearAuth();
      set({ isLoading: false });
    }
  }
}));
