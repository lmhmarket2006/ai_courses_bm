import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const glassCardVariants = cva(
  'rounded-3xl backdrop-blur-xl transition-all duration-300 ease-out',
  {
    variants: {
      variant: {
        light:
          'border border-white/30 bg-white/80 shadow-lg dark:border-white/10 dark:bg-[#0A1030]/85 dark:shadow-2xl',
        dark: 'border border-white/10 bg-[#010A2D]/80 shadow-2xl',
        primary:
          'border border-primary/30 bg-primary/10 shadow-lg shadow-primary/20 dark:border-primary/40 dark:bg-primary/15',
      },
    },
    defaultVariants: {
      variant: 'light',
    },
  }
);

export interface GlassCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassCardVariants> {}

export function GlassCard({ className, variant, ...props }: GlassCardProps) {
  return <div className={cn(glassCardVariants({ variant }), className)} {...props} />;
}
