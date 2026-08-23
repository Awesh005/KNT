import { useState } from 'react';
import { Typography } from '@/components/common/Typography';
import { Search } from 'lucide-react';
import useSWR from 'swr';
import { fetcher, api } from '@/lib/fetcher';
import type { User } from '@/types';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/common/Button';

export function UserManagement() {
  const { data, mutate } = useSWR('/users', fetcher);
  const users: User[] = data?.users || [];
  const { user: currentUser } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'administrators' | 'users'>('users');
  
  // Modal state
  const [isAddAdminModalOpen, setIsAddAdminModalOpen] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '' });
  const [isCreating, setIsCreating] = useState(false);

  // Edit Modal state
  const [isEditAdminModalOpen, setIsEditAdminModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState({ id: '', name: '', email: '', password: '' });
  const [isEditing, setIsEditing] = useState(false);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      await api.post('/users/admin', newAdmin);
      toast.success('Admin created successfully');
      setNewAdmin({ name: '', email: '', password: '' });
      setIsAddAdminModalOpen(false);
      mutate();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create admin');
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(true);
    try {
      await api.patch(`/users/admin/${editingAdmin.id}`, { email: editingAdmin.email, password: editingAdmin.password });
      toast.success('Admin updated successfully');
      setIsEditAdminModalOpen(false);
      mutate();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update admin');
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) return;
    try {
      await api.delete(`/users/${userId}`);
      toast.success('User deleted successfully');
      mutate();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete user');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const isAdmin = u.role === 'Admin' || u.role === 'Super Admin';
    const matchesTab = activeTab === 'administrators' ? isAdmin : !isAdmin;

    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Typography variant="h2" className="!text-2xl text-deep-green mb-1">
            User Management
          </Typography>
          <Typography variant="body" className="text-charcoal/60 text-sm">
            Manage user roles and permissions.
          </Typography>
        </div>
      </div>

      <div className="flex border-b border-charcoal/10 gap-8">
        <div className="flex gap-4">
          <button
            className={`pb-4 font-bold text-[16px] transition-colors relative ${
              activeTab === 'administrators' ? 'text-deep-green' : 'text-charcoal/40 hover:text-charcoal/70'
            }`}
            onClick={() => setActiveTab('administrators')}
          >
            Administrators
            {activeTab === 'administrators' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-deep-green rounded-t-full" />
            )}
          </button>
          <button
            className={`pb-4 font-bold text-[16px] transition-colors relative ${
              activeTab === 'users' ? 'text-deep-green' : 'text-charcoal/40 hover:text-charcoal/70'
            }`}
            onClick={() => setActiveTab('users')}
          >
            Public Users
            {activeTab === 'users' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-deep-green rounded-t-full" />
            )}
          </button>
        </div>
        
        {activeTab === 'administrators' && currentUser?.role === 'Super Admin' && (
          <Button 
            variant="primary" 
            size="sm"
            onClick={() => setIsAddAdminModalOpen(true)}
            className="mb-3"
          >
            + Add Admin
          </Button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-charcoal/5 overflow-hidden">
        <div className="p-4 border-b border-charcoal/5 flex bg-gray-50/50">
          <div className="relative max-w-md w-full">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
            <input 
              type="text" 
              placeholder="Search users by name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-charcoal/10 rounded-xl focus:ring-2 focus:ring-deep-green focus:border-transparent outline-none transition-all text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-charcoal/60 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Current Role</th>
                {currentUser?.role === 'Super Admin' && (
                  <th className="px-6 py-4 text-center">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/5">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-charcoal flex items-center gap-3">
                    <div className="w-8 h-8 bg-goldenrod/20 text-goldenrod flex items-center justify-center rounded-full font-bold">
                      {user.name.charAt(0)}
                    </div>
                    {user.name}
                  </td>
                  <td className="px-6 py-4 text-charcoal/70">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded text-xs font-bold ${
                      user.role === 'Super Admin' ? 'bg-purple-100 text-purple-700' :
                      user.role === 'Admin' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  {currentUser?.role === 'Super Admin' && (
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {activeTab === 'administrators' && (
                          <button
                            onClick={() => {
                              setEditingAdmin({ id: user.id, name: user.name, email: user.email, password: '' });
                              setIsEditAdminModalOpen(true);
                            }}
                            disabled={user.id === 'USR-001'} // Prevent editing main super admin
                            className="p-2 text-charcoal/50 hover:bg-gray-100 hover:text-deep-green rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Edit Admin"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={user.id === 'USR-001'} // Prevent deleting main super admin
                          className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-charcoal/50">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Admin Modal */}
      <AnimatePresence>
        {isAddAdminModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50"
              onClick={() => setIsAddAdminModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-6 border-b border-charcoal/5 flex justify-between items-center">
                <Typography variant="h3" className="text-charcoal">Add New Admin</Typography>
                <button 
                  onClick={() => setIsAddAdminModalOpen(false)}
                  className="p-2 text-charcoal/50 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateAdmin} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-charcoal/60 uppercase tracking-wider mb-2">Name</label>
                  <input 
                    type="text" 
                    required
                    value={newAdmin.name}
                    onChange={e => setNewAdmin({...newAdmin, name: e.target.value})}
                    className="w-full p-3 bg-gray-50 border border-charcoal/10 rounded-xl focus:ring-2 focus:ring-deep-green focus:border-transparent outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-charcoal/60 uppercase tracking-wider mb-2">Email</label>
                  <input 
                    type="email" 
                    required
                    value={newAdmin.email}
                    onChange={e => setNewAdmin({...newAdmin, email: e.target.value})}
                    className="w-full p-3 bg-gray-50 border border-charcoal/10 rounded-xl focus:ring-2 focus:ring-deep-green focus:border-transparent outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-charcoal/60 uppercase tracking-wider mb-2">Password</label>
                  <input 
                    type="password" 
                    required
                    minLength={6}
                    value={newAdmin.password}
                    onChange={e => setNewAdmin({...newAdmin, password: e.target.value})}
                    className="w-full p-3 bg-gray-50 border border-charcoal/10 rounded-xl focus:ring-2 focus:ring-deep-green focus:border-transparent outline-none transition-all text-sm"
                  />
                </div>
                
                <div className="pt-4 flex gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setIsAddAdminModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    variant="primary" 
                    className="flex-1"
                    isLoading={isCreating}
                  >
                    Create Admin
                  </Button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Edit Admin Modal */}
      <AnimatePresence>
        {isEditAdminModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50"
              onClick={() => setIsEditAdminModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-6 border-b border-charcoal/5 flex justify-between items-center">
                <Typography variant="h3" className="text-charcoal">Edit Admin</Typography>
                <button 
                  onClick={() => setIsEditAdminModalOpen(false)}
                  className="p-2 text-charcoal/50 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditAdmin} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-charcoal/60 uppercase tracking-wider mb-2">Name</label>
                  <input 
                    type="text" 
                    disabled
                    value={editingAdmin.name}
                    className="w-full p-3 bg-gray-100 border border-charcoal/10 rounded-xl outline-none text-sm cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-charcoal/60 uppercase tracking-wider mb-2">Email</label>
                  <input 
                    type="email" 
                    required
                    value={editingAdmin.email}
                    onChange={e => setEditingAdmin({...editingAdmin, email: e.target.value})}
                    className="w-full p-3 bg-gray-50 border border-charcoal/10 rounded-xl focus:ring-2 focus:ring-deep-green focus:border-transparent outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-charcoal/60 uppercase tracking-wider mb-2">New Password (Optional)</label>
                  <input 
                    type="password" 
                    minLength={6}
                    value={editingAdmin.password}
                    onChange={e => setEditingAdmin({...editingAdmin, password: e.target.value})}
                    placeholder="Leave blank to keep current password"
                    className="w-full p-3 bg-gray-50 border border-charcoal/10 rounded-xl focus:ring-2 focus:ring-deep-green focus:border-transparent outline-none transition-all text-sm"
                  />
                </div>
                
                <div className="pt-4 flex gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setIsEditAdminModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    variant="primary" 
                    className="flex-1"
                    isLoading={isEditing}
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
