import { motion } from 'framer-motion';
import useSWR from 'swr';
import { Typography } from '@/components/common/Typography';
import { Heart, Users, Leaf, GraduationCap, Activity, Baby, Briefcase, ShieldCheck } from 'lucide-react';
import { fetcher } from '@/lib/fetcher';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Heart, Users, Leaf, GraduationCap, Activity, Baby, Briefcase, ShieldCheck,
};

const DEFAULT_HIGHLIGHTS = [
  { text: 'Holistic Development Approach', icon: 'Heart' },
  { text: 'Focus on Rural & Underprivileged Communities', icon: 'Users' },
  { text: 'Sustainable & Environment-Friendly Initiatives', icon: 'Leaf' },
  { text: 'Value-Based Education & Spiritual Growth', icon: 'GraduationCap' },
  { text: 'Health, Wellness & Social Care', icon: 'Activity' },
  { text: 'Women & Child Empowerment', icon: 'Baby' },
  { text: 'Skill Development & Livelihood Creation', icon: 'Briefcase' },
  { text: 'Transparency, Integrity & Accountability', icon: 'ShieldCheck' },
];

export function OurHighlights() {
  const { data } = useSWR('/cms/about/main', fetcher);
  const highlights = data?.content?.highlights?.length ? data.content.highlights : DEFAULT_HIGHLIGHTS;

  return (
    <div className="mb-20">
      <div className="text-center mb-12">
        <Typography variant="h2" className="text-3xl md:text-4xl font-bold mb-4">Our Highlights</Typography>
        <div className="w-24 h-1 bg-deep-green mx-auto rounded-full mb-8" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {highlights.map((highlight: { text: string; icon: string }, index: number) => {
          const Icon = ICON_MAP[highlight.icon] || Heart;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="bg-deep-green/[0.08] p-6 rounded-2xl shadow-sm hover:shadow-md transition-all border border-charcoal/5 group text-center flex flex-col items-center justify-center gap-4 h-full"
            >
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center group-hover:bg-deep-green group-hover:text-white transition-colors duration-300 shadow-sm">
                <Icon className="w-8 h-8 text-deep-green group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="font-bold text-charcoal text-lg group-hover:text-deep-green transition-colors">{highlight.text}</h3>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
