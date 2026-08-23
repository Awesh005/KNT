import { create } from 'zustand';
import type { Certificate } from '@/types';
import api from '@/lib/axios';

interface CertificateState {
  certificates: Certificate[];
  isLoading: boolean;
  error: string | null;
  fetchCertificates: () => Promise<void>;
}

export const useCertificateStore = create<CertificateState>((set) => ({
  certificates: [],
  isLoading: false,
  error: null,

  fetchCertificates: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/cms/global/certificates');
      set({ certificates: res.data.data.content as Certificate[] || [], isLoading: false });
    } catch {
      set({ error: 'Failed to fetch certificates', isLoading: false });
    }
  },
}));
