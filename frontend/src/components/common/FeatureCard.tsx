import type { ReactNode } from 'react';
import { Card } from './Card';
import { Typography } from './Typography';
import { cn } from '@/utils/cn';

export interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  className?: string;
}

export function FeatureCard({ icon, title, description, className }: FeatureCardProps) {
  return (
    <Card className={cn("bg-transparent border-transparent shadow-none h-full", className)}>
      <div className="bg-white/90 backdrop-blur-sm p-8 rounded-[2rem] shadow-sm border border-deep-green/30 h-full hover:border-deep-green/80 hover:shadow-[0_0_20px_rgba(4,76,36,0.3)] transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden">
        {/* Decorative Blob */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-goldenrod/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-goldenrod/10 transition-colors" />
        
        <div className="w-16 h-16 bg-deep-green/5 text-deep-green rounded-2xl flex items-center justify-center mb-6 group-hover:bg-deep-green group-hover:text-white transition-colors duration-300 relative z-10 shadow-sm border border-deep-green/10">
          {icon}
        </div>
        <Typography variant="h4" className="mb-3 text-charcoal">
          {title}
        </Typography>
        <Typography variant="body" className="text-charcoal/60 text-[13px] leading-relaxed">
          {description}
        </Typography>
      </div>
    </Card>
  );
}
