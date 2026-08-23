import { motion } from 'framer-motion';
import { Typography } from '@/components/common/Typography';

interface PageBannerProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
}

export function PageBanner({ 
  title, 
  subtitle,
  backgroundImage = "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070&auto=format&fit=crop"
}: PageBannerProps) {
  return (
    <section className="relative pt-40 pb-24 overflow-hidden bg-deep-green text-white">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={backgroundImage} 
          alt="Banner Background" 
          className="w-full h-full object-cover"
          decoding="async"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-charcoal/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-deep-green/80 via-transparent to-transparent" />
      </div>

      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[140%] rounded-full bg-goldenrod/20 blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[120%] rounded-full bg-black/40 blur-[100px] pointer-events-none" />
      </div>

      <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Typography variant="h1" className="text-white text-4xl md:text-5xl lg:text-6xl mb-6 font-bold !leading-tight drop-shadow-lg">
            {title}
          </Typography>
          {subtitle && (
            <p className="text-lg md:text-xl lg:text-2xl text-white/90 mb-10 leading-relaxed font-medium drop-shadow-md">
              {subtitle}
            </p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
