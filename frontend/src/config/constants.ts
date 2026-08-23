export const APP_CONFIG = {
  APP_NAME: 'KNT World Welfare Foundation',
  SUPPORT_EMAIL: 'support@kntfoundation.org',
  SUPPORT_PHONE: '+91 98765 43210',
  CURRENCY: 'INR',
  CURRENCY_SYMBOL: '₹',
  
  // Platform settings
  PLATFORM_FEE_PERCENTAGE: 0, // 0% platform fee as advertised
  MIN_DONATION_AMOUNT: 100,
  
  // External links
  SOCIAL_LINKS: {
    FACEBOOK: 'https://facebook.com/kntfoundation',
    TWITTER: 'https://twitter.com/kntfoundation',
    INSTAGRAM: 'https://instagram.com/kntfoundation',
    LINKEDIN: 'https://linkedin.com/company/kntfoundation',
  }
} as const;

export const CAMPAIGN_CATEGORIES = [
  'Medical',
  'Education',
  'Memorial',
  'NGO',
  'Animal Welfare',
  'Environment',
  'Community',
  'Disaster Relief',
  'Others'
] as const;

export type CampaignCategory = typeof CAMPAIGN_CATEGORIES[number];
