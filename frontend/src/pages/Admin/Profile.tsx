import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import { Card, CardHeader, CardBody } from '@/components/common/Card';
import { toast } from 'react-hot-toast';
import api from '@/lib/axios';

export function Profile() {
  const { user } = useAuthStore();
  
  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword && newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword && !currentPassword) {
      toast.error('Current password is required to set a new password');
      return;
    }

    setIsUpdating(true);
    const loadingToast = toast.loading('Updating profile...');
    
    try {
      await api.put('/users/profile', {
        name,
        currentPassword,
        newPassword
      });
      
      toast.success('Profile updated successfully', { id: loadingToast });
      
      if (newPassword) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }

      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error: any) {
      console.error('Update failed', error);
      toast.error(error.response?.data?.message || 'Failed to update profile', { id: loadingToast });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Typography variant="h2" className="text-2xl mb-1">Profile Settings</Typography>
        <Typography variant="body" className="text-charcoal/60">Update your personal information and security settings.</Typography>
      </div>

      <Card>
        <CardHeader>
          <Typography variant="h3" className="text-lg">General Information</Typography>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-charcoal/70 uppercase mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  required
                  className="w-full px-4 py-2 border border-charcoal/10 rounded-xl outline-none focus:border-deep-green bg-white" 
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-charcoal/70 uppercase mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={user?.email || ''} 
                  disabled
                  className="w-full px-4 py-2 border border-charcoal/10 rounded-xl bg-gray-50 text-charcoal/50 cursor-not-allowed" 
                />
                <span className="text-xs text-charcoal/40 mt-1 block">Email address cannot be changed.</span>
              </div>
            </div>

            {user?.role === 'Super Admin' && (
              <div className="pt-6 border-t border-charcoal/10">
                <Typography variant="h3" className="text-lg mb-4">Security</Typography>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-charcoal/70 uppercase mb-1">Current Password</label>
                    <input 
                      type="password" 
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      className="w-full max-w-md px-4 py-2 border border-charcoal/10 rounded-xl outline-none focus:border-deep-green bg-white" 
                      placeholder="Required to change password"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-charcoal/70 uppercase mb-1">New Password</label>
                    <input 
                      type="password" 
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="w-full max-w-md px-4 py-2 border border-charcoal/10 rounded-xl outline-none focus:border-deep-green bg-white" 
                      placeholder="Leave blank to keep current"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-charcoal/70 uppercase mb-1">Confirm New Password</label>
                    <input 
                      type="password" 
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="w-full max-w-md px-4 py-2 border border-charcoal/10 rounded-xl outline-none focus:border-deep-green bg-white" 
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4 flex justify-end">
              <Button type="submit" variant="primary" disabled={isUpdating}>
                {isUpdating ? 'Saving Changes...' : 'Save Changes'}
              </Button>
            </div>
            
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
