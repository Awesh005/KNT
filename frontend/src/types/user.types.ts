export type Role = 'Guest' | 'Donor' | 'Requester' | 'Admin' | 'Super Admin' | 'Member' | 'Volunteer' | 'Employee';

export interface User {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  role: Role;
  status: 'active' | 'suspended';
  createdAt: string;
}
