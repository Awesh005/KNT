import { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { Typography } from '@/components/common/Typography';
import { ShieldCheck, FileText, Headset, Lock, BellOff, Gift, Zap, Globe } from 'lucide-react';
import { FeatureCard } from '@/components/common/FeatureCard';

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

const beneficiaryFeatures = [
  { icon: <Gift className="w-8 h-8" />, title: '100% Free Platform', description: 'We don\'t charge any platform fees. You receive every penny of the support meant for you.' },
  { icon: <Zap className="w-8 h-8" />, title: 'Lightning Fast Payouts', description: 'Access your raised funds within 24 hours directly to your verified bank account.' },
  { icon: <Globe className="w-8 h-8" />, title: 'Global Reach', description: 'Connect with compassionate donors from across the globe to amplify your cause.' },
  { icon: <Headset className="w-8 h-8" />, title: 'Expert Guidance', description: 'Our dedicated campaign managers guide you at every step to maximize your fundraising.' },
];

const donorFeatures = [
  { icon: <ShieldCheck className="w-8 h-8" />, title: 'Verified Causes', description: 'Every campaign goes through a strict multi-step verification process before going live.' },
  { icon: <Lock className="w-8 h-8" />, title: 'Bank-Grade Security', description: 'Your payments and personal data are secured with industry-leading encryption standards.' },
  { icon: <FileText className="w-8 h-8" />, title: 'Transparent Tracking', description: 'Track exactly where your money goes with detailed fund utilization reports.' },
  { icon: <BellOff className="w-8 h-8" />, title: 'Zero Harassment', description: 'We respect your peace. No unsolicited calls or spam messages asking for donations.' },
];

export function WhyTrustUs() {
  const [activeTrustTab, setActiveTrustTab] = useState<'beneficiary' | 'donor'>('beneficiary');

  return (
    <section className="py-24 bg-soft-green border-t border-mint-green/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
          className="text-center mb-12"
        >
          <motion.div variants={fadeInUp}>
            <Typography variant="h2" className="text-charcoal mb-4">Why People Trust <span className="text-deep-green">KNT World Welfare Foundation</span></Typography>
          </motion.div>
          <motion.div variants={fadeInUp}>
            <Typography variant="body" className="max-w-2xl mx-auto text-charcoal/60 mb-8">
              Our commitment to transparency and user-first policies sets us apart.
            </Typography>
          </motion.div>
          
          {/* Tabs */}
          <motion.div variants={fadeInUp} className="flex justify-center mb-12">
            <div className="inline-flex items-center p-1 bg-light-green rounded-full border border-mint-green/30 shadow-inner">
              <button
                onClick={() => setActiveTrustTab('beneficiary')}
                className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 ${
                  activeTrustTab === 'beneficiary' 
                    ? 'bg-deep-green text-white shadow-md border border-transparent' 
                    : 'text-charcoal/60 hover:text-charcoal hover:bg-soft-green/50'
                }`}
              >
                Beneficiary
              </button>
              <button
                onClick={() => setActiveTrustTab('donor')}
                className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 ${
                  activeTrustTab === 'donor' 
                    ? 'bg-deep-green text-white shadow-md border border-transparent' 
                    : 'text-charcoal/60 hover:text-charcoal hover:bg-soft-green/50'
                }`}
              >
                Donors
              </button>
            </div>
          </motion.div>
        </motion.div>

        <motion.div 
          key={activeTrustTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {(activeTrustTab === 'beneficiary' ? beneficiaryFeatures : donorFeatures).map((feature, idx) => (
            <motion.div key={idx} variants={fadeInUp} className="h-full">
              <FeatureCard {...feature} />
            </motion.div>
          ))}
        </motion.div>
        
        </div>
    </section>
  );
}
