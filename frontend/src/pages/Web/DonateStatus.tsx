import { Link, useParams } from 'react-router';
import useSWR from 'swr';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { fetcher } from '@/lib/fetcher';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import { formatCurrency } from '@/utils/formatters';

export function DonateStatus() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useSWR(id ? `/payments/status/${id}` : null, fetcher, { refreshInterval: 4000 });

  const status = data?.status;
  const icon = status === 'verified'
    ? <CheckCircle2 className="w-14 h-14 text-deep-green" />
    : status === 'failed' || status === 'refunded'
      ? <XCircle className="w-14 h-14 text-red-500" />
      : <Clock className="w-14 h-14 text-goldenrod" />;

  const title = status === 'verified' ? 'Payment received'
    : status === 'failed' ? 'Payment failed'
    : status === 'refunded' ? 'Donation refunded'
    : 'Waiting for SBI confirmation';

  return (
    <div className="min-h-screen bg-light-green pt-28 pb-24 px-4">
      <div className="max-w-lg mx-auto bg-white rounded-3xl p-8 text-center border border-charcoal/5">
        <div className="flex justify-center mb-4">{icon}</div>
        <Typography variant="h2" className="text-deep-green mb-2">{isLoading ? 'Checking payment…' : title}</Typography>
        {data && (
          <p className="text-charcoal/60 mb-6">
            {formatCurrency(data.amount || 0)} {data.campaignTitle ? `towards ${data.campaignTitle}` : 'to the foundation'}
            <br />
            <span className="text-xs font-mono">{data.id}</span>
          </p>
        )}
        <p className="text-sm text-charcoal/50 mb-8">
          {status === 'pending' ? 'If you just paid on SBI ePay, this page will update automatically.' : 'A receipt is emailed after verification.'}
        </p>
        <Link to="/donate"><Button>Make another donation</Button></Link>
      </div>
    </div>
  );
}
