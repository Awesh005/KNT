export const formatCurrency = (amount: number | string, locale = 'en-IN', currency = 'INR'): string => {
  const num = typeof amount === 'number' ? amount : (parseFloat(amount as string) || 0);
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(num);
};

export const formatCompactCurrency = (amount: number | string): string => {
  const num = typeof amount === 'number' ? amount : (parseFloat(amount as string) || 0);
  if (isNaN(num)) return '₹0';
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) {
    const k = num / 1000;
    return `₹${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}K`;
  }
  return `₹${num.toLocaleString('en-IN')}`;
};

export const formatDate = (dateString: string | Date, options?: Intl.DateTimeFormatOptions): string => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  const defaultOptions: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  };
  return date.toLocaleDateString('en-IN', options || defaultOptions);
};

export const formatPercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return Math.min(100, Math.max(0, (value / total) * 100));
};

export const truncateText = (text: string, maxLength: number): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
};
