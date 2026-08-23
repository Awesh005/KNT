export type CampaignStatus = 'pending' | 'approved' | 'rejected' | 'closed';
export type CampaignCategory = 'Medical' | 'Education' | 'Memorial' | 'Disaster Relief' | 'Children' | 'Animals' | 'Environment' | 'Emergencies' | 'Other';

export interface StudentDetails {
  course: string;
  institution: string;
  progressUpdates: string[];
}

export interface Campaign {
  id: string;
  title: string;
  story: string;
  coverImage: string[];
  targetAmount: number;
  raisedAmount: number;
  deadline?: string;
  status: CampaignStatus;
  createdBy: string; // User ID
  creatorName?: string;
  category: CampaignCategory;
  categoryId?: string;
  supportersCount?: number;
  studentDetails?: StudentDetails;
  isUrgent?: boolean;
  isFeatured?: boolean;
  videoUrl?: string | null;
  createdAt: string;
}
