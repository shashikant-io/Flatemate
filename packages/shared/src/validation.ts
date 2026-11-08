import { EXPENSE_CATEGORIES, ExpenseCategory, ExpenseType } from './types.js';

export interface ExpenseValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export function validateExpenseInput(data: {
  item?: string;
  amountPaise?: number;
  paidBy?: string;
  type?: string;
  category?: string;
  date?: string;
  month?: string;
  validMemberIds?: string[];
}): ExpenseValidationResult {
  const errors: Record<string, string> = {};

  // 1. Item name
  if (!data.item || typeof data.item !== 'string' || data.item.trim().length === 0) {
    errors.item = 'Item name is required';
  } else if (data.item.trim().length > 80) {
    errors.item = 'Item name must not exceed 80 characters';
  }

  // 2. Amount in paise
  if (data.amountPaise === undefined || !Number.isInteger(data.amountPaise)) {
    errors.amountPaise = 'Amount must be an integer in paise';
  } else if (data.amountPaise < 1) {
    errors.amountPaise = 'Amount must be at least ₹0.01 (1 paisa)';
  } else if (data.amountPaise > 1000000000) {
    errors.amountPaise = 'Amount cannot exceed ₹1,00,00,000 (1 crore)';
  }

  // 3. Paid by
  if (!data.paidBy || typeof data.paidBy !== 'string') {
    errors.paidBy = 'Payer must be specified';
  } else if (data.validMemberIds && !data.validMemberIds.includes(data.paidBy)) {
    errors.paidBy = `Payer "${data.paidBy}" is not a recognized flat member`;
  }

  // 4. Expense type
  if (data.type !== 'shared' && data.type !== 'personal') {
    errors.type = 'Type must be either "shared" or "personal"';
  }

  // 5. Category
  if (!data.category || !EXPENSE_CATEGORIES.includes(data.category as ExpenseCategory)) {
    errors.category = `Category must be one of: ${EXPENSE_CATEGORIES.join(', ')}`;
  }

  // 6. Date (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!data.date || !dateRegex.test(data.date)) {
    errors.date = 'Date must be in YYYY-MM-DD format';
  }

  // 7. Month (YYYY-MM) & agreement with date
  const monthRegex = /^\d{4}-\d{2}$/;
  if (!data.month || !monthRegex.test(data.month)) {
    errors.month = 'Month must be in YYYY-MM format';
  } else if (data.date && data.date.slice(0, 7) !== data.month) {
    errors.month = 'Month must match the purchase date (YYYY-MM)';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateSettlementInput(data: {
  from?: string;
  to?: string;
  amountPaise?: number;
  forMonth?: string;
}): ExpenseValidationResult {
  const errors: Record<string, string> = {};

  if (!data.from || typeof data.from !== 'string') {
    errors.from = 'Payer (from) is required';
  }

  if (!data.to || typeof data.to !== 'string') {
    errors.to = 'Recipient (to) is required';
  }

  if (data.from && data.to && data.from === data.to) {
    errors.to = 'Payer and recipient cannot be the same person';
  }

  if (data.amountPaise === undefined || !Number.isInteger(data.amountPaise) || data.amountPaise <= 0) {
    errors.amountPaise = 'Settlement amount must be a positive integer in paise';
  }

  const monthRegex = /^\d{4}-\d{2}$/;
  if (!data.forMonth || !monthRegex.test(data.forMonth)) {
    errors.forMonth = 'forMonth must be in YYYY-MM format';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

