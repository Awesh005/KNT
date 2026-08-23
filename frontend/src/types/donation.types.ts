export type DonationStatus = 'pending' | 'verified' | 'failed';

export interface Donation {
  id: string;
  donorId?: string; // Optional for Guest
  donorName?: string;
  campaignId: string;
  amount: number;
  paymentRef?: string;
  screenshotUrl?: string;
  status: DonationStatus;
  donatedAt: string;
}
