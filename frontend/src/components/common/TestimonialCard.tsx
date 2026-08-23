import { Star } from 'lucide-react';
import { Card, CardBody } from './Card';
import { Typography } from './Typography';
import { cn } from '@/utils/cn';

export interface TestimonialCardProps {
  name: string;
  location?: string;
  review: string;
  rating?: number;
  className?: string;
}

export function TestimonialCard({ name, location, review, rating = 5, className }: TestimonialCardProps) {
  return (
    <Card className={cn("bg-white border-charcoal/10 h-full", className)}>
      <CardBody className="flex flex-col h-full p-6">
        <div className="flex items-center gap-1 mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star 
              key={i} 
              className={cn("w-4 h-4", i < rating ? "fill-goldenrod text-goldenrod" : "fill-charcoal/10 text-charcoal/10")} 
            />
          ))}
        </div>
        
        <Typography variant="body" className="italic text-charcoal/80 mb-6 flex-grow text-[14px]">
          "{review}"
        </Typography>
        
        <div className="mt-auto border-t border-charcoal/10 pt-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-deep-green flex items-center justify-center text-white font-serif text-lg">
            {name.charAt(0)}
          </div>
          <div>
            <Typography variant="small" className="font-bold text-charcoal block">
              {name}
            </Typography>
            {location && (
              <Typography variant="small" className="text-charcoal/50">
                {location}
              </Typography>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
