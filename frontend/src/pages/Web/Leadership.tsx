import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Quote, Loader2, User } from 'lucide-react';
import useSWR from 'swr';
import { Typography } from '@/components/common/Typography';
import { PageBanner } from '@/components/common/PageBanner';
import { useLeadershipStore } from '@/stores/leadershipStore';
import { getImageUrl } from '@/utils/getImageUrl';
import { fetcher } from '@/lib/fetcher';

const DEFAULT_FOUNDER = {
  badge: "Founder's Message",
  name: '',
  role: '',
  heading: 'Guiding Light of Our Mission',
  imageUrl: '/Founder.jpeg',
  signatureUrl: '/signature.png',
  paragraphs: [
    'At KNT World Welfare Foundation, our mission is to create meaningful change by empowering lives and building a compassionate, self-reliant, and sustainable society. We believe that true development comes when education, health, spiritual growth, and environmental care move hand in hand for the upliftment of every individual.',
    'Through our projects, we are not just building institutions, we are nurturing hope, dignity, and opportunities for a better tomorrow. Together, let us serve humanity and build a brighter, more equitable world for all.',
  ],
};

const DEFAULT_COFOUNDER = {
  badge: "Co-Founder's Message",
  name: 'Vikram Kumar',
  role: 'Co-Founder',
  heading: 'Together We Serve Humanity',
  imageUrl: '/CoFounder.png',
  signatureUrl: '',
  paragraphs: [
    'KNT World Welfare Foundation was built on a simple belief — that every person deserves dignity, opportunity, and a fair chance to grow. As Co-Founder, I work to turn this belief into daily action through education, health, and community programmes that reach those who need us most.',
    'Our strength is not only in projects, but in people who walk with us. With discipline, compassion, and shared responsibility, we will keep building a foundation that serves for generations.',
  ],
};

function LeaderQuoteCard({
  person,
  imageAlt,
  reverse = false,
}: {
  person: {
    badge: string;
    name?: string;
    role?: string;
    heading: string;
    imageUrl: string;
    signatureUrl?: string;
    paragraphs: string[];
  };
  imageAlt: string;
  reverse?: boolean;
}) {
  return (
    <div className="bg-white rounded-[2.5rem] p-8 md:p-16 shadow-xl border border-charcoal/5 mb-16 relative overflow-hidden">
      <div className={`absolute top-0 ${reverse ? 'left-0 -translate-x-1/2' : 'right-0 translate-x-1/2'} w-[40%] h-[100%] bg-goldenrod/5 rounded-full blur-[80px] pointer-events-none`} />

      <div className={`flex flex-col lg:flex-row gap-12 lg:gap-20 items-center relative z-10 ${reverse ? 'lg:flex-row-reverse' : ''}`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="w-full max-w-md lg:w-1/3 shrink-0"
        >
          <div className="relative">
            <div className="absolute -inset-4 bg-deep-green/10 rounded-3xl -rotate-6 transform origin-center transition-transform hover:rotate-0 duration-500" />
            <div className="absolute -inset-4 bg-goldenrod/20 rounded-3xl rotate-3 transform origin-center transition-transform hover:rotate-0 duration-500" />
            <div className="relative bg-white p-3 rounded-2xl shadow-xl border border-charcoal/10 overflow-hidden group">
              <div className="rounded-xl overflow-hidden bg-gray-100 aspect-[4/5]">
                <img
                  loading="lazy"
                  src={getImageUrl(person.imageUrl)}
                  alt={imageAlt}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: reverse ? -30 : 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="flex-1"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="h-[2px] w-12 bg-goldenrod" />
            <span className="text-deep-green font-bold tracking-[0.2em] uppercase text-sm">{person.badge}</span>
          </div>

          <Typography variant="h2" className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8 text-charcoal">
            {person.heading}
          </Typography>

          <div className="relative">
            <Quote className="absolute -top-4 -left-4 w-12 h-12 text-goldenrod/20 -z-10" />
            {person.paragraphs.map((paragraph: string, index: number) => (
              <p key={index} className="text-charcoal/80 text-lg md:text-xl leading-relaxed mb-6 font-medium italic">
                "{paragraph}"
              </p>
            ))}
          </div>

          <div className="border-t border-charcoal/10 pt-6 mt-4">
            {person.signatureUrl ? (
              <div className="h-20 mb-4">
                <img loading="lazy" src={getImageUrl(person.signatureUrl)} alt={`${imageAlt} signature`} className="h-full object-contain object-left mix-blend-multiply" />
              </div>
            ) : null}
            {person.name ? (
              <div>
                <p className="font-bold text-xl text-deep-green">{person.name}</p>
                {person.role ? (
                  <p className="text-sm uppercase tracking-[0.16em] text-goldenrod font-semibold mt-1">{person.role}</p>
                ) : null}
              </div>
            ) : null}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export function Leadership() {
  const { teamMembers, isLoading, fetchTeamMembers } = useLeadershipStore();
  const { data: founderData } = useSWR('/cms/global/founder', fetcher);
  const { data: cofounderData } = useSWR('/cms/global/cofounder', fetcher);
  const founder = { ...DEFAULT_FOUNDER, ...(founderData?.content || {}) };
  const cofounder = { ...DEFAULT_COFOUNDER, ...(cofounderData?.content || {}) };

  useEffect(() => {
    fetchTeamMembers();
  }, [fetchTeamMembers]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
      <PageBanner 
        title="Our Leadership"
        subtitle="Meet the visionary minds driving our mission forward."
      />

      <section className="py-20 flex-1">
        <div className="container mx-auto px-4 max-w-7xl">
          
          <LeaderQuoteCard person={founder} imageAlt="Founder" />
          <LeaderQuoteCard person={cofounder} imageAlt={cofounder.name || 'Co-Founder'} reverse />

          {/* Team Members Section */}
          <div className="text-center mb-16">
            <Typography variant="h2" className="text-3xl md:text-4xl font-bold mb-4">
              Our Core Team
            </Typography>
            <div className="w-24 h-1 bg-deep-green mx-auto rounded-full mb-8" />
            <p className="text-charcoal/70 max-w-2xl mx-auto text-lg">
              Dedicated professionals working tirelessly to turn our vision into reality.
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-deep-green" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="bg-white rounded-[2rem] shadow-sm border border-charcoal/5 overflow-hidden group hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative aspect-square overflow-hidden bg-gray-100 flex items-center justify-center">
                    {member.imageUrl ? (
                      <img loading="lazy" 
                        src={getImageUrl(member.imageUrl)} 
                        alt={member.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <User className="w-24 h-24 text-charcoal/20 group-hover:scale-110 transition-transform duration-500" />
                    )}
                  </div>
                  <div className="p-6 text-center">
                    <h3 className="font-bold text-charcoal text-xl mb-1 group-hover:text-deep-green transition-colors">
                      {member.name}
                    </h3>
                    <p className="text-goldenrod font-bold text-sm uppercase tracking-wider mb-3">
                      {member.role}
                    </p>
                    <p className="text-charcoal/70 text-sm leading-relaxed">
                      {member.bio}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

        </div>
      </section>
    </div>
  );
}
