import { useMemo } from 'react';
import { HeartHandshake, CreditCard, Users, Clock } from 'lucide-react';
import { Typography } from '@/components/common/Typography';
import { StatsCard } from '@/components/admin/dashboard/StatsCard';
import { RecentDonations } from '@/components/admin/dashboard/RecentDonations';
import { PendingRequests } from '@/components/admin/dashboard/PendingRequests';
import { formatCompactCurrency } from '@/utils/formatters';

import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';

export function Dashboard() {
  const { data: campaignsData } = useSWR('/campaigns?limit=50', fetcher);
  const campaigns = campaignsData?.campaigns || [];
  
  const { data: donationsData } = useSWR('/donations?limit=50', fetcher);
  const donations = donationsData?.donations || [];
  
  const { data: usersData } = useSWR('/users?limit=50', fetcher);
  const users = usersData?.users || [];

  const stats = useMemo(() => {
    const totalCampaigns = campaigns.length;
    
    const totalDonations = donations
      .filter((d: any) => d.status === 'verified')
      .reduce((sum: number, d: any) => sum + (Number(d.amount) || 0), 0);
      
    const pendingRequests = campaigns.filter((c: any) => c.status === 'pending').length;
    
    const totalDonors = users.filter((u: any) => u.role === 'Donor').length;
    
    return {
      totalCampaigns,
      totalDonations,
      pendingRequests,
      totalDonors
    };
  }, [campaigns, donations, users]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Typography variant="h2" className="!text-2xl text-deep-green mb-1">
            Dashboard Overview
          </Typography>
          <Typography variant="body" className="text-charcoal/60 text-sm">
            Here's what's happening with your platform today.
          </Typography>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Campaigns" 
          value={stats.totalCampaigns} 
          icon={HeartHandshake} 
          trend="12% this month"
          trendUp={true}
        />
        <StatsCard 
          title="Total Donations" 
          value={formatCompactCurrency(stats.totalDonations)} 
          icon={CreditCard} 
          trend="8% this week"
          trendUp={true}
        />
        <StatsCard 
          title="Pending Requests" 
          value={stats.pendingRequests} 
          icon={Clock} 
          trend="Needs attention"
          trendUp={false} // Showing false to indicate it's a metric to watch
        />
        <StatsCard 
          title="Active Donors" 
          value={stats.totalDonors} 
          icon={Users} 
          trend="5% this month"
          trendUp={true}
        />
      </div>

      {/* Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch">
        <RecentDonations donations={donations} campaigns={campaigns} />
        <PendingRequests campaigns={campaigns} />
      </div>
    </div>
  );
}
