import { useNavigate } from 'react-router';
import { Heart } from 'lucide-react';
import { CallToActionBanner } from '@/components/common/CallToActionBanner';
import { PageBanner } from '@/components/common/PageBanner';

import { WhoWeAre } from '@/components/sections/about/WhoWeAre';
import { OurHighlights } from '@/components/sections/about/OurHighlights';
import { OurPublications } from '@/components/sections/about/OurPublications';
import { LegalInformation } from '@/components/sections/about/LegalInformation';

export function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-light-green pb-24">
      <PageBanner 
        title="About KNT World Welfare Foundation"
        subtitle="Empowering lives, building a compassionate, self-reliant, and sustainable society."
      />

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <WhoWeAre />
          <OurHighlights />
          <OurPublications />
          <LegalInformation />
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <CallToActionBanner 
          title="Join Our Mission"
          subtitle="Be a part of KNT World Welfare Foundation. Together, let us serve humanity and build a brighter, more equitable world for all."
          buttonText="Donate Now"
          buttonIcon={<Heart className="w-4 h-4 mr-2" />}
          onButtonClick={() => navigate('/campaigns')}
          className="rounded-3xl"
        />
      </div>
    </div>
  );
}
