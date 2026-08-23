import { motion } from 'framer-motion';
import { Typography } from '@/components/common/Typography';

export function CampaignHeader() {
  return (
    <div className="bg-deep-green text-white py-20 px-4 sm:px-6 lg:px-8 mb-12 border-b border-white/10 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-goldenrod/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-charcoal/40 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Typography variant="overline" className="text-goldenrod mb-4 block">Discover</Typography>
          <Typography variant="h1" className="text-white mb-6">Browse Campaigns</Typography>
          <Typography variant="body" className="text-white/80 max-w-2xl mx-auto">
            Find and support causes that matter to you. Your contribution, big or small, creates a ripple of positive change in someone's life.
          </Typography>
        </motion.div>
      </div>
    </div>
  );
}
