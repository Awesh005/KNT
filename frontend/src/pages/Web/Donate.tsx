import { useNavigate, useSearchParams } from 'react-router';
import { ShieldCheck, ReceiptText, Heart } from 'lucide-react';
import useSWR from 'swr';
import { PageBanner } from '@/components/common/PageBanner';
import { Typography } from '@/components/common/Typography';
import { DonationFlow } from '@/components/donation/DonationFlow';
import { fetcher } from '@/lib/fetcher';
import { getImageUrl } from '@/utils/getImageUrl';
import { formatCompactCurrency } from '@/utils/formatters';

export function Donate() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const campaignId = params.get('campaign');
  const { data: settingsData } = useSWR('/cms/global/settings', fetcher);
  const { data: stats } = useSWR('/donations/stats', fetcher);
  const paymentQRUrl = settingsData?.content?.paymentQRUrl;

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <PageBanner
        title="Donate"
        subtitle="Your contribution funds medical relief, education, and community programmes."
      />

      <div className="container mx-auto px-4 max-w-6xl py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="bg-white rounded-[2rem] border border-charcoal/10 p-6 md:p-8">
            <Typography variant="h2" className="!text-2xl text-deep-green mb-2">
              Make a donation
            </Typography>
            <p className="text-charcoal/60 text-sm mb-8">
              Pay by UPI QR, then upload the screenshot. Our team verifies the transfer and emails your receipt.
            </p>
            <DonationFlow
              campaignId={campaignId || undefined}
              allowCampaignSelect={!campaignId}
              onComplete={() => navigate('/')}
            />
          </div>

          <div className="space-y-6">
            <div className="bg-deep-green text-white rounded-[2rem] p-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-goldenrod mb-2">Verified so far</p>
              <p className="text-4xl font-bold mb-2">{formatCompactCurrency(stats?.totalRaised || 0)}</p>
              <p className="text-white/70 text-sm">
                {stats?.donationCount || 0} verified donations across {stats?.activeCampaigns || 0} active campaigns.
              </p>
            </div>

            <div className="bg-white rounded-[2rem] border border-charcoal/10 p-8 flex flex-col items-center text-center">
              <Typography variant="h3" className="mb-4">UPI QR</Typography>
              {paymentQRUrl ? (
                <img src={getImageUrl(paymentQRUrl)} alt="Donation QR" className="w-56 h-56 object-contain bg-white border border-charcoal/10 rounded-2xl p-3" />
              ) : (
                <p className="text-charcoal/50 text-sm">QR will appear here once it is uploaded in Admin Settings.</p>
              )}
              <p className="text-charcoal/60 text-sm mt-4">Scan with GPay, PhonePe, Paytm, or any UPI app.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: ShieldCheck, title: 'Secure', text: 'Admin verifies every transfer' },
                { icon: ReceiptText, title: 'Receipt', text: 'PDF sent after verification' },
                { icon: Heart, title: '80G', text: 'Add PAN to request a tax certificate' },
              ].map((item) => (
                <div key={item.title} className="bg-white border border-charcoal/10 rounded-2xl p-4">
                  <item.icon className="w-5 h-5 text-deep-green mb-2" />
                  <p className="font-bold text-charcoal text-sm">{item.title}</p>
                  <p className="text-charcoal/60 text-xs mt-1">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
