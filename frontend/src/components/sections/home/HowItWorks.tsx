import { motion, type Variants } from 'framer-motion';
import { Typography } from '@/components/common/Typography';
import { HeartPulse, Share2, Banknote } from 'lucide-react';

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

export function HowItWorks() {
  const steps = [
    { icon: <HeartPulse className="w-8 h-8 text-deep-green" />, title: 'Setup Campaign', desc: 'Fill in your details and verify your identity securely in minutes.' },
    { icon: <Share2 className="w-8 h-8 text-deep-green" />, title: 'Share & Reach', desc: 'Share your cause with friends, family, and our global donor network.' },
    { icon: <Banknote className="w-8 h-8 text-deep-green" />, title: 'Withdraw Funds', desc: 'Receive your raised funds directly into your bank account quickly.' },
  ];

  return (
    <section className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.div variants={fadeInUp}>
            <Typography variant="overline" className="text-goldenrod mb-2 block">Simple Process</Typography>
          </motion.div>
          <motion.div variants={fadeInUp}>
            <Typography variant="h2" className="text-charcoal mb-4">How it Works</Typography>
          </motion.div>
          <motion.div variants={fadeInUp}>
            <Typography variant="body" className="max-w-2xl mx-auto text-charcoal/60">
              Start your fundraising journey in three simple steps. We make it easy for you to focus on what matters most.
            </Typography>
          </motion.div>
        </motion.div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid md:grid-cols-3 gap-12 relative"
        >
          {/* Connecting Line */}
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-deep-green/20 to-transparent" />

          {steps.map((step, idx) => (
            <motion.div key={idx} variants={fadeInUp} className="relative z-10 text-center group">
              <div className="w-24 h-24 mx-auto bg-white border border-charcoal/10 rounded-full flex items-center justify-center mb-6 shadow-sm group-hover:shadow-lg group-hover:border-deep-green/20 transition-all duration-300">
                <div className="w-20 h-20 rounded-full bg-fog-gray flex items-center justify-center group-hover:bg-deep-green/5 transition-colors">
                  {step.icon}
                </div>
              </div>
              <Typography variant="h3" className="text-charcoal mb-3">{step.title}</Typography>
              <Typography variant="body" className="text-charcoal/60 px-4">{step.desc}</Typography>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
