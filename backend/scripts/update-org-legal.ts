import { cmsModel } from '../src/modules/cms/cms.model';
import { pool } from '../src/config/database';
import { ORG } from '../src/config/org';

const companyDetails = [
  { label: 'ORGANIZATION NAME', value: ORG.name, icon: 'Building2' },
  { label: 'LEGAL STRUCTURE', value: 'Section 8 Non-Profit Company (Companies Act, 2013)', icon: 'Scale' },
  { label: 'CIN', value: ORG.cin, icon: 'Hash' },
  { label: 'DATE OF INCORPORATION', value: ORG.incorporation, icon: 'Calendar' },
  { label: 'PAN', value: ORG.pan, icon: 'CreditCard' },
  { label: 'CSR REG. NO.', value: ORG.csr, icon: 'List' },
  { label: '80G / IT URN', value: `${ORG.itUrn} (Form 106, u/s 332, 03-07-2026, TY 2026-27 to TY 2028-29)`, icon: 'FileText' },
  { label: 'NATURE OF ACTIVITIES', value: 'Public Religious and Charitable', icon: 'Heart' },
  { label: 'NGO ID', value: 'Applied / Under Process', icon: 'List' },
  { label: 'AREA OF OPERATION', value: 'All Over India', icon: 'Globe' },
  { label: 'REGISTERED OFFICE', value: ORG.address, icon: 'MapPin' },
  { label: 'OFFICIAL EMAIL', value: ORG.email, icon: 'Mail' },
  { label: 'CONTACT NUMBER', value: ORG.phone, icon: 'Phone' },
];

async function run() {
  const existing = await cmsModel.getContent('about', 'main');
  const content = {
    ...(existing?.content || {}),
    companyDetails,
  };
  await cmsModel.upsertContent('about', 'main', content, null as any);
  console.log('Updated cms about/main legal details:');
  console.log(`  CIN ${ORG.cin}`);
  console.log(`  PAN ${ORG.pan}`);
  console.log(`  CSR ${ORG.csr}`);
  console.log(`  Email ${ORG.email}`);
  console.log(`  Phone ${ORG.phone}`);
  await pool.end();
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
