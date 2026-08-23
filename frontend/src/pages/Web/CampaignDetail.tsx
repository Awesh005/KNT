import { useState } from 'react';
import { useParams, Link } from 'react-router';
import { AlertCircle } from 'lucide-react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import { DonationModal } from '@/components/donation/DonationModal';
import { CampaignHero } from '@/components/sections/campaign/CampaignHero';
import { CampaignStory } from '@/components/sections/campaign/CampaignStory';
import { CampaignPayouts } from '@/components/sections/campaign/CampaignPayouts';
import { CampaignDonors } from '@/components/sections/campaign/CampaignDonors';
import { CampaignSidebar } from '@/components/sections/campaign/CampaignSidebar';
import { ProjectMap, ProjectUpdates } from '@/pages/Web/Impact';
import { sdgLabel } from '@/constants/sdg';
import type { Campaign, Donation, Payout } from '@/types';

export function CampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'story' | 'payouts'>('story');

  const handleDonateClick = () => {
    setIsDonationModalOpen(true);
  };

  const { data: campaignRes, error, isLoading: isCampaignLoading } = useSWR(`/campaigns/${id}`, fetcher);
  const { data: donationsRes, isLoading: isDonationsLoading } = useSWR(`/campaigns/${id}/donations`, fetcher);
  const { data: payoutsRes, isLoading: isPayoutsLoading } = useSWR(`/campaigns/${id}/payouts`, fetcher);
  const { data: impactRes } = useSWR(id ? `/impact/campaigns/${id}` : null, fetcher);
  
  const campaignRaw = campaignRes?.campaign;
  const campaign: Campaign | null = campaignRaw ? {
    id: campaignRaw.id,
    title: campaignRaw.title,
    story: campaignRaw.story,
    coverImage: campaignRaw.cover_image,
    targetAmount: Number(campaignRaw.target_amount),
    raisedAmount: Number(campaignRaw.raised_amount),
    deadline: campaignRaw.deadline,
    status: campaignRaw.status,
    createdBy: campaignRaw.created_by,
    category: campaignRaw.category,
    isUrgent: campaignRaw.is_urgent,
    isFeatured: campaignRaw.is_featured,
    videoUrl: campaignRaw.video_url,
    creatorName: campaignRaw.creator_name,
    createdAt: campaignRaw.created_at
  } : null;
  
  const donations: Donation[] = donationsRes?.donations || []; 
  const payouts: Payout[] = payoutsRes?.payouts || [];
  const sdgTags: string[] = Array.isArray(campaignRaw?.sdg_tags)
    ? campaignRaw.sdg_tags
    : String(campaignRaw?.sdg_tags || '').split(',').map((tag: string) => tag.trim()).filter(Boolean);

  if (isCampaignLoading || isDonationsLoading || isPayoutsLoading) {
    return (
      <div className="min-h-screen bg-light-green pt-32 pb-24 flex justify-center">
        <div className="w-12 h-12 border-4 border-deep-green/20 border-t-deep-green rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-light-green pt-8 pb-24 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6 opacity-80" />
          <Typography variant="h2" className="mb-4">Campaign Not Found</Typography>
          <Typography variant="body" className="mb-8">
            {error || "The campaign you're looking for doesn't exist or has been removed."}
          </Typography>
          <Link to="/campaigns">
            <Button>Browse Campaigns</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-green pt-8 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Breadcrumb & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 text-charcoal/60 text-[11px] font-bold uppercase tracking-[0.16em]">
            <Link to="/" className="hover:text-charcoal transition-colors">Home</Link>
            <span>/</span>
            <Link to="/campaigns" className="hover:text-charcoal transition-colors">Campaigns</Link>
            <span>/</span>
            <span className="text-charcoal">{campaign.category}</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-10">
          
          {/* Main Content (Left Column) */}
          <div className="lg:col-span-7 space-y-10">
            <CampaignHero campaign={campaign} donations={donations} />
            
            {/* Tabs */}
            <div className="flex border-b border-charcoal/10 gap-8">
              <button
                className={`pb-4 font-bold text-[16px] transition-colors relative ${
                  activeTab === 'story' ? 'text-deep-green' : 'text-charcoal/40 hover:text-charcoal/70'
                }`}
                onClick={() => setActiveTab('story')}
              >
                Story
                {activeTab === 'story' && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-deep-green rounded-t-full" />
                )}
              </button>
              <button
                className={`pb-4 font-bold text-[16px] transition-colors relative ${
                  activeTab === 'payouts' ? 'text-deep-green' : 'text-charcoal/40 hover:text-charcoal/70'
                }`}
                onClick={() => setActiveTab('payouts')}
              >
                Payouts ({payouts.length})
                {activeTab === 'payouts' && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-deep-green rounded-t-full" />
                )}
              </button>
            </div>

            {activeTab === 'story' ? (
              <CampaignStory campaign={campaign} />
            ) : (
              <CampaignPayouts payouts={payouts} />
            )}

            {sdgTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {sdgTags.map((code) => (
                  <span key={code} className="px-3 py-1 rounded-full bg-deep-green/10 text-deep-green text-xs font-bold">
                    SDG {code} · {sdgLabel(code)}
                  </span>
                ))}
              </div>
            )}

            <ProjectMap lat={campaignRaw?.latitude} lng={campaignRaw?.longitude} label={campaignRaw?.location_label} />
            <ProjectUpdates updates={impactRes?.updates || []} />

            <CampaignDonors donations={donations} />
          </div>

          {/* Sidebar (Right Column) */}
          <div className="lg:col-span-4 lg:col-start-9 space-y-6 sticky top-24 self-start">
            <CampaignSidebar 
              campaign={campaign} 
              donations={donations} 
              onDonateClick={handleDonateClick} 
            />
          </div>
        </div>
      </div>
      
      {campaign && (
        <DonationModal 
          isOpen={isDonationModalOpen}
          onClose={() => setIsDonationModalOpen(false)}
          campaignId={campaign.id}
        />
      )}
    </div>
  );
}
