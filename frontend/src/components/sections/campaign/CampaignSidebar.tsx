import { motion } from 'framer-motion';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import { Card, CardBody } from '@/components/common/Card';
import { Users, Calendar, Share2 } from 'lucide-react';
import type { Campaign, Donation } from '@/types';

interface CampaignSidebarProps {
  campaign: Campaign;
  donations: Donation[];
  onDonateClick: () => void;
}

export function CampaignSidebar({ campaign, donations, onDonateClick }: CampaignSidebarProps) {
  const progressPercentage = Math.min(100, (campaign.raisedAmount / campaign.targetAmount) * 100);

  return (
    <div className="space-y-6">
      {/* Donation Card */}
      <Card className="border border-charcoal/10 shadow-md">
        <CardBody className="p-5 space-y-5">
          
          {/* Stats */}
          <div className="text-center">
            <Typography variant="h2" className="text-deep-green mb-1 text-3xl">
              ₹{(campaign.raisedAmount || 0).toLocaleString()}
            </Typography>
            <Typography variant="small" className="text-charcoal/60">
              raised of <span className="font-bold">₹{(campaign.targetAmount || 0).toLocaleString()}</span> goal
            </Typography>
          </div>

          {/* Progress Bar (Animates on load) */}
          <div className="w-full bg-charcoal/5 rounded-full h-2 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
              className="bg-goldenrod h-full rounded-full"
            />
          </div>

          <div className="flex justify-between text-charcoal/60 px-1 text-[12px]">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>{donations.length} supporters</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{Math.round(progressPercentage)}% funded</span>
            </div>
          </div>

          {/* Primary CTA */}
          <Button variant="primary" className="w-full" size="lg" onClick={onDonateClick}>
            Donate Now
          </Button>
          
          <Button variant="outline" className="w-full sm:hidden" size="md">
            <Share2 className="w-4 h-4 mr-2" /> Share Campaign
          </Button>

        </CardBody>
      </Card>
    </div>
  );
}
