import { motion } from 'framer-motion';
import useSWR from 'swr';
import {
  Users, GraduationCap, HeartHandshake,
  Leaf, Activity, Globe
} from 'lucide-react';
import { Typography } from '@/components/common/Typography';
import { PageBanner } from '@/components/common/PageBanner';
import { fetcher } from '@/lib/fetcher';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Users, GraduationCap, HeartHandshake, Leaf, Activity, Globe,
};

const DEFAULT = {
  vision: {
    badge: 'Our Vision',
    heading: 'Towards an Equitable, Educated, and Prosperous Society',
    quote: 'To create a world where every individual has access to education, healthcare, dignity, security, equal opportunity, and self-reliance, ensuring sustainable development based on the principles of humanity, compassion, and social justice.',
    description: 'This vision is not limited to India alone, but is inspired by the spirit of global human welfare. The foundation believes that true progress is only possible when the weakest member of society is integrated into the mainstream of development.',
  },
  mission: {
    badge: 'Our Mission',
    heading: 'Service to Humanity and Sustainable Development',
    intro: 'The mission of KNT WORLD WELFARE FOUNDATION is—',
    points: [
      { icon: 'Users', text: 'To improve the standard of living of the deprived and weaker sections of society.' },
      { icon: 'GraduationCap', text: 'To promote education, health, and skill development.' },
      { icon: 'HeartHandshake', text: 'To work for the welfare of women, children, youth, and senior citizens.' },
      { icon: 'Leaf', text: 'To encourage environmental conservation and sustainable development.' },
      { icon: 'Activity', text: 'To accelerate social change through community participation.' },
      { icon: 'Globe', text: 'To develop a network of humanitarian cooperation at national and international levels.' },
    ],
  },
};

export function VisionMission() {
  const { data } = useSWR('/cms/global/vision-mission', fetcher);
  const content = { ...DEFAULT, ...(data?.content || {}) };
  const missionPoints = content.mission.points.map((point: any) =>
    typeof point === 'string' ? { icon: 'Users', text: point } : point
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7]">
      <PageBanner title="Vision & Mission" subtitle="Our guiding principles for a better tomorrow." />
      <div className="flex flex-col lg:flex-row flex-1">
        <div className="w-full lg:w-1/2 bg-gradient-to-br from-goldenrod/20 to-goldenrod/5 text-charcoal p-8 md:p-16 lg:p-24 flex flex-col justify-center relative overflow-hidden border-r border-charcoal/5">
          <div className="absolute top-0 right-0 w-[80%] h-[80%] bg-white/50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-[2px] w-12 bg-goldenrod" />
              <span className="text-deep-green font-bold tracking-[0.2em] uppercase text-sm">{content.vision.badge}</span>
            </div>
            <Typography variant="h1" className="text-4xl md:text-5xl lg:text-6xl mb-8 font-bold leading-tight">{content.vision.heading}</Typography>
            <div className="space-y-6 text-charcoal/80 text-lg md:text-xl leading-relaxed">
              <p className="font-bold text-charcoal">"{content.vision.quote}"</p>
              <p className="font-medium">{content.vision.description}</p>
            </div>
          </motion.div>
        </div>
        <div className="w-full lg:w-1/2 bg-[#FDFBF7] text-charcoal p-8 md:p-16 lg:p-24 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-[80%] h-[80%] bg-deep-green/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-[2px] w-12 bg-deep-green" />
              <span className="text-deep-green font-bold tracking-[0.2em] uppercase text-sm">{content.mission.badge}</span>
            </div>
            <Typography variant="h2" className="text-3xl md:text-4xl lg:text-5xl mb-6 font-bold leading-tight">{content.mission.heading}</Typography>
            <p className="text-charcoal/80 text-lg mb-10 font-medium">{content.mission.intro}</p>
            <div className="space-y-8">
              {missionPoints.map((point: { icon: string; text: string }, index: number) => {
                const Icon = ICON_MAP[point.icon] || Users;
                return (
                  <motion.div key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + index * 0.1 }} className="flex items-start gap-4 group">
                    <div className="w-12 h-12 rounded-full bg-deep-green/10 flex items-center justify-center shrink-0 group-hover:bg-deep-green transition-colors duration-300">
                      <Icon className="w-6 h-6 text-deep-green group-hover:text-white transition-colors duration-300" />
                    </div>
                    <div className="pt-2"><p className="text-charcoal/90 font-medium text-lg leading-snug">{point.text}</p></div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
