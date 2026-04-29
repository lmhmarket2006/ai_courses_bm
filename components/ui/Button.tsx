import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'btn-premium relative inline-flex items-center justify-center gap-2 rounded-2xl font-bold uppercase tracking-wide transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--page-bg)] disabled:pointer-events-none disabled:opacity-45',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-white shadow-[0_12px_32px_-8px_var(--shadow-primary-glow)] hover:bg-primary-hover hover:shadow-[0_18px_40px_-10px_var(--shadow-primary-glow)] active:scale-[0.98]',
        secondary:
          'border-2 border-primary bg-transparent text-primary hover:bg-[var(--primary-soft)] active:scale-[0.98]',
        ghost: 'border border-transparent bg-transparent text-primary hover:bg-[var(--primary-soft)] active:scale-[0.98]',
      },
      size: {
        default: 'min-h-11 px-6 py-2.5 text-[11px] md:text-xs',
        sm: 'min-h-9 px-4 py-2 text-[10px]',
        lg: 'min-h-12 px-8 py-3 text-xs md:text-sm',
        icon: 'size-11 p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = 'button', ...props }, ref) => {
    return <button ref={ref} type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
  }
);
Button.displayName = 'Button';
