import { motion, type Variants } from 'framer-motion';
import { Typography } from '@/components/common/Typography';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { getImageUrl } from '@/utils/getImageUrl';

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export function FeaturedMoments() {
  const { data } = useSWR('/cms/global/featured_moments', fetcher);
  const featuredMoments = data?.content || [];
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp}>
            <Typography variant="overline" className="text-goldenrod mb-2 block">Our Impact</Typography>
          </motion.div>
          <motion.div variants={fadeInUp}>
            <Typography variant="h2" className="text-charcoal mb-4">Featured Moments</Typography>
          </motion.div>
          <motion.div variants={fadeInUp}>
            <Typography variant="body" className="max-w-2xl mx-auto text-charcoal/60">
              A glimpse into the milestones and partnerships that drive our commitment to positive social change.
            </Typography>
          </motion.div>
        </motion.div>
      </div>

      <div className="relative w-full overflow-hidden">
        {/* Fading Edges for desktop only */}
        <div className="hidden lg:block absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="hidden lg:block absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        {/* Marquee Track */}
        <div className="flex w-max animate-marquee gap-6 items-stretch px-6 pb-8">
          {[...featuredMoments, ...featuredMoments].map((moment, idx) => (
            <div key={idx} className="w-[320px] md:w-[450px] flex-shrink-0 bg-deep-green/[0.08] rounded-3xl overflow-hidden border border-charcoal/10 shadow-sm hover:shadow-lg transition-shadow duration-300 group">
              <div className="relative h-56 md:h-64 overflow-hidden bg-deep-green/10">
                <div className="absolute inset-0 bg-charcoal/10 mix-blend-multiply z-10 group-hover:opacity-0 transition-opacity duration-300" />
                {moment.image && (
                  <img loading="lazy" src={getImageUrl(moment.image)} alt="Featured Moment" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                )}
              </div>
              <div className="p-6 md:p-8">
                <Typography variant="body" className="font-semibold text-charcoal leading-snug">
                  {moment.text}
                </Typography>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
