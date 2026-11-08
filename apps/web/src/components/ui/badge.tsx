import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'saffron' | 'teal' | 'plum' | 'success' | 'warning' | 'blue';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-[#315BFF]/15 text-[#477BFF] border border-[#315BFF]/30 font-medium',
    blue: 'bg-[#315BFF]/15 text-[#477BFF] border border-[#315BFF]/30 font-medium',
    secondary: 'bg-[#15182B] text-[#A1A5BC] border border-white/[0.08] font-medium',
    outline: 'border border-white/[0.1] text-[#A1A5BC]',
    destructive: 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30',
    success: 'bg-[#25D6B0]/10 text-[#25D6B0] border border-[#25D6B0]/25 font-medium',
    warning: 'bg-[#FFBD59]/10 text-[#FFBD59] border border-[#FFBD59]/25 font-medium',
    saffron: 'bg-[#315BFF]/15 text-[#477BFF] border border-[#315BFF]/30 font-medium',
    teal: 'bg-[#25D6B0]/10 text-[#25D6B0] border border-[#25D6B0]/25 font-medium',
    plum: 'bg-[#818CF8]/10 text-[#818CF8] border border-[#818CF8]/25 font-medium',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors select-none',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };

