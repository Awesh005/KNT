import { motion, type Variants } from 'framer-motion';
import { Typography } from '@/components/common/Typography';
import { BannerCard } from '@/components/common/BannerCard';

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

export function BannerCards() {
  return (
    <section className="py-24 bg-light-green">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.div variants={fadeInUp}>
            <Typography variant="h2" className="text-charcoal mb-4">Start Fundraisers to Support Social Causes</Typography>
          </motion.div>
        </motion.div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid lg:grid-cols-2 gap-8"
        >
          <motion.div variants={fadeInUp} className="h-full">
            <BannerCard 
              className="h-full"
              title="Medical Emergencies"
              description="Raise funds quickly for surgeries, treatments, and medical care for your loved ones with zero platform fees."
              linkText="Start Medical Fundraiser"
              linkPath="/start-fundraiser"
              imageSrc="https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=2070&auto=format&fit=crop"
              imageOnRight={true}
            />
          </motion.div>
          <motion.div variants={fadeInUp} className="h-full">
            <BannerCard 
              className="h-full"
              title="Education & Social Causes"
              description="Help students pay tuition fees, support schools, or fund community development projects effortlessly."
              linkText="Start Social Fundraiser"
              linkPath="/start-fundraiser"
              imageSrc="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=2073&auto=format&fit=crop"
              imageOnRight={false}
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
