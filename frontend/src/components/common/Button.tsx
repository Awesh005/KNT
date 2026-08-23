import { forwardRef } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref' | 'children'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const variants = {
      primary: 'bg-deep-green text-white border-2 border-charcoal/25 hover:border-charcoal/40 shadow-[0_8px_18px_rgba(15,26,22,0.08)] hover:shadow-[0_12px_24px_rgba(15,26,22,0.12)]',
      secondary: 'bg-charcoal text-white hover:bg-charcoal/90 shadow-sm',
      outline: 'bg-white border border-charcoal/15 text-charcoal hover:border-charcoal/30 hover:shadow-[0_8px_20px_rgba(15,26,22,0.12)]',
      ghost: 'text-charcoal hover:bg-fog-gray',
    };

    const sizes = {
      sm: 'px-4 py-2 text-[10px] tracking-[0.16em] uppercase font-semibold rounded-full',
      md: 'px-6 py-3 text-[10px] tracking-[0.2em] uppercase font-semibold rounded-full',
      lg: 'px-8 py-3.5 text-[11px] tracking-[0.22em] uppercase font-semibold rounded-full',
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ y: disabled || isLoading ? 0 : -2 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        className={cn(
          'inline-flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-goldenrod/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <Loader2 className="w-4 h-4 mr-2 animate-spin absolute left-4" />
        )}
        <span className={cn('inline-flex items-center gap-2', isLoading && 'opacity-0')}>
          {children}
        </span>
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
