import { motion, type Variants } from 'framer-motion';
import { useNavigate } from 'react-router';
import { Button } from '@/components/common/Button';
import { Typography } from '@/components/common/Typography';
import { Heart } from 'lucide-react';

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

export function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative h-[85vh] min-h-[600px] flex items-center overflow-hidden bg-deep-green">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070&auto=format&fit=crop" 
          alt="Hero Background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-charcoal/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-deep-green/80 via-transparent to-transparent" />
        
        {/* Subtle glowing orbs inspired by reference */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-goldenrod/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-charcoal/40 rounded-full blur-[120px]" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="max-w-3xl"
        >
          <motion.div variants={fadeInUp}>
            <Typography variant="overline" className="text-goldenrod mb-4 block">
              KNT World Welfare Foundation
            </Typography>
          </motion.div>
          
          <motion.div variants={fadeInUp}>
            <Typography variant="h1" className="text-white mb-6 !leading-[1.1]">
              Empower Lives, <br />
              <span className="italic text-white/90">Ignite Hope</span>
            </Typography>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Typography variant="body" className="text-white/80 mb-8 max-w-xl text-[14px]">
              Join our mission to bring medical relief, education, and community support to those who need it most. Together, we can build a better tomorrow.
            </Typography>
          </motion.div>

          <motion.div variants={fadeInUp} className="flex flex-wrap gap-4">
            <Button size="lg" variant="primary" onClick={() => navigate('/donate')} className="flex items-center gap-2">
              <Heart className="w-5 h-5 fill-current" /> Donate Now
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent text-white border-white/20 hover:bg-white/10 hover:border-white/40" onClick={() => navigate('/campaigns')}>
              Explore Causes
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
