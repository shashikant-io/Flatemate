import React from 'react';
import { ShoppingBag, Milk, Carrot, Zap, Sparkles, Package, LucideIcon } from 'lucide-react';
import { ExpenseCategory } from '@flatmate/shared';
import { cn } from '@/lib/utils';

interface CategoryIconProps {
  category: ExpenseCategory;
  className?: string;
  size?: number;
}

export const CATEGORY_CONFIG: Record<
  ExpenseCategory,
  {
    icon: LucideIcon;
    bgLight: string;
    textLight: string;
    label: string;
  }
> = {
  Groceries: {
    icon: ShoppingBag,
    bgLight: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    textLight: 'text-emerald-600 dark:text-emerald-400',
    label: 'Groceries',
  },
  Dairy: {
    icon: Milk,
    bgLight: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    textLight: 'text-blue-600 dark:text-blue-400',
    label: 'Dairy',
  },
  Vegetables: {
    icon: Carrot,
    bgLight: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    textLight: 'text-amber-600 dark:text-amber-400',
    label: 'Vegetables',
  },
  Utilities: {
    icon: Zap,
    bgLight: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
    textLight: 'text-yellow-600 dark:text-yellow-400',
    label: 'Utilities',
  },
  Cleaning: {
    icon: Sparkles,
    bgLight: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    textLight: 'text-indigo-600 dark:text-indigo-400',
    label: 'Cleaning',
  },
  Other: {
    icon: Package,
    bgLight: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
    textLight: 'text-slate-600 dark:text-slate-400',
    label: 'Other',
  },
};

export function CategoryIcon({ category, className, size = 18 }: CategoryIconProps) {
  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.Other;
  const IconComponent = config.icon;

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-xl p-2.5 border',
        config.bgLight,
        className
      )}
    >
      <IconComponent size={size} className="stroke-[2.2]" />
    </div>
  );
}
