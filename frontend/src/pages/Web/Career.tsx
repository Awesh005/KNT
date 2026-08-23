import { PageBanner } from '@/components/common/PageBanner';
import { CareerNoticeInfo } from '@/components/sections/career/CareerNoticeInfo';
import { OpenPositions } from '@/components/sections/career/OpenPositions';

export function Career() {

  return (
    <div className="min-h-screen bg-light-green pb-24 relative">
      <PageBanner 
        title="Join Our Team"
        subtitle="Be a part of our mission to create a positive impact. Explore career opportunities with KNT World Welfare Foundation."
      />

      <div className="container mx-auto px-4 max-w-7xl py-16">
        <CareerNoticeInfo />
        <OpenPositions />
      </div>
    </div>
  );
}
