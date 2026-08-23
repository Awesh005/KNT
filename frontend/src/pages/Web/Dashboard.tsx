import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { Download, Heart, ReceiptText, ArrowRight } from 'lucide-react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { useAuthStore } from '@/stores/authStore';
import { Typography } from '@/components/common/Typography';
import { Card, CardBody } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { getImageUrl } from '@/utils/getImageUrl';

export function Dashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Fetch donations for the user
  const { data, isLoading } = useSWR(user ? '/donations/my-donations' : null, fetcher);
  const donations = data?.donations || [];

  const handleDownloadReceipt = (donationId: string, receiptUrl?: string) => {
    if (receiptUrl) {
      window.open(getImageUrl(receiptUrl), '_blank');
    } else {
      alert(`Document is not available yet for donation ${donationId}`);
    }
  };

  if (!user) return null;

  const totalDonated = donations.reduce((sum: number, d: any) => sum + Number(d.amount), 0);
  const supportedCausesCount = new Set(donations.map((d: any) => d.campaignId)).size;

  return (
    <div className="min-h-screen bg-fog-gray pt-24 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Welcome Section */}
        <div className="mb-10">
          <Typography variant="overline" className="text-goldenrod mb-2 block">Donor Portal</Typography>
          <Typography variant="h2" className="text-charcoal mb-4">Welcome back, {user.name.split(' ')[0]}</Typography>
          <Typography variant="body" className="text-charcoal/60">Manage your giving history and download tax receipts.</Typography>
        </div>

        {/* Impact Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-deep-green text-white border-transparent">
            <CardBody className="p-6">
              <Heart className="w-8 h-8 text-goldenrod mb-4 opacity-80" />
              <Typography variant="overline" className="text-white/60 block mb-1">Total Impact</Typography>
              <Typography variant="h2" className="text-white">₹{totalDonated.toLocaleString()}</Typography>
            </CardBody>
          </Card>
          
          <Card className="border-charcoal/10">
            <CardBody className="p-6">
              <ReceiptText className="w-8 h-8 text-charcoal/30 mb-4" />
              <Typography variant="overline" className="text-charcoal/60 block mb-1">Causes Supported</Typography>
              <Typography variant="h2" className="text-charcoal">{supportedCausesCount}</Typography>
            </CardBody>
          </Card>
          
          <Card className="border-charcoal/10 flex flex-col justify-center items-start">
            <CardBody className="p-6">
              <Typography variant="body" className="font-bold mb-3 text-charcoal">Want to do more?</Typography>
              <Link to="/donate" className="w-full">
                <Button variant="outline" className="w-full">
                  Donate Now <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardBody>
          </Card>
        </div>

        {/* Donation History Table */}
        <div className="bg-white border border-charcoal/10 rounded-2xl overflow-hidden shadow-[0_16px_40px_rgba(15,26,22,0.04)]">
          <div className="px-6 py-5 border-b border-charcoal/10 flex items-center justify-between">
            <Typography variant="h4">Donation History</Typography>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[14px]">
              <thead className="bg-charcoal/5 border-b border-charcoal/10 text-[11px] font-bold uppercase tracking-[0.16em] text-charcoal/60">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Campaign</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Documents</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal/5">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-charcoal/40">
                      <div className="w-8 h-8 border-2 border-deep-green/20 border-t-deep-green rounded-full animate-spin mx-auto mb-4" />
                      Loading history...
                    </td>
                  </tr>
                ) : donations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-charcoal/40">
                      You haven't made any donations yet.
                    </td>
                  </tr>
                ) : (
                  donations.map((donation: any) => (
                    <tr key={donation.id} className="hover:bg-charcoal/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-charcoal/70">
                        {new Date(donation.donated_at || donation.donatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <Link to={`/campaigns/${donation.campaign_id || donation.campaignId}`} className="font-bold text-charcoal hover:text-goldenrod transition-colors">
                          {donation.campaign_title || donation.campaign?.title || donation.campaign_id || donation.campaignId}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-deep-green">
                        ₹{Number(donation.amount).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.16em] ${
                          donation.status === 'verified' ? 'bg-green-100 text-green-800' :
                          donation.status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {donation.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDownloadReceipt(donation.id, donation.receiptUrl)}
                            disabled={donation.status !== 'verified'}
                          >
                            <Download className="w-4 h-4 mr-2" /> Receipt
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDownloadReceipt(donation.id, donation.certificateUrl)}
                            disabled={!donation.certificateUrl}
                          >
                            80G
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        
      </div>
    </div>
  );
}
