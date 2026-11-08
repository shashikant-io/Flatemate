import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'saffron' | 'destructive' | 'teal' | 'plum';
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'huge';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] select-none';

    const variants = {
      default: 'bg-primary text-primary-foreground hover:opacity-95 shadow-sm',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      outline: 'border border-border bg-transparent hover:bg-muted text-foreground',
      ghost: 'hover:bg-muted text-foreground',
      saffron:
        'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-slate-950 font-bold hover:brightness-105 shadow-josh hover:scale-[1.01] active:scale-[0.98]',
      teal:
        'bg-gradient-to-r from-teal-600 to-emerald-500 text-white font-bold hover:brightness-105 shadow-teal-glow hover:scale-[1.01] active:scale-[0.98]',
      plum:
        'bg-gradient-to-r from-indigo-600 to-violet-500 text-white font-bold hover:brightness-105 shadow-plum-glow hover:scale-[1.01] active:scale-[0.98]',
      destructive:
        'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm',
    };

    const sizes = {
      default: 'h-11 px-5 py-2.5 rounded-xl text-sm min-h-[44px]',
      sm: 'h-9 px-3 rounded-lg text-xs min-h-[36px]',
      lg: 'h-13 px-8 rounded-2xl text-base min-h-[52px]',
      icon: 'h-11 w-11 rounded-xl min-h-[44px] min-w-[44px]',
      huge: 'h-14 px-8 rounded-2xl text-lg font-bold min-h-[56px]',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };

