import { Search } from 'lucide-react';
import { CategoryPills } from '@/components/common/CategoryPills';
import { Input } from '@/components/common/Input';
import type { CampaignCategory, CampaignStatus } from '@/types';

interface CampaignFiltersProps {
  selectedCategory: CampaignCategory | 'All';
  setSelectedCategory: (cat: CampaignCategory | 'All') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedStatus: CampaignStatus | 'All';
  setSelectedStatus: (status: CampaignStatus | 'All') => void;
  statuses: (CampaignStatus | 'All')[];
}

export function CampaignFilters({
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  selectedStatus,
  setSelectedStatus,
  statuses
}: CampaignFiltersProps) {
  return (
    <>
      <div className="mb-6 z-20 relative">
        <CategoryPills 
          selectedCategory={selectedCategory} 
          onSelect={(cat) => setSelectedCategory(cat as CampaignCategory | 'All')} 
          showAllOption 
          className="md:-mx-8"
        />
      </div>
      
      <div className="bg-white p-6 rounded-2xl border border-charcoal/10 shadow-[0_16px_40px_rgba(15,26,22,0.04)] mb-10 flex flex-col md:flex-row gap-6 items-end z-20 relative">
        <div className="w-full md:w-1/2">
          <Input 
            label="Search Campaigns" 
            placeholder="Search by title or keyword..." 
            icon={<Search className="w-4 h-4" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="w-full md:w-1/2 flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-charcoal ml-1">
            Status
          </label>
          <select 
            className="w-full px-4 py-3 bg-white border border-charcoal/15 rounded-xl text-[13px] text-charcoal transition-all duration-300 focus:outline-none focus:ring-2 focus:border-goldenrod focus:ring-goldenrod/20 hover:border-charcoal/30 shadow-sm appearance-none"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as CampaignStatus | 'All')}
          >
            {statuses.map(status => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
}
