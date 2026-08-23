import { cmsModel } from '../src/modules/cms/cms.model';
import { pool } from '../src/config/database';
import { ORG } from '../src/config/org';

const page = {
  heading: 'CSR & College Internships',
  intro: `KNT World Welfare Foundation is registered for Corporate Social Responsibility activities (${ORG.csr}). College students can apply for structured internships under our education, community, and documentation programmes in Banda and across our field work.`,
  highlights: [
    {
      title: 'CSR Registration',
      text: `Registered CSR number ${ORG.csr}. Internships sit under our community and education programmes — not paid staff hiring.`,
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

const internships = [
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

async function run() {
  const existingPage = await cmsModel.getContent('global', 'csr_page');
  if (!existingPage?.content || Object.keys(existingPage.content).length === 0) {
    await cmsModel.upsertContent('global', 'csr_page', page, null as any);
    console.log('Seeded cms global/csr_page');
  } else {
    console.log('cms global/csr_page already set — skipped');
  }

  const existingList = await cmsModel.getContent('global', 'csr_internships');
  const list = existingList?.content;
  if (!Array.isArray(list) || list.length === 0) {
    await cmsModel.upsertContent('global', 'csr_internships', internships, null as any);
    console.log(`Seeded cms global/csr_internships (${internships.length} openings)`);
  } else {
    console.log('cms global/csr_internships already set — skipped');
  }

  await pool.end();
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
