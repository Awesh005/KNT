import { type ElementType, type ReactNode } from 'react';
import { cn } from '@/utils/cn';

type Variant = 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'small' | 'muted' | 'overline';

export interface TypographyProps {
  variant?: Variant;
  as?: ElementType;
  children: ReactNode;
  className?: string;
}

export function Typography({ variant = 'body', as, children, className }: TypographyProps) {
  const defaultElements: Record<Variant, ElementType> = {
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    body: 'p',
    small: 'small',
    muted: 'p',
    overline: 'p',
  };

  const Component = as || defaultElements[variant];

  const variantClasses: Record<Variant, string> = {
    h1: 'font-serif text-4xl md:text-5xl font-light tracking-tight text-charcoal',
    h2: 'font-serif text-3xl md:text-4xl font-light tracking-tight text-charcoal',
    h3: 'font-serif text-xl md:text-2xl font-light text-charcoal',
    h4: 'font-serif text-lg font-normal text-charcoal',
    body: 'text-[12.5px] sm:text-[13px] text-charcoal/70 leading-relaxed',
    small: 'text-[11px] text-charcoal/60',
    muted: 'text-[12.5px] text-charcoal/50',
    overline: 'text-[10px] md:text-[11px] font-bold uppercase tracking-[0.3em] text-lichen',
  };

  return (
    <Component className={cn(variantClasses[variant], className)}>
      {children}
    </Component>
  );
}
