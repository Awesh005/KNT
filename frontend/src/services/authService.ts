import api from '../lib/axios';
import type { User } from '@/types';

export const authService = {
  login: async (email: string, password?: string): Promise<{ user?: User, accessToken?: string, requires2fa?: boolean, challengeToken?: string }> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data.data;
  },

  verify2fa: async (challengeToken: string, code: string): Promise<{ user: User, accessToken: string }> => {
    const response = await api.post('/auth/2fa/verify', { challengeToken, code });
    return response.data.data;
  },

  getCurrentUser: async (): Promise<{ user: User }> => {
    const response = await api.get('/auth/me');
    return response.data.data;
  },

  register: async (name: string, email: string, password?: string): Promise<{ user?: User, accessToken?: string, emailVerificationRequired?: boolean }> => {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data.data;
  },
  
  logout: async () => {
    await api.post('/auth/logout');
  }
};
