const getBaseUrl = () => {
  // In production, API runs on the same origin so we use relative paths
  const apiUrl = import.meta.env.VITE_API_URL || '/api/v1';
  return apiUrl.replace(/\/api\/v1\/?$/, '');
};

export const getImageUrl = (path: string | undefined | null) => {
  if (!path) return '';
  // If it's already an absolute URL (http, https, data), return as is
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  
  // If it's a relative path starting with /uploads, prepend the backend base URL
  if (path.startsWith('/uploads')) {
    return `${getBaseUrl()}${path}`;
  }
  
  // Otherwise, return as is (could be a local public asset like /certificate.jpg)
  return path;
};
