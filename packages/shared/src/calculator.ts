import {
  Expense,
  Settlement,
  FlatMember,
  MonthCalculation,
  Transfer,
  ExpenseCategory,
  EXPENSE_CATEGORIES,
} from './types.js';

/**
 * Derives a deterministic rotation offset for distributing remainder paise.
 * For month "YYYY-MM", returns an integer offset that increments by 1 each consecutive month.
 */
export function getMonthRotationOffset(month: string, memberCount: number): number {
  if (memberCount <= 0) return 0;
  const parts = month.split('-');
  if (parts.length < 2) return 0;
  const year = parseInt(parts[0], 10);
  const monthNum = parseInt(parts[1], 10);
  if (isNaN(year) || isNaN(monthNum)) return 0;
  return Math.abs((year * 12 + monthNum) % memberCount);
}

/**
 * Pure calculation engine for a given month.
 * Implements exact integer arithmetic, odd-paise rotation, and debt-minimization.
 */
export function calculateMonth(
  expenses: readonly Expense[],
  settlements: readonly Settlement[],
  month: string,
  members: readonly FlatMember[]
): MonthCalculation {
  if (!members || members.length === 0) {
    throw new Error('Members list cannot be empty');
  }

  const memberIds = members.map((m) => m.id);
  const paidPerMember: Record<string, number> = {};
  const sharePerMember: Record<string, number> = {};
  const netPerMember: Record<string, number> = {};
  const remainingBalance: Record<string, number> = {};

  for (const id of memberIds) {
    paidPerMember[id] = 0;
    sharePerMember[id] = 0;
    netPerMember[id] = 0;
    remainingBalance[id] = 0;
  }

  const categoryTotals: Record<ExpenseCategory, number> = {
    Groceries: 0,
    Dairy: 0,
    Vegetables: 0,
    Utilities: 0,
    Cleaning: 0,
    Other: 0,
  };

  const itemCounts: Record<string, { count: number; totalPaise: number }> = {};

  // 1. Filter valid shared expenses for the selected month by purchase date
  // Skip duplicate ids, deleted expenses, non-shared, and dates outside month
  const seenExpenseIds = new Set<string>();
  let totalPaise = 0;

  for (const exp of expenses) {
    if (!exp.id || seenExpenseIds.has(exp.id)) {
      continue;
    }
    seenExpenseIds.add(exp.id);

    // Skip soft-deleted expenses
    if (exp.deletedAt) {
      continue;
    }

    // Skip personal expenses
    if (exp.type !== 'shared') {
      continue;
    }

    // Check purchase date falls in the selected month (YYYY-MM)
    if (!exp.date || !exp.date.startsWith(`${month}-`)) {
      continue;
    }

    const amount = exp.amountPaise;
    if (!Number.isInteger(amount) || amount <= 0) {
      continue;
    }

    totalPaise += amount;

    // Track payer
    if (paidPerMember[exp.paidBy] !== undefined) {
      paidPerMember[exp.paidBy] += amount;
    }

    // Track category totals
    if (exp.category && categoryTotals[exp.category] !== undefined) {
      categoryTotals[exp.category] += amount;
    } else {
      categoryTotals['Other'] += amount;
    }

    // Track most purchased items (normalized lowercase item name)
    const normItem = (exp.item || 'Unnamed').trim().toLowerCase();
    const displayName = exp.item ? exp.item.trim() : 'Unnamed';
    if (!itemCounts[normItem]) {
      itemCounts[normItem] = { count: 0, totalPaise: 0 };
    }
    itemCounts[normItem].count += 1;
    itemCounts[normItem].totalPaise += amount;
  }

  // 2. Integer division among members with rotating odd-paise distribution
  const n = members.length;
  const baseShare = Math.floor(totalPaise / n);
  const remainder = totalPaise % n;

  for (const id of memberIds) {
    sharePerMember[id] = baseShare;
  }

  // Distribute leftover paise (1 paisa each) starting from rotating offset
  const offset = getMonthRotationOffset(month, n);
  for (let i = 0; i < remainder; i++) {
    const memberIndex = (offset + i) % n;
    const recipientId = memberIds[memberIndex];
    sharePerMember[recipientId] += 1;
  }

  // 3. Compute net balance: paid minus share (always sums to 0)
  for (const id of memberIds) {
    netPerMember[id] = paidPerMember[id] - sharePerMember[id];
    remainingBalance[id] = netPerMember[id];
  }

  // 4. Process completed settlements for the selected month
  const seenSettlementIds = new Set<string>();
  const completedSettlements: Settlement[] = [];

  for (const set of settlements) {
    if (!set.id || seenSettlementIds.has(set.id)) {
      continue;
    }
    seenSettlementIds.add(set.id);

    if (set.deletedAt) {
      continue;
    }

    // Only completed settlements for this month affect the balance
    if (set.status !== 'completed' || set.forMonth !== month) {
      continue;
    }

    completedSettlements.push(set);

    // The payer (from) has settled debt, so their balance improves (+ amount)
    if (remainingBalance[set.from] !== undefined) {
      remainingBalance[set.from] += set.amountPaise;
    }

    // The recipient (to) received money, so their balance decreases (- amount)
    if (remainingBalance[set.to] !== undefined) {
      remainingBalance[set.to] -= set.amountPaise;
    }
  }

  // 5. Calculate minimal list of transfers to balance remaining debt
  // Debtors have remainingBalance < 0 (they owe money)
  // Creditors have remainingBalance > 0 (they are owed money)
  const debtors: Array<{ id: string; amount: number }> = [];
  const creditors: Array<{ id: string; amount: number }> = [];

  for (const id of memberIds) {
    const bal = remainingBalance[id];
    if (bal < 0) {
      debtors.push({ id, amount: -bal });
    } else if (bal > 0) {
      creditors.push({ id, amount: bal });
    }
  }

  // Greedy debt clearing algorithm
  const settlementTransfers: Transfer[] = [];
  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];

    const transferAmount = Math.min(debtor.amount, creditor.amount);
    if (transferAmount > 0) {
      settlementTransfers.push({
        from: debtor.id,
        to: creditor.id,
        amountPaise: transferAmount,
      });

      debtor.amount -= transferAmount;
      creditor.amount -= transferAmount;
    }

    if (debtor.amount === 0) dIdx++;
    if (creditor.amount === 0) cIdx++;
  }

  // 6. Check settled status: true if all remaining balances are 0
  const settled = Object.values(remainingBalance).every((bal) => bal === 0);

  // 7. Format most purchased items list
  const mostPurchasedItems = Object.entries(itemCounts)
    .map(([item, data]) => ({
      item,
      count: data.count,
      totalPaise: data.totalPaise,
    }))
    .sort((a, b) => b.count - a.count || b.totalPaise - a.totalPaise);

  return {
    month,
    totalPaise,
    paidPerMember,
    sharePerMember,
    netPerMember,
    settlementTransfers,
    remainingBalance,
    settled,
    categoryTotals,
    mostPurchasedItems,
  };
}

