export const SDG_OPTIONS = [
  { code: '1', label: 'No Poverty' },
  { code: '3', label: 'Good Health' },
  { code: '4', label: 'Quality Education' },
  { code: '5', label: 'Gender Equality' },
  { code: '6', label: 'Clean Water' },
  { code: '8', label: 'Decent Work' },
  { code: '10', label: 'Reduced Inequalities' },
  { code: '11', label: 'Sustainable Cities' },
  { code: '13', label: 'Climate Action' },
  { code: '17', label: 'Partnerships' },
];

export function sdgLabel(code: string) {
  return SDG_OPTIONS.find((item) => item.code === code)?.label || `SDG ${code}`;
}

export function osmEmbedUrl(lat: number, lng: number) {
  const pad = 0.02;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - pad}%2C${lat - pad}%2C${lng + pad}%2C${lat + pad}&layer=mapnik&marker=${lat}%2C${lng}`;
}

export function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
