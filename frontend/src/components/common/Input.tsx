import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, id, ...props }, ref) => {
    const inputId = id || label?.replace(/\s+/g, '-').toLowerCase();

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-[11px] font-bold uppercase tracking-[0.16em] text-charcoal ml-1">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'w-full px-4 py-3 bg-white border rounded-xl text-[13px] text-charcoal placeholder:text-charcoal/40 transition-all duration-300 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:bg-fog-gray shadow-sm',
              icon && 'pl-10',
              error
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                : 'border-charcoal/15 focus:border-goldenrod focus:ring-goldenrod/20 hover:border-charcoal/30',
              className
            )}
            {...props}
          />
        </div>
        {error && <span className="text-[11px] text-red-500 ml-1">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
