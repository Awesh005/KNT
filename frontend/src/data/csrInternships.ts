export type CsrInternship = {
  id: string;
  title: string;
  duration: string;
  seats: number;
  eligibility: string;
  location: string;
  stipend: string;
  isActive: boolean;
};

export type CsrPageContent = {
  heading: string;
  intro: string;
  highlights: { title: string; text: string }[];
};

export const DEFAULT_CSR_PAGE: CsrPageContent = {
  heading: 'CSR & College Internships',
  intro:
    'KNT World Welfare Foundation is registered for Corporate Social Responsibility activities (CSR00114281). College students can apply for structured internships under our education, community, and documentation programmes in Banda and across our field work.',
  highlights: [
    {
      title: 'CSR Registration',
      text: 'Registered CSR number CSR00114281. Internships sit under our community and education programmes — not paid staff hiring.',
    },
    {
      title: 'Who can apply',
      text: 'Undergraduate and postgraduate students from recognised colleges. A college ID and a short statement of interest are enough to start.',
    },
    {
      title: 'How it works',
      text: 'Pick an opening, submit the student form, and our team will contact shortlisted applicants with dates, reporting location, and joining instructions.',
    },
  ],
};

export const DEFAULT_CSR_INTERNSHIPS: CsrInternship[] = [
  {
    id: 'csr-edu-outreach',
    title: 'Education Outreach Intern',
    duration: '6–8 weeks',
    seats: 8,
    eligibility: 'Any undergraduate / B.Ed / social work student',
    location: 'Banda, Uttar Pradesh',
    stipend: 'Unpaid / certificate + travel support',
    isActive: true,
  },
  {
    id: 'csr-digital-docs',
    title: 'Documentation & Digital Intern',
    duration: '6–8 weeks',
    seats: 4,
    eligibility: 'Any course; comfort with writing, photos, or basic design',
    location: 'Office + remote',
    stipend: 'Unpaid / certificate',
    isActive: true,
  },
  {
    id: 'csr-community',
    title: 'Community Development Intern',
    duration: '8–12 weeks',
    seats: 6,
    eligibility: 'Social work, rural development, or related courses',
    location: 'Field work around Banda',
    stipend: 'Unpaid / certificate + field support',
    isActive: true,
  },
];

export function resolveInternships(content: unknown): CsrInternship[] {
  if (Array.isArray(content)) return content as CsrInternship[];
  return DEFAULT_CSR_INTERNSHIPS;
}

export function resolveCsrPage(content: unknown): CsrPageContent {
  if (content && typeof content === 'object' && Object.keys(content as object).length > 0) {
    return { ...DEFAULT_CSR_PAGE, ...(content as Partial<CsrPageContent>) };
  }
  return DEFAULT_CSR_PAGE;
}
