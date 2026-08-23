import { HeroSection } from '@/components/sections/home/HeroSection';
import { ImpactStats } from '@/components/sections/home/ImpactStats';
import { HowItWorks } from '@/components/sections/home/HowItWorks';
import { UrgentCauses } from '@/components/sections/home/UrgentCauses';
import { FeaturedCampaigns } from '@/components/sections/home/FeaturedCampaigns';
import { WhyTrustUs } from '@/components/sections/home/WhyTrustUs';
import { BannerCards } from '@/components/sections/home/BannerCards';
import { FeaturedMoments } from '@/components/sections/home/FeaturedMoments';
import { HomeDonationStrip } from '@/components/sections/home/HomeDonationStrip';
import { CallToActionBanner } from '@/components/common/CallToActionBanner';
import { Testimonials } from '@/components/sections/home/Testimonials';

export function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />
      <ImpactStats />
      <HowItWorks />
      <UrgentCauses />
      <FeaturedCampaigns />
      <WhyTrustUs />
      <BannerCards />
      <FeaturedMoments />
      <HomeDonationStrip />
      <CallToActionBanner 
        title="Need help setting up your free fundraiser?"
        subtitle="Our team of dedicated experts is here to guide you step-by-step through the process."
        buttonText="Request a Callback"
        phoneNumber="+919876543210"
      />
      <Testimonials />
    </div>
  );
}
