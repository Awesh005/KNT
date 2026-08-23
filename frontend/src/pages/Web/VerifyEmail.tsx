import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import api from '@/lib/axios';

export function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [state, setState] = useState<'working' | 'ok' | 'fail'>('working');

  useEffect(() => {
    if (!token) {
      setState('fail');
      return;
    }
    api.post('/auth/verify-email', { token })
      .then(() => setState('ok'))
      .catch(() => setState('fail'));
  }, [token]);

  return (
    <div className="min-h-screen bg-fog-gray flex items-center justify-center px-4">
      <div className="max-w-md bg-white rounded-2xl p-8 text-center">
        <Typography variant="h2" className="mb-3">
          {state === 'working' ? 'Verifying email…' : state === 'ok' ? 'Email verified' : 'Link invalid'}
        </Typography>
        <p className="text-charcoal/60 mb-6">
          {state === 'ok' ? 'You can sign in now.' : state === 'fail' ? 'This verification link is invalid or already used.' : 'Please wait.'}
        </p>
        <Link to="/login"><Button>Go to login</Button></Link>
      </div>
    </div>
  );
}
