import { Typography } from '@/components/common/Typography';
import { Card, CardBody } from '@/components/common/Card';
import type { Payout } from '@/types';

interface CampaignPayoutsProps {
  payouts: Payout[];
}

export function CampaignPayouts({ payouts }: CampaignPayoutsProps) {
  if (payouts.length === 0) {
    return (
      <div className="pt-8 text-center text-charcoal/60 bg-white rounded-2xl p-8 border border-charcoal/10">
        <Typography variant="body">No payouts have been made yet.</Typography>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-4">
      {payouts.map((payout) => (
        <Card key={payout.id} className="border border-charcoal/10 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <CardBody className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-5 border-b md:border-b-0 md:border-r border-charcoal/10 bg-gray-50/50">
                <div className="mb-4">
                  <Typography variant="small" className="text-charcoal/50 font-bold uppercase tracking-wider mb-1">Date</Typography>
                  <Typography variant="body" className="font-bold text-charcoal">
                    {new Date(payout.transfer_date).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric'
                    })}
                  </Typography>
                </div>
                <div>
                  <Typography variant="small" className="text-charcoal/50 font-bold uppercase tracking-wider mb-1">Amount Transferred</Typography>
                  <Typography variant="h3" className="text-deep-green">
                    ₹{Number(payout.amount).toLocaleString()}
                  </Typography>
                </div>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <Typography variant="small" className="text-charcoal/50 font-bold uppercase tracking-wider mb-1">Account Holder</Typography>
                  <Typography variant="body" className="font-bold text-charcoal">
                    {payout.account_holder}
                  </Typography>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Typography variant="small" className="text-charcoal/50 font-bold uppercase tracking-wider mb-1">Account Details</Typography>
                    <Typography variant="body" className="font-bold text-charcoal">
                      {payout.account_details}
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="small" className="text-charcoal/50 font-bold uppercase tracking-wider mb-1">Transferred To</Typography>
                    <Typography variant="body" className="font-bold text-charcoal">
                      {payout.transferred_to}
                    </Typography>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
