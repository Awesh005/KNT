import { motion } from 'framer-motion';
import { Typography } from '@/components/common/Typography';
import { Building2, Scale, Hash, Calendar, CreditCard, List, Globe, MapPin, Mail, Phone, FileText, Heart } from 'lucide-react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { mergeCompanyDetails } from '@/config/org';

const IconMap: Record<string, any> = {
  Building2, Scale, Hash, Calendar, CreditCard, List, Globe, MapPin, Mail, Phone, FileText, Heart
};

export function LegalInformation() {
  const { data } = useSWR('/cms/about/main', fetcher);
  const companyDetails = mergeCompanyDetails(data?.content?.companyDetails);

  return (
    <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-charcoal/5">
      <div className="text-center mb-10">
        <span className="text-goldenrod font-bold tracking-[0.2em] uppercase text-sm mb-3 block">
          Trust & Transparency
        </span>
        <Typography variant="h2" className="text-3xl md:text-4xl font-bold text-deep-green">
          Registration & <span className="text-goldenrod">Legal Information</span>
        </Typography>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {companyDetails.map((detail: any, index: number) => {
          const Icon = IconMap[detail.icon] || Building2;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05, duration: 0.5 }}
              className="bg-white p-6 rounded-2xl flex items-start gap-5 shadow-sm hover:shadow-md transition-all border border-charcoal/5 group"
            >
              <div className="w-12 h-12 shrink-0 rounded-full bg-goldenrod/20 flex items-center justify-center group-hover:bg-deep-green transition-colors duration-300">
                <Icon className="w-6 h-6 text-deep-green group-hover:text-white transition-colors duration-300" />
              </div>
              <div className="flex-1 mt-1">
                <h4 className="text-charcoal/60 text-xs md:text-sm font-bold uppercase tracking-wider mb-1">
                  {detail.label}
                </h4>
                <div className="font-bold text-charcoal text-sm md:text-base leading-relaxed whitespace-pre-line group-hover:text-deep-green transition-colors">
                  {detail.value || 'Applied / Under Process'}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
