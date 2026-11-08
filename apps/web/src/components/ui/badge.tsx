import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'saffron' | 'teal' | 'plum';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    outline: 'border border-border text-foreground',
    destructive: 'bg-destructive/15 text-destructive border border-destructive/20',
    saffron: 'bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold border border-amber-500/40 shadow-sm',
    teal: 'bg-teal-500/15 text-teal-700 dark:text-teal-300 font-bold border border-teal-500/35 shadow-sm',
    plum: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-500/35 shadow-sm',
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

