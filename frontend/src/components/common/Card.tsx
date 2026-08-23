import { type ReactNode, forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'interactive' | 'outline';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, className, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-[2rem] overflow-hidden transition-all duration-300',
          variant === 'default' && 'bg-white/90 backdrop-blur-sm shadow-sm border border-deep-green/30 hover:border-goldenrod/50 hover:shadow-[0_0_15px_rgba(203,156,59,0.3)]',
          variant === 'interactive' && 'bg-white shadow-sm border border-deep-green/30 hover:border-deep-green/80 hover:shadow-[0_0_25px_rgba(4,76,36,0.4)] hover:-translate-y-2 cursor-pointer group',
          variant === 'outline' && 'bg-transparent border-2 border-charcoal/10 hover:border-deep-green/50 hover:shadow-[0_0_15px_rgba(4,76,36,0.2)]',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('p-6 pb-4 border-b border-charcoal/5', className)}>{children}</div>;
}

export function CardBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('p-6', className)}>{children}</div>;
}

export function CardFooter({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('p-6 pt-4 bg-fog-gray mt-auto border-t border-charcoal/5', className)}>{children}</div>;
}
