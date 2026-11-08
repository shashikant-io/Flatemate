import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'saffron' | 'destructive' | 'teal' | 'plum';
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'huge';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#315BFF] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] select-none';

    const variants = {
      default:
        'bg-gradient-to-r from-[#1745D1] to-[#4169FF] text-white font-semibold hover:brightness-110 shadow-[0_8px_25px_-4px_rgba(49,91,255,0.5)] border border-blue-400/20',
      primary:
        'bg-gradient-to-r from-[#1745D1] to-[#4169FF] text-white font-semibold hover:brightness-110 shadow-[0_8px_25px_-4px_rgba(49,91,255,0.5)] border border-blue-400/20',
      secondary:
        'bg-[#15182B] text-white hover:bg-[#1C2038] border border-white/[0.08]',
      outline:
        'border border-white/[0.08] bg-transparent hover:bg-[#15182B] text-[#A1A5BC] hover:text-white',
      ghost:
        'hover:bg-[#15182B] text-[#A1A5BC] hover:text-white',
      saffron:
        'bg-gradient-to-r from-[#1745D1] to-[#4169FF] text-white font-semibold hover:brightness-110 shadow-[0_8px_25px_-4px_rgba(49,91,255,0.5)] border border-blue-400/20',
      teal:
        'bg-gradient-to-r from-[#0D9488] to-[#25D6B0] text-slate-950 font-bold hover:brightness-105 shadow-[0_8px_25px_-4px_rgba(37,214,176,0.45)]',
      plum:
        'bg-gradient-to-r from-[#6366F1] to-[#818CF8] text-white font-bold hover:brightness-105 shadow-[0_8px_25px_-4px_rgba(129,140,248,0.45)]',
      destructive:
        'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm',
    };

    const sizes = {
      default: 'h-11 px-5 py-2.5 rounded-xl text-sm min-h-[44px]',
      sm: 'h-9 px-3.5 rounded-lg text-xs min-h-[36px]',
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

