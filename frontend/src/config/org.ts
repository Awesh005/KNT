export const ORG = {
  name: 'KNT WORLD WELFARE FOUNDATION',
  legalStructure: 'Section 8 Non-Profit Company (Companies Act, 2013)',
  cin: 'U88100UP2026NPL248939',
  incorporation: '14 June 2026',
  pan: 'AAMCK9555F',
  ngoId: 'Applied / Under Process',
  area: 'All Over India',
  address: 'TVS Agency, Avas Vikas, Block Tindwari, Street No. 01, Banda, Uttar Pradesh – 210001',
  email: 'kntworldwelfarefoundationfound@gmail.com',
  phone: '+91 9565956553',
  phoneDigits: '919565956553',
  csr: 'CSR00114281',
  itUrn: 'AAMCK9555FE20261',
  form106Date: '03-07-2026',
  form106Years: 'TY 2026-27 to TY 2028-29',
  documentId: 'AAMCK9555FE2026101',
  nature: 'Public Religious and Charitable',
};

export const COMPANY_DETAILS = [
  { label: 'ORGANIZATION NAME', value: ORG.name, icon: 'Building2' },
  { label: 'LEGAL STRUCTURE', value: ORG.legalStructure, icon: 'Scale' },
  { label: 'CIN', value: ORG.cin, icon: 'Hash' },
  { label: 'DATE OF INCORPORATION', value: ORG.incorporation, icon: 'Calendar' },
  { label: 'PAN', value: ORG.pan, icon: 'CreditCard' },
  { label: 'CSR REG. NO.', value: ORG.csr, icon: 'List' },
  { label: '80G / IT URN', value: `${ORG.itUrn} (Form 106, u/s 332, ${ORG.form106Date}, ${ORG.form106Years})`, icon: 'FileText' },
  { label: 'NATURE OF ACTIVITIES', value: ORG.nature, icon: 'Heart' },
  { label: 'NGO ID', value: ORG.ngoId, icon: 'List' },
  { label: 'AREA OF OPERATION', value: ORG.area, icon: 'Globe' },
  { label: 'REGISTERED OFFICE', value: ORG.address, icon: 'MapPin' },
  { label: 'OFFICIAL EMAIL', value: ORG.email, icon: 'Mail' },
  { label: 'CONTACT NUMBER', value: ORG.phone, icon: 'Phone' },
];

export const REQUIRED_LEGAL_FIELDS = COMPANY_DETAILS.map((item) => item.label);

const STALE_MARKERS = [
  'ONCOSANJEEVA',
  'U88900WB',
  'AAECO9943R',
  'rikthasarkar',
  'mca.oncosanjeeva',
  '9609241259',
  'Karimpur',
  'WB/2026',
  'West Bengal',
];

export function isStaleLegalValue(value?: string) {
  if (!value || !value.trim()) return true;
  return STALE_MARKERS.some((marker) => value.toLowerCase().includes(marker.toLowerCase()));
}

export function mergeCompanyDetails(existing: { label: string; value: string; icon?: string }[] = []) {
  return COMPANY_DETAILS.map((fallback) => {
    const current = existing.find((item) => item.label === fallback.label);
    if (!current || isStaleLegalValue(current.value)) return fallback;
    return { ...fallback, ...current, icon: current.icon || fallback.icon };
  });
}

export function getCompanyDetail(
  details: { label: string; value: string }[] | undefined,
  label: string,
  fallback: string
) {
  const item = details?.find((entry) => entry.label === label);
  if (!item?.value || isStaleLegalValue(item.value)) return fallback;
  return item.value;
}
