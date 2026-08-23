export function dashboardPath(role?: string) {
  if (!role) return '/login';
  if (['Admin', 'Super Admin'].includes(role)) return '/admin/dashboard';
  if (['Member', 'Volunteer', 'Employee'].includes(role)) return '/portal';
  return '/dashboard';
}

export function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
