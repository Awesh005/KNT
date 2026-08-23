import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { HeartHandshake } from 'lucide-react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { CallToActionBanner } from '@/components/common/CallToActionBanner';
import type { CampaignCategory, CampaignStatus, Campaign } from '@/types';

import { CampaignHeader } from '@/components/sections/campaigns/CampaignHeader';
import { CampaignFilters } from '@/components/sections/campaigns/CampaignFilters';
import { CampaignGrid } from '@/components/sections/campaigns/CampaignGrid';

export function Campaigns() {
  const [searchParams] = useSearchParams();
  
  const initialCategory = (searchParams.get('category') as CampaignCategory) || 'All';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CampaignCategory | 'All'>(initialCategory);
  const [selectedStatus, setSelectedStatus] = useState<CampaignStatus | 'All'>('approved'); // Default to approved for public view
  const navigate = useNavigate();

  // Fetch campaigns from real API
  const { data, isLoading } = useSWR(`/campaigns?limit=100`, fetcher);
  const campaigns: Campaign[] = (data?.campaigns || []).map((c: any) => ({
    id: c.id,
    title: c.title,
    story: c.story,
    coverImage: c.cover_image,
    targetAmount: Number(c.target_amount),
    raisedAmount: Number(c.raised_amount),
    deadline: c.deadline,
    status: c.status,
    createdBy: c.created_by,
    category: c.category,
    isUrgent: c.is_urgent,
    isFeatured: c.is_featured,
    createdAt: c.created_at
  }));

  useEffect(() => {
    const cat = searchParams.get('category') as CampaignCategory;
    if (cat && cat !== selectedCategory) {
      setSelectedCategory(cat);
    }
  }, [searchParams, selectedCategory]);

  const statuses: (CampaignStatus | 'All')[] = ['All', 'pending', 'approved', 'closed', 'rejected'];

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          campaign.story.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || campaign.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || campaign.status === selectedStatus;
    const matchesUrgent = searchParams.get('urgent') === 'true' ? campaign.isUrgent : true;
    
    return matchesSearch && matchesCategory && matchesStatus && matchesUrgent;
  });

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedStatus('approved');
    if (searchParams.has('urgent')) {
      searchParams.delete('urgent');
      navigate({ search: searchParams.toString() }, { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-light-green pb-24">
      <CampaignHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CampaignFilters 
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          statuses={statuses}
        />

        <CampaignGrid 
          isLoading={isLoading}
          campaigns={filteredCampaigns}
          onClearFilters={handleClearFilters}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <CallToActionBanner 
          title="Can't find what you're looking for?"
          subtitle="Start your own fundraiser today. It takes only a few minutes to create a campaign and start receiving support."
          buttonText="Start a Fundraiser"
          buttonIcon={<HeartHandshake className="w-5 h-5 mr-2" />}
          onButtonClick={() => navigate('/start-fundraiser')}
          className="rounded-3xl"
        />
      </div>
    </div>
  );
}
