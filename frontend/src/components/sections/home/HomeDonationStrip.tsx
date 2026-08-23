import { Link } from 'react-router';
import useSWR from 'swr';
import { QrCode } from 'lucide-react';
import { fetcher } from '@/lib/fetcher';
import { getImageUrl } from '@/utils/getImageUrl';
import { formatCompactCurrency } from '@/utils/formatters';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';

export function HomeDonationStrip() {
  const { data: settingsData } = useSWR('/cms/global/settings', fetcher);
  const { data: stats } = useSWR('/donations/stats', fetcher);
  const paymentQRUrl = settingsData?.content?.paymentQRUrl;

  return (
    <section className="py-16 bg-deep-green">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-goldenrod mb-3">Donate now</p>
            <Typography variant="h2" className="text-white mb-4">
              Scan the QR or open the donation page
            </Typography>
            <p className="text-white/70 mb-3 max-w-xl">
              Verified donations so far: <span className="text-white font-bold">{formatCompactCurrency(stats?.totalRaised || 0)}</span>
              {' '}from {stats?.donationCount || 0} supporters.
            </p>
            {stats?.lastGift && (
              <p className="text-goldenrod text-sm font-bold mb-6">
                Last gift: {formatCompactCurrency(stats.lastGift.amount)} from {stats.lastGift.name}
              </p>
            )}
            <Link to="/donate">
              <Button size="lg" className="bg-goldenrod text-charcoal border-goldenrod hover:bg-yellow-500">
                <QrCode className="w-5 h-5 mr-2" />
                Go to Donation Page
              </Button>
            </Link>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="bg-white rounded-3xl p-6 w-full max-w-xs text-center">
              {paymentQRUrl ? (
                <img src={getImageUrl(paymentQRUrl)} alt="Donation QR" className="w-full aspect-square object-contain" />
              ) : (
                <div className="aspect-square flex items-center justify-center text-charcoal/40 text-sm">
                  QR not uploaded yet
                </div>
              )}
              <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-charcoal/60">UPI QR Code</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
