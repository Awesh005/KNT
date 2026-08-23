import { PageBanner } from '@/components/common/PageBanner';

import { ContactInfo } from '@/components/sections/contact/ContactInfo';
import { ContactForm } from '@/components/sections/contact/ContactForm';

export function Contact() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] relative">
      <PageBanner 
        title="Contact Us"
        subtitle="Get in touch with us to support our mission or learn more."
      />

      <div className="container mx-auto px-4 max-w-6xl py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ContactInfo />
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
