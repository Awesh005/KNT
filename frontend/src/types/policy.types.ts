export const POLICY_TYPES = [
  'Publications',
  'Company Profile',
  'Annual Report',
  'Board Resolution',
  'SOP Manual',
  'HR Policy',
  'Financial Policy',
  'Procurement Policy',
  'Child Protection Policy',
  'POSH Policy',
  'Data Privacy Policy',
  'Risk Management Policy',
] as const;

export type PolicyType = (typeof POLICY_TYPES)[number];

export type PolicyDoc = {
  id: number;
  type: string;
  title: string;
  year: string;
  fileUrl: string;
  visibility: 'public' | 'internal';
  updatedAt: string;
};
