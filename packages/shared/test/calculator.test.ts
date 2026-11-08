import { describe, it, expect } from 'vitest';
import {
  calculateMonth,
  rupeesToPaise,
  paiseToRupees,
  formatINR,
  formatSettlementMessage,
  validateExpenseInput,
  validateSettlementInput,
  sanitizeCsvCell,
  generateMonthCSV,
  Expense,
  Settlement,
  FlatMember,
} from '../src';

describe('FlatMate Calculation Engine & Shared Package', () => {
  const members: FlatMember[] = [
    { id: 'shashikant', name: 'Shashikant' },
    { id: 'nitesh', name: 'Nitesh' },
  ];

  // 1. Primary example from prompt
  it('correctly calculates the prompt example: Shashikant paid 2000, Nitesh paid 1500, Nitesh owes Shashikant 250', () => {
    const expenses: Expense[] = [
      {
        id: 'exp1',
        item: 'Groceries (Atta, Rice)',
        amountPaise: 200000, // ₹2,000.00
        category: 'Groceries',
        paidBy: 'shashikant',
        date: '2026-11-01',
        month: '2026-11',
        type: 'shared',
        createdAt: '2026-11-01T10:00:00Z',
        updatedAt: '2026-11-01T10:00:00Z',
        createdBy: 'shashikant',
      },
      {
        id: 'exp2',
        item: 'Electricity bill',
        amountPaise: 150000, // ₹1,500.00
        category: 'Utilities',
        paidBy: 'nitesh',
        date: '2026-11-05',
        month: '2026-11',
        type: 'shared',
        createdAt: '2026-11-05T10:00:00Z',
        updatedAt: '2026-11-05T10:00:00Z',
        createdBy: 'nitesh',
      },
    ];

    const result = calculateMonth(expenses, [], '2026-11', members);

    expect(result.totalPaise).toBe(350000); // ₹3,500.00
    expect(result.paidPerMember['shashikant']).toBe(200000);
    expect(result.paidPerMember['nitesh']).toBe(150000);
    expect(result.sharePerMember['shashikant']).toBe(175000);
    expect(result.sharePerMember['nitesh']).toBe(175000);

    // Shashikant paid 2000, share 1750 -> net +250
    // Nitesh paid 1500, share 1750 -> net -250
    expect(result.netPerMember['shashikant']).toBe(25000);
    expect(result.netPerMember['nitesh']).toBe(-25000);
    expect(result.settled).toBe(false);

    // Minimal transfer: Nitesh owes Shashikant ₹250
    expect(result.settlementTransfers).toHaveLength(1);
    expect(result.settlementTransfers[0]).toEqual({
      from: 'nitesh',
      to: 'shashikant',
      amountPaise: 25000,
    });

    // Perspective messages
    const messageForNitesh = formatSettlementMessage(
      'nitesh',
      'shashikant',
      25000,
      'nitesh',
      { shashikant: 'Shashikant', nitesh: 'Nitesh' }
    );
    expect(messageForNitesh).toBe('You owe Shashikant ₹250.00');

    const messageForShashikant = formatSettlementMessage(
      'nitesh',
      'shashikant',
      25000,
      'shashikant',
      { shashikant: 'Shashikant', nitesh: 'Nitesh' }
    );
    expect(messageForShashikant).toBe('Nitesh owes you ₹250.00');
  });

  // 2. Personal and deleted expenses excluded
  it('excludes personal and soft-deleted expenses from the calculation', () => {
    const expenses: Expense[] = [
      {
        id: 'exp1',
        item: 'Shared milk',
        amountPaise: 10000, // ₹100.00
        category: 'Dairy',
        paidBy: 'shashikant',
        date: '2026-11-01',
        month: '2026-11',
        type: 'shared',
        createdAt: '2026-11-01T10:00:00Z',
        updatedAt: '2026-11-01T10:00:00Z',
        createdBy: 'shashikant',
      },
      {
        id: 'exp2',
        item: 'Personal shoes',
        amountPaise: 500000, // ₹5,000.00
        category: 'Other',
        paidBy: 'shashikant',
        date: '2026-11-02',
        month: '2026-11',
        type: 'personal',
        createdAt: '2026-11-02T10:00:00Z',
        updatedAt: '2026-11-02T10:00:00Z',
        createdBy: 'shashikant',
      },
      {
        id: 'exp3',
        item: 'Accidental entry',
        amountPaise: 20000,
        category: 'Groceries',
        paidBy: 'nitesh',
        date: '2026-11-03',
        month: '2026-11',
        type: 'shared',
        createdAt: '2026-11-03T10:00:00Z',
        updatedAt: '2026-11-03T10:00:00Z',
        createdBy: 'nitesh',
        deletedAt: '2026-11-03T11:00:00Z',
      },
    ];

    const result = calculateMonth(expenses, [], '2026-11', members);
    expect(result.totalPaise).toBe(10000); // Only exp1
    expect(result.paidPerMember['shashikant']).toBe(10000);
    expect(result.paidPerMember['nitesh']).toBe(0);
  });

  // 3. Selected month by purchase date
  it('filters expenses strictly by purchase date in the selected month', () => {
    const expenses: Expense[] = [
      {
        id: 'exp-oct',
        item: 'October purchase',
        amountPaise: 60000,
        category: 'Groceries',
        paidBy: 'shashikant',
        date: '2026-10-31',
        month: '2026-10',
        type: 'shared',
        createdAt: '2026-11-01T00:05:00Z', // Submitted in November, but purchased in October
        updatedAt: '2026-11-01T00:05:00Z',
        createdBy: 'shashikant',
      },
      {
        id: 'exp-nov',
        item: 'November purchase',
        amountPaise: 40000,
        category: 'Groceries',
        paidBy: 'shashikant',
        date: '2026-11-01',
        month: '2026-11',
        type: 'shared',
        createdAt: '2026-11-01T00:06:00Z',
        updatedAt: '2026-11-01T00:06:00Z',
        createdBy: 'shashikant',
      },
    ];

    const result = calculateMonth(expenses, [], '2026-11', members);
    expect(result.totalPaise).toBe(40000);
  });

  // 4. Odd paise sum exactly and alternate between months
  it('ensures odd paise sum exactly and alternates remainder between months', () => {
    // ₹100.01 = 10001 paise. Split between 2 people = 5000 paise each + 1 paisa remainder
    const expenseNov: Expense = {
      id: 'odd1',
      item: 'Odd item Nov',
      amountPaise: 10001,
      category: 'Groceries',
      paidBy: 'shashikant',
      date: '2026-11-01',
      month: '2026-11',
      type: 'shared',
      createdAt: '2026-11-01T10:00:00Z',
      updatedAt: '2026-11-01T10:00:00Z',
      createdBy: 'shashikant',
    };

    const resNov = calculateMonth([expenseNov], [], '2026-11', members);
    const sumSharesNov = resNov.sharePerMember['shashikant'] + resNov.sharePerMember['nitesh'];
    expect(sumSharesNov).toBe(10001);

    const expenseDec: Expense = {
      id: 'odd2',
      item: 'Odd item Dec',
      amountPaise: 10001,
      category: 'Groceries',
      paidBy: 'shashikant',
      date: '2026-12-01',
      month: '2026-12',
      type: 'shared',
      createdAt: '2026-12-01T10:00:00Z',
      updatedAt: '2026-12-01T10:00:00Z',
      createdBy: 'shashikant',
    };

    const resDec = calculateMonth([expenseDec], [], '2026-12', members);
    const sumSharesDec = resDec.sharePerMember['shashikant'] + resDec.sharePerMember['nitesh'];
    expect(sumSharesDec).toBe(10001);

    // Check alternation: if Shashikant got 5001 in Nov, Nitesh must get 5001 in Dec (or vice versa)
    const novShashikantOdd = resNov.sharePerMember['shashikant'] === 5001;
    const decShashikantOdd = resDec.sharePerMember['shashikant'] === 5001;
    expect(novShashikantOdd).not.toBe(decShashikantOdd);
  });

  // 5. Duplicate ids not double counted
  it('ignores duplicate expense ids safely', () => {
    const expense: Expense = {
      id: 'duplicate-id',
      item: 'Atta',
      amountPaise: 50000,
      category: 'Groceries',
      paidBy: 'shashikant',
      date: '2026-11-01',
      month: '2026-11',
      type: 'shared',
      createdAt: '2026-11-01T10:00:00Z',
      updatedAt: '2026-11-01T10:00:00Z',
      createdBy: 'shashikant',
    };

    // Array with 3 identical ids (re-submission / offline duplicate)
    const result = calculateMonth([expense, expense, expense], [], '2026-11', members);
    expect(result.totalPaise).toBe(50000);
  });

  // 6. Pending vs completed payments
  it('only completed payments update the remaining balance; pending payments change nothing', () => {
    const expenses: Expense[] = [
      {
        id: 'exp1',
        item: 'Groceries',
        amountPaise: 200000,
        category: 'Groceries',
        paidBy: 'shashikant',
        date: '2026-11-01',
        month: '2026-11',
        type: 'shared',
        createdAt: '2026-11-01T10:00:00Z',
        updatedAt: '2026-11-01T10:00:00Z',
        createdBy: 'shashikant',
      },
    ];

    // Net balance: Nitesh owes Shashikant ₹1,000 (100000 paise)
    const pendingSettlement: Settlement = {
      id: 'set1',
      from: 'nitesh',
      to: 'shashikant',
      amountPaise: 100000,
      date: '2026-11-10',
      forMonth: '2026-11',
      status: 'pending',
      createdAt: '2026-11-10T10:00:00Z',
      createdBy: 'nitesh',
    };

    const resPending = calculateMonth(expenses, [pendingSettlement], '2026-11', members);
    expect(resPending.remainingBalance['nitesh']).toBe(-100000);
    expect(resPending.remainingBalance['shashikant']).toBe(100000);
    expect(resPending.settled).toBe(false);

    // When settlement is completed
    const completedSettlement: Settlement = {
      ...pendingSettlement,
      status: 'completed',
    };

    const resCompleted = calculateMonth(expenses, [completedSettlement], '2026-11', members);
    expect(resCompleted.remainingBalance['nitesh']).toBe(0);
    expect(resCompleted.remainingBalance['shashikant']).toBe(0);
    expect(resCompleted.settled).toBe(true);
    expect(resCompleted.settlementTransfers).toHaveLength(0);
  });

  // 7. Payment tagged to another month ignored
  it('ignores completed settlement tagged to a different month', () => {
    const expenses: Expense[] = [
      {
        id: 'exp1',
        item: 'Groceries',
        amountPaise: 200000,
        category: 'Groceries',
        paidBy: 'shashikant',
        date: '2026-11-01',
        month: '2026-11',
        type: 'shared',
        createdAt: '2026-11-01T10:00:00Z',
        updatedAt: '2026-11-01T10:00:00Z',
        createdBy: 'shashikant',
      },
    ];

    const settlementOct: Settlement = {
      id: 'set-oct',
      from: 'nitesh',
      to: 'shashikant',
      amountPaise: 100000,
      date: '2026-11-02',
      forMonth: '2026-10', // For October, not November!
      status: 'completed',
      createdAt: '2026-11-02T10:00:00Z',
      createdBy: 'nitesh',
    };

    const res = calculateMonth(expenses, [settlementOct], '2026-11', members);
    // Settlement does NOT apply to November
    expect(res.remainingBalance['nitesh']).toBe(-100000);
    expect(res.settled).toBe(false);
  });

  // 8. Empty month is settled
  it('considers an empty month as settled with 0 balance', () => {
    const res = calculateMonth([], [], '2026-11', members);
    expect(res.totalPaise).toBe(0);
    expect(res.remainingBalance['shashikant']).toBe(0);
    expect(res.remainingBalance['nitesh']).toBe(0);
    expect(res.settled).toBe(true);
    expect(res.settlementTransfers).toHaveLength(0);
  });

  // 9. Three members stay balanced
  it('handles 3 or more members correctly without losing paise', () => {
    const threeMembers: FlatMember[] = [
      { id: 'shashikant', name: 'Shashikant' },
      { id: 'nitesh', name: 'Nitesh' },
      { id: 'amit', name: 'Amit' },
    ];

    // Total 10000 paise (₹100) split 3 ways = 3333, 3333, 3334
    const expense: Expense = {
      id: 'three1',
      item: 'Internet Wifi',
      amountPaise: 10000,
      category: 'Utilities',
      paidBy: 'shashikant',
      date: '2026-11-01',
      month: '2026-11',
      type: 'shared',
      createdAt: '2026-11-01T10:00:00Z',
      updatedAt: '2026-11-01T10:00:00Z',
      createdBy: 'shashikant',
    };

    const res = calculateMonth([expense], [], '2026-11', threeMembers);
    const sumShares =
      res.sharePerMember['shashikant'] +
      res.sharePerMember['nitesh'] +
      res.sharePerMember['amit'];
    expect(sumShares).toBe(10000);

    const sumNets =
      res.netPerMember['shashikant'] +
      res.netPerMember['nitesh'] +
      res.netPerMember['amit'];
    expect(sumNets).toBe(0);
  });

  // 10. Decimal string parsing (rupeesToPaise)
  it('safely parses rupee decimal strings to paise without floating-point errors', () => {
    expect(rupeesToPaise('19.99')).toBe(1999);
    expect(rupeesToPaise('2000')).toBe(200000);
    expect(rupeesToPaise('0.5')).toBe(50);
    expect(rupeesToPaise('0.50')).toBe(50);
    expect(rupeesToPaise('0.05')).toBe(5);
    expect(rupeesToPaise('100.01')).toBe(10001);
    expect(rupeesToPaise('0')).toBe(0);
  });

  // 11. Invalid decimal input throws
  it('throws on invalid rupee input formats', () => {
    expect(() => rupeesToPaise('')).toThrow();
    expect(() => rupeesToPaise('-10')).toThrow();
    expect(() => rupeesToPaise('abc')).toThrow();
    expect(() => rupeesToPaise('10.123')).toThrow(); // More than 2 decimal digits
    expect(() => rupeesToPaise('10.1.2')).toThrow();
  });

  // 12. Indian currency formatting (formatINR)
  it('formats currency in Indian numbering notation', () => {
    expect(formatINR(0)).toBe('₹0.00');
    expect(formatINR(25000)).toBe('₹250.00');
    expect(formatINR(350000)).toBe('₹3,500.00');
    expect(formatINR(12345678)).toBe('₹1,23,456.78');
    expect(formatINR(-25000)).toBe('-₹250.00');
    expect(formatINR(25000, { showSign: true })).toBe('+₹250.00');
  });

  // 13. CSV Formula injection protection
  it('neutralizes dangerous formula injection prefixes in CSV cells', () => {
    expect(sanitizeCsvCell('=SUM(A1:A10)')).toBe('"\'=SUM(A1:A10)"');
    expect(sanitizeCsvCell('+cmd|/c calc')).toBe('"\' +cmd|/c calc"'.replace(/'\s+/, "'"));
    expect(sanitizeCsvCell('-123')).toBe('"\' -123"'.replace(/'\s+/, "'"));
    expect(sanitizeCsvCell('@ATTACK')).toBe('"\'@ATTACK"');
    expect(sanitizeCsvCell('Normal Item "With Quotes"')).toBe(
      '"Normal Item ""With Quotes"""'
    );
  });

  // 14. Validation helpers
  it('validates expense inputs correctly', () => {
    const valid = validateExpenseInput({
      item: 'Milk',
      amountPaise: 6500,
      paidBy: 'shashikant',
      type: 'shared',
      category: 'Dairy',
      date: '2026-11-01',
      month: '2026-11',
      validMemberIds: ['shashikant', 'nitesh'],
    });
    expect(valid.valid).toBe(true);

    const invalid = validateExpenseInput({
      item: '',
      amountPaise: -10,
      paidBy: 'unknown',
      type: 'invalid-type',
      category: 'NotACategory',
      date: '01-11-2026',
      month: '2026-12', // Doesn't match date!
      validMemberIds: ['shashikant', 'nitesh'],
    });
    expect(invalid.valid).toBe(false);
    expect(invalid.errors.item).toBeDefined();
    expect(invalid.errors.amountPaise).toBeDefined();
    expect(invalid.errors.paidBy).toBeDefined();
    expect(invalid.errors.type).toBeDefined();
    expect(invalid.errors.category).toBeDefined();
    expect(invalid.errors.date).toBeDefined();
    expect(invalid.errors.month).toBeDefined();
  });
});

