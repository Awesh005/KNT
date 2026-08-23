import { create } from 'zustand';
import api from '@/lib/axios';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
  };
}

export interface LeadershipState {
  teamMembers: TeamMember[];
  isLoading: boolean;
  error: string | null;
  fetchTeamMembers: () => Promise<void>;
}

export const useLeadershipStore = create<LeadershipState>((set) => ({
  teamMembers: [],
  isLoading: false,
  error: null,
  fetchTeamMembers: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/cms/global/team');
      set({ teamMembers: res.data.data.content || [], isLoading: false });
    } catch {
      set({ error: 'Failed to fetch team members', isLoading: false });
    }
  }
}));
