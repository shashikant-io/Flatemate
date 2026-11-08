import { Expense, Settlement, MonthCalculation, FlatMember } from './types.js';
import { formatINR, paiseToRupees } from './currency.js';

/**
 * Neutralizes CSV formula injection vulnerabilities.
 * If a cell string starts with '=', '+', '-', or '@', prefixes with a single quote.
 * Properly escapes internal quotes by doubling them ("" -> ").
 */
export function sanitizeCsvCell(value: unknown): string {
  if (value === null || value === undefined) {
    return '""';
  }

  let str = String(value);

  // Formula injection prevention: characters that trigger formula execution in Excel/Sheets/Calc
  const dangerousPrefixes = ['=', '+', '-', '@', '\t', '\r'];
  if (dangerousPrefixes.some((prefix) => str.startsWith(prefix))) {
    str = `'${str}`;
  }

  // Escape double quotes
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
}

/**
 * Builds a clean, injection-safe CSV export string for a month's report.
 */
export function generateMonthCSV(
  calculation: MonthCalculation,
  expenses: readonly Expense[],
  settlements: readonly Settlement[],
  members: readonly FlatMember[]
): string {
  const memberNameMap: Record<string, string> = {};
  for (const m of members) {
    memberNameMap[m.id] = m.name;
  }

  const lines: string[] = [];

  // Title / Metadata
  lines.push([sanitizeCsvCell('FlatMate - Monthly Expense Report'), sanitizeCsvCell(calculation.month)].join(','));
  lines.push('');

  // 1. Month Summary
  lines.push([sanitizeCsvCell('=== SUMMARY ===')].join(','));
  lines.push(
    [
      sanitizeCsvCell('Total Shared (Rs.)'),
      sanitizeCsvCell(paiseToRupees(calculation.totalPaise)),
      sanitizeCsvCell('Settlement Status'),
      sanitizeCsvCell(calculation.settled ? 'Settled' : 'Unsettled'),
    ].join(',')
  );
  lines.push('');

  // 2. Member Breakdown
  lines.push([sanitizeCsvCell('=== MEMBER BALANCES ===')].join(','));
  lines.push(
    [
      sanitizeCsvCell('Member'),
      sanitizeCsvCell('Paid (Rs.)'),
      sanitizeCsvCell('Share (Rs.)'),
      sanitizeCsvCell('Net Balance (Rs.)'),
      sanitizeCsvCell('Remaining Balance (Rs.)'),
    ].join(',')
  );

  for (const m of members) {
    const paid = paiseToRupees(calculation.paidPerMember[m.id] || 0);
    const share = paiseToRupees(calculation.sharePerMember[m.id] || 0);
    const net = paiseToRupees(calculation.netPerMember[m.id] || 0);
    const rem = paiseToRupees(calculation.remainingBalance[m.id] || 0);

    lines.push(
      [
        sanitizeCsvCell(m.name),
        sanitizeCsvCell(paid),
        sanitizeCsvCell(share),
        sanitizeCsvCell(net),
        sanitizeCsvCell(rem),
      ].join(',')
    );
  }
  lines.push('');

  // 3. Category Breakdown
  lines.push([sanitizeCsvCell('=== CATEGORY BREAKDOWN ===')].join(','));
  lines.push([sanitizeCsvCell('Category'), sanitizeCsvCell('Total (Rs.)')].join(','));
  for (const [category, paise] of Object.entries(calculation.categoryTotals)) {
    lines.push([sanitizeCsvCell(category), sanitizeCsvCell(paiseToRupees(paise))].join(','));
  }
  lines.push('');

  // 4. Detailed Expense Items
  lines.push([sanitizeCsvCell('=== EXPENSE TRANSACTIONS ===')].join(','));
  lines.push(
    [
      sanitizeCsvCell('Date'),
      sanitizeCsvCell('Item'),
      sanitizeCsvCell('Category'),
      sanitizeCsvCell('Paid By'),
      sanitizeCsvCell('Type'),
      sanitizeCsvCell('Amount (Rs.)'),
      sanitizeCsvCell('Notes'),
    ].join(',')
  );

  const sharedInMonth = expenses.filter(
    (e) => !e.deletedAt && e.type === 'shared' && e.date.startsWith(`${calculation.month}-`)
  );

  for (const e of sharedInMonth) {
    lines.push(
      [
        sanitizeCsvCell(e.date),
        sanitizeCsvCell(e.item),
        sanitizeCsvCell(e.category),
        sanitizeCsvCell(memberNameMap[e.paidBy] || e.paidBy),
        sanitizeCsvCell(e.type),
        sanitizeCsvCell(paiseToRupees(e.amountPaise)),
        sanitizeCsvCell(e.notes || ''),
      ].join(',')
    );
  }
  lines.push('');

  // 5. Settlements Recorded
  lines.push([sanitizeCsvCell('=== SETTLEMENT PAYMENTS ===')].join(','));
  lines.push(
    [
      sanitizeCsvCell('Date'),
      sanitizeCsvCell('Payer (From)'),
      sanitizeCsvCell('Receiver (To)'),
      sanitizeCsvCell('Amount (Rs.)'),
      sanitizeCsvCell('Status'),
      sanitizeCsvCell('Notes'),
    ].join(',')
  );

  const monthSettlements = settlements.filter(
    (s) => !s.deletedAt && s.forMonth === calculation.month
  );

  for (const s of monthSettlements) {
    lines.push(
      [
        sanitizeCsvCell(s.date),
        sanitizeCsvCell(memberNameMap[s.from] || s.from),
        sanitizeCsvCell(memberNameMap[s.to] || s.to),
        sanitizeCsvCell(paiseToRupees(s.amountPaise)),
        sanitizeCsvCell(s.status),
        sanitizeCsvCell(s.notes || ''),
      ].join(',')
    );
  }

  return lines.join('\r\n');
}

