import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Button } from './Button';
import { Typography } from './Typography';
import { PhoneCall } from 'lucide-react';
import { cn } from '@/utils/cn';

interface CallToActionBannerProps {
  title: string;
  subtitle?: string;
  buttonText?: string;
  buttonIcon?: ReactNode;
  phoneNumber?: string;
  onButtonClick?: () => void;
  className?: string;
}

export function CallToActionBanner({
  title,
  subtitle,
  buttonText = "Request a call",
  buttonIcon = <PhoneCall className="w-4 h-4 mr-2" />,
  phoneNumber,
  onButtonClick,
  className
}: CallToActionBannerProps) {
  
  const handleClick = () => {
    if (phoneNumber) {
      window.location.href = `tel:${phoneNumber.replace(/[^0-9+]/g, '')}`;
    }
    if (onButtonClick) {
      onButtonClick();
    }
  };
  return (
    <section className={cn("relative py-16 overflow-hidden bg-deep-green", className)}>
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-goldenrod rounded-full blur-[100px]" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Typography variant="h2" className="text-white mb-4 text-3xl md:text-4xl">
            {title}
          </Typography>
          
          {subtitle && (
            <Typography variant="body" className="text-white/80 mb-8 max-w-2xl mx-auto text-lg">
              {subtitle}
            </Typography>
          )}

          <Button 
            variant="primary" 
            size="lg"
            onClick={handleClick}
            className="bg-white text-deep-green hover:bg-fog-gray font-bold px-8 shadow-lg shadow-white/10"
          >
            {buttonIcon}
            {buttonText}
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
