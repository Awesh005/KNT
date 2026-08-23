export const ROUTES = {
  // Public Web Routes
  HOME: '/',
  ABOUT: '/about',
  CAMPAIGNS: '/campaigns',
  CAMPAIGN_DETAIL: (id: string | number) => `/campaigns/${id}`,
  START_FUNDRAISER: '/start-fundraiser',
  HOW_IT_WORKS: '/how-it-works',
  TRUST_AND_SAFETY: '/trust-safety',
  NGO_PARTNERS: '/ngo-partners',
  CAREERS: '/careers',
  JOB_APPLICATION: (id: string | number) => `/careers/apply/${id}`,
  CONTACT: '/contact',
  
  // Auth Routes
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  
  // User Dashboard Routes
  DASHBOARD: '/dashboard',
  MY_CAMPAIGNS: '/dashboard/campaigns',
  MY_DONATIONS: '/dashboard/donations',
  PROFILE: '/dashboard/profile',
  
  // Admin Routes
  ADMIN_DASHBOARD: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_CAMPAIGNS: '/admin/campaigns',
  ADMIN_DONATIONS: '/admin/donations',
  ADMIN_SETTINGS: '/admin/settings',
} as const;

export type RouteKey = keyof typeof ROUTES;
