export function getIndianFY(dateInput?: string | Date): string {
  const date = dateInput ? new Date(dateInput) : new Date();
  const year = date.getFullYear();
  const month = date.getMonth();
  const startYear = month >= 3 ? year : year - 1;
  return `${startYear}-${String((startYear + 1) % 100).padStart(2, '0')}`;
}

export function getFyRange(fy: string): { from: string; to: string; label: string } {
  const startYear = parseInt(fy.split('-')[0], 10);
  if (Number.isNaN(startYear)) {
    return getFyRange(getIndianFY());
  }
  return {
    from: `${startYear}-04-01`,
    to: `${startYear + 1}-03-31`,
    label: `FY ${startYear}-${String((startYear + 1) % 100).padStart(2, '0')}`,
  };
}

export function normalizeDonorKey(email?: string | null): string {
  return String(email || '').trim().toLowerCase();
}
