import { motion, type Variants } from 'framer-motion';
import useSWR from 'swr';
import { Card } from '@/components/common/Card';
import { Typography } from '@/components/common/Typography';
import { fetcher } from '@/lib/fetcher';
import { formatCompactCurrency } from '@/utils/formatters';
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter';

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

export function ImpactStats() {
  const { data: stats } = useSWR('/donations/stats', fetcher);
  const raised = useAnimatedCounter(stats?.totalRaised || 0, 1600, Boolean(stats));
  const gifts = useAnimatedCounter(stats?.donationCount || 0, 1400, Boolean(stats));
  const campaigns = useAnimatedCounter(stats?.activeCampaigns || 0, 1200, Boolean(stats));
  const donors = useAnimatedCounter(stats?.donorCount || 0, 1400, Boolean(stats));

  const items = [
    { label: 'Funds Raised', value: formatCompactCurrency(raised) },
    { label: 'Verified Donations', value: String(gifts) },
    { label: 'Active Campaigns', value: String(campaigns) },
    { label: 'Donors', value: String(donors) },
  ];

  return (
    <section className="relative -mt-16 z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {items.map((stat) => (
          <motion.div key={stat.label} variants={fadeInUp}>
            <Card className="bg-white/80 backdrop-blur-md border-charcoal/10 text-center py-8">
              <Typography variant="h2" className="text-deep-green mb-2">{stat.value}</Typography>
              <Typography variant="overline" className="text-charcoal/60">{stat.label}</Typography>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
