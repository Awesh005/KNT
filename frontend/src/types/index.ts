export * from './user.types';
export * from './campaign.types';
export * from './donation.types';
export * from './content.types';
export * from './api.types';
export * from './policy.types';

export interface Donation {
  id: string;
  donorId: string;
  donorName?: string;
  donorEmail?: string;
  campaignId?: string;
  campaignTitle?: string;
  amount: number;
  tipAmount: number;
  status: 'pending' | 'verified' | 'failed';
  paymentRef?: string;
  screenshotUrl?: string;
  receiptUrl?: string;
  guestPan?: string;
  guestAddress?: string;
  guestCity?: string;
  guestState?: string;
  guestPincode?: string;
  paymentMode?: string;
  certificateUrl?: string;
  certificateNo?: string;
  donatedAt: string;
}

export interface Payout {
  id: number;
  campaign_id: number;
  amount: number;
  transfer_date: string;
  account_holder: string;
  account_details: string;
  transferred_to: string;
  created_at?: string;
}
