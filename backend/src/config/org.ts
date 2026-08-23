export const ORG = {
  name: 'KNT WORLD WELFARE FOUNDATION',
  cin: 'U88100UP2026NPL248939',
  pan: 'AAMCK9555F',
  address: 'TVS Agency, Avas Vikas, Block Tindwari, Street No. 01, Banda, Uttar Pradesh – 210001',
  email: 'kntworldwelfarefoundationfound@gmail.com',
  phone: '+91 9565956553',
  csr: 'CSR00114281',
  itUrn: 'AAMCK9555FE20261',
  incorporation: '14 June 2026',
};

export function cmsDetail(details: { label: string; value?: string }[] | undefined, label: string, fallback: string) {
  const item = details?.find((entry) => entry.label === label);
  return item?.value?.trim() || fallback;
}
