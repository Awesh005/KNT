import { motion } from 'framer-motion';
import { MapPin, Phone, Mail } from 'lucide-react';
import { Typography } from '@/components/common/Typography';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';

import { ORG, getCompanyDetail } from '@/config/org';

const defaultContactInfo = {
  address: ORG.address,
  phone: ORG.phone,
  email: ORG.email
};

export function ContactInfo() {
  const { data } = useSWR('/cms/about/main', fetcher);
  const companyDetails = data?.content?.companyDetails || [];

  const address = getCompanyDetail(companyDetails, 'REGISTERED OFFICE', defaultContactInfo.address);
  const phone = getCompanyDetail(companyDetails, 'CONTACT NUMBER', defaultContactInfo.phone);
  const email = getCompanyDetail(companyDetails, 'OFFICIAL EMAIL', defaultContactInfo.email).split('\n')[0];
  const cleanPhone = phone.replace(/[^0-9+]/g, '');
  const mapQuery = encodeURIComponent(address);

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-[2rem] p-8 md:p-10 shadow-lg border border-charcoal/5"
    >
      <Typography variant="h2" className="text-2xl font-bold text-deep-green mb-3">
        Get In Touch
      </Typography>
      <p className="text-charcoal/80 mb-8 text-base font-medium leading-relaxed">
        Feel free to drop by our office or contact us via phone or email.<br/>
        We typically respond to all online inquiries within 24 hours.
      </p>

      <div className="space-y-8 mb-10">
        <a 
          href={`https://maps.google.com/?q=${mapQuery}`} 
          target="_blank" 
          rel="noreferrer"
          className="flex items-start gap-4 group"
        >
          <div className="w-10 h-10 rounded-full bg-deep-green/10 flex items-center justify-center shrink-0 group-hover:bg-deep-green transition-colors duration-300">
            <MapPin className="w-5 h-5 text-deep-green group-hover:text-white transition-colors duration-300" />
          </div>
          <div>
            <h4 className="font-bold text-deep-green text-base mb-1">Office Address</h4>
            <p className="text-charcoal/80 text-sm group-hover:text-charcoal transition-colors font-medium">
              {address}
            </p>
          </div>
        </a>

        <a 
          href={`tel:${cleanPhone}`}
          className="flex items-start gap-4 group"
        >
          <div className="w-10 h-10 rounded-full bg-deep-green/10 flex items-center justify-center shrink-0 group-hover:bg-deep-green transition-colors duration-300">
            <Phone className="w-5 h-5 text-deep-green group-hover:text-white transition-colors duration-300" />
          </div>
          <div>
            <h4 className="font-bold text-deep-green text-base mb-1">Phone Number</h4>
            <p className="text-charcoal/80 text-sm group-hover:text-charcoal transition-colors font-medium">
              {phone}
            </p>
          </div>
        </a>

        <a 
          href={`mailto:${email}`}
          className="flex items-start gap-4 group"
        >
          <div className="w-10 h-10 rounded-full bg-deep-green/10 flex items-center justify-center shrink-0 group-hover:bg-deep-green transition-colors duration-300">
            <Mail className="w-5 h-5 text-deep-green group-hover:text-white transition-colors duration-300" />
          </div>
          <div>
            <h4 className="font-bold text-deep-green text-base mb-1">Email Address</h4>
            <p className="text-charcoal/80 text-sm group-hover:text-charcoal transition-colors font-medium">
              {email}
            </p>
          </div>
        </a>
      </div>

      {/* Map Embed */}
      <div className="rounded-2xl overflow-hidden h-64 border-2 border-white shadow-lg relative group">
        <a 
          href={`https://maps.google.com/?q=${mapQuery}`}
          target="_blank"
          rel="noreferrer"
          className="absolute top-4 left-4 z-10 bg-white px-4 py-2 rounded-lg font-bold text-sm text-deep-green shadow hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          Open in Maps <MapPin className="w-4 h-4" />
        </a>
        <iframe 
          src={`https://maps.google.com/maps?q=${mapQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`} 
          width="100%" 
          height="100%" 
          style={{ border: 0 }} 
          allowFullScreen={false} 
          loading="lazy" 
          referrerPolicy="no-referrer-when-downgrade"
          title="Office Location"
          className="group-hover:scale-105 transition-transform duration-700"
        />
      </div>
    </motion.div>
  );
}
