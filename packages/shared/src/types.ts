export interface FlatMember {
  id: string;
  name: string;
}

export interface Flat {
  id: string;
  name: string;
  members: FlatMember[];
  createdAt: string;
}

export type ExpenseCategory =
  | 'Groceries'
  | 'Dairy'
  | 'Vegetables'
  | 'Utilities'
  | 'Cleaning'
  | 'Other';

export const EXPENSE_CATEGORIES: readonly ExpenseCategory[] = [
  'Groceries',
  'Dairy',
  'Vegetables',
  'Utilities',
  'Cleaning',
  'Other',
] as const;

export type ExpenseType = 'shared' | 'personal';

export interface Expense {
  id: string;
  item: string;
  amountPaise: number;
  quantity?: string;
  category: ExpenseCategory;
  paidBy: string;
  date: string; // YYYY-MM-DD
  month: string; // YYYY-MM
  type: ExpenseType;
  notes?: string;
  imagePath?: string;
  receiptPath?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  deletedAt?: string | null;
}

export type SettlementStatus = 'pending' | 'completed';

export interface Settlement {
  id: string;
  from: string;
  to: string;
  amountPaise: number;
  date: string; // YYYY-MM-DD
  forMonth: string; // YYYY-MM
  status: SettlementStatus;
  notes?: string;
  createdAt: string;
  createdBy: string;
  deletedAt?: string | null;
}

export interface Transfer {
  from: string;
  to: string;
  amountPaise: number;
}

export interface MonthCalculation {
  month: string;
  totalPaise: number;
  paidPerMember: Record<string, number>;
  sharePerMember: Record<string, number>;
  netPerMember: Record<string, number>;
  settlementTransfers: Transfer[];
  remainingBalance: Record<string, number>;
  settled: boolean;
  categoryTotals: Record<ExpenseCategory, number>;
  mostPurchasedItems: Array<{ item: string; count: number; totalPaise: number }>;
}

export interface Statement {
  closedAt: string;
  closedBy: string;
  result: MonthCalculation;
}

