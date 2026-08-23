import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/lib/fetcher';
import { Button } from '@/components/common/Button';
import { Typography } from '@/components/common/Typography';

export function AttendanceCheckIn() {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [message, setMessage] = useState('Checking you in...');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/attendance/check-in' } } });
      return;
    }
    if (user?.role !== 'Employee') {
      setMessage('Only staff can mark attendance.');
      return;
    }
    api.post('/people/me/attendance', { method: 'qr' })
      .then((res) => {
        const already = res.data?.data?.already;
        setMessage(already ? 'Attendance already marked for today.' : 'Attendance marked. Thank you.');
        toast.success(already ? 'Already marked today' : 'Checked in');
      })
      .catch((error) => setMessage(error.response?.data?.message || 'Could not mark attendance'));
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="min-h-screen bg-fog-gray flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl p-10 max-w-md text-center space-y-4">
        <Typography variant="h3">Staff check-in</Typography>
        <p className="text-charcoal/60">{message}</p>
        <Button onClick={() => navigate('/portal')}>Open staff portal</Button>
      </div>
    </div>
  );
}
