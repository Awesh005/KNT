import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { Mail, Lock, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Card, CardBody } from '@/components/common/Card';
import api from '@/lib/axios';

export function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(res.data.message || 'If an account exists, a reset link has been sent.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-fog-gray flex flex-col items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <button onClick={() => navigate('/login')} className="flex items-center gap-2 text-charcoal/60 hover:text-deep-green font-bold mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to login
        </button>
        <Card className="border-charcoal/10">
          <CardBody className="p-8">
            <Typography variant="h2" className="!text-2xl mb-2">Forgot Password</Typography>
            <Typography variant="body" className="text-charcoal/60 mb-6">Enter your email and we will send a reset link.</Typography>
            {error && <div className="mb-4 bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm"><AlertCircle className="w-5 h-5" />{error}</div>}
            {message && <div className="mb-4 bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-3 text-sm"><CheckCircle2 className="w-5 h-5" />{message}</div>}
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input label="Email Address" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} icon={<Mail className="w-4 h-4" />} />
              <Button type="submit" className="w-full" isLoading={isLoading}>Send Reset Link</Button>
            </form>
            <div className="mt-6 text-center text-sm text-charcoal/60">
              Remembered your password? <Link to="/login" className="font-bold text-deep-green">Sign in</Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export function ResetPassword() {
  const navigate = useNavigate();
  const token = new URLSearchParams(window.location.search).get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await api.post('/auth/reset-password', { token, password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-fog-gray flex flex-col items-center justify-center py-12 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Card className="border-charcoal/10">
          <CardBody className="p-8">
            <Typography variant="h2" className="!text-2xl mb-2">Reset Password</Typography>
            {success ? (
              <div className="text-green-700 bg-green-50 p-4 rounded-xl">Password updated. Redirecting to login...</div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm">{error}</div>}
                <Input label="New Password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} icon={<Lock className="w-4 h-4" />} />
                <Input label="Confirm Password" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} icon={<Lock className="w-4 h-4" />} />
                <Button type="submit" className="w-full" isLoading={isLoading} disabled={!token}>Update Password</Button>
              </form>
            )}
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
}
