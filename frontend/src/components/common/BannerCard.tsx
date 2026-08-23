import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { Typography } from './Typography';
import { cn } from '@/utils/cn';

export interface BannerCardProps {
  title: string;
  description: string;
  imageSrc: string;
  linkText: string;
  linkPath: string;
  className?: string;
  imageOnRight?: boolean;
}

export function BannerCard({ title, description, imageSrc, linkText, linkPath, className, imageOnRight = true }: BannerCardProps) {
  return (
    <div className={cn("bg-white rounded-3xl overflow-hidden border border-charcoal/10 flex flex-col md:flex-row group", className)}>
      
      {/* Content Section */}
      <div className={cn("flex-1 p-8 md:p-12 flex flex-col justify-center", imageOnRight ? "order-2 md:order-1" : "order-2")}>
        <Typography variant="h3" className="mb-4 text-charcoal leading-tight">
          {title}
        </Typography>
        <Typography variant="body" className="mb-8 text-charcoal/70">
          {description}
        </Typography>
        <Link 
          to={linkPath}
          className="inline-flex items-center text-[12px] font-bold uppercase tracking-[0.1em] text-goldenrod hover:text-deep-green transition-colors"
        >
          {linkText} <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
      
      {/* Image Section */}
      <div className={cn("flex-1 bg-charcoal/5 relative min-h-[250px]", imageOnRight ? "order-1 md:order-2" : "order-1")}>
        <img loading="lazy" 
          src={imageSrc} 
          alt={title} 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      
    </div>
  );
}
