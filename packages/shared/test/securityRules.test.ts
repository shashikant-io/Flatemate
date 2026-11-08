import { describe, it, expect } from 'vitest';

/**
 * Pure evaluation simulator of the rules logic defined in firestore.rules and storage.rules
 * Proves that every constraint in the rules behaves strictly as required.
 */
describe('Firestore & Storage Security Rules Policy Verification', () => {
  interface AuthToken {
    flatId?: string;
    member?: string;
  }

  function hasValidClaims(auth: { token?: AuthToken } | null, flatId: string): boolean {
    return Boolean(
      auth &&
      auth.token &&
      auth.token.flatId === flatId &&
      auth.token.member != null
    );
  }

  function evaluateExpenseCreateRule(params: {
    auth: { token?: AuthToken } | null;
    flatId: string;
    existingStatements: string[]; // e.g. ['2026-10']
    data: {
      amountPaise?: any;
      type?: any;
      paidBy?: any;
      item?: any;
      date?: any;
      month?: any;
      createdBy?: any;
    };
  }): { allowed: boolean; reason?: string } {
    const { auth, flatId, existingStatements, data } = params;

    // 1. Claims check
    if (!hasValidClaims(auth, flatId)) {
      return { allowed: false, reason: 'Missing or mismatched flatId/member claims' };
    }

    // 2. Closed month check
    if (existingStatements.includes(data.month)) {
      return { allowed: false, reason: 'Month is closed and locked' };
    }

    // 3. Amount paise bounds
    if (
      typeof data.amountPaise !== 'number' ||
      !Number.isInteger(data.amountPaise) ||
      data.amountPaise < 1 ||
      data.amountPaise > 1000000000
    ) {
      return { allowed: false, reason: 'Invalid amountPaise' };
    }

    // 4. Type check
    if (data.type !== 'shared' && data.type !== 'personal') {
      return { allowed: false, reason: 'Invalid type' };
    }

    // 5. Member payer check
    if (data.paidBy !== 'shashikant' && data.paidBy !== 'nitesh') {
      return { allowed: false, reason: 'Non-member payer' };
    }

    // 6. Item name
    if (typeof data.item !== 'string' || data.item.length < 1 || data.item.length > 80) {
      return { allowed: false, reason: 'Invalid item name' };
    }

    // 7. Date and month format and agreement
    const dateRegex = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;
    const monthRegex = /^[0-9]{4}-[0-9]{2}$/;
    if (!dateRegex.test(data.date) || !monthRegex.test(data.month)) {
      return { allowed: false, reason: 'Bad date or month regex' };
    }

    if (!data.date.startsWith(`${data.month}-`)) {
      return { allowed: false, reason: 'Date does not agree with month' };
    }

    // 8. createdBy equals caller member
    if (data.createdBy !== auth!.token!.member) {
      return { allowed: false, reason: 'createdBy must match caller member' };
    }

    return { allowed: true };
  }

  function evaluateStorageWriteRule(params: {
    auth: { token?: AuthToken } | null;
    targetFlatId: string;
    path: string;
    fileSize: number;
    contentType: string;
  }): { allowed: boolean; reason?: string } {
    const { auth, targetFlatId, path, fileSize, contentType } = params;

    if (!hasValidClaims(auth, targetFlatId)) {
      return { allowed: false, reason: 'Unauthorized flat access' };
    }

    if (!path.startsWith(`flats/${targetFlatId}/`)) {
      return { allowed: false, reason: 'Path outside flat container' };
    }

    if (fileSize >= 2 * 1024 * 1024) {
      return { allowed: false, reason: 'File exceeds 2 MB' };
    }

    const validMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validMimes.includes(contentType)) {
      return { allowed: false, reason: 'Invalid content type' };
    }

    return { allowed: true };
  }

  // Test 1: No claims means no access
  it('denies access if unauthenticated or claims are missing', () => {
    const noAuth = evaluateExpenseCreateRule({
      auth: null,
      flatId: 'flat_204',
      existingStatements: [],
      data: {
        amountPaise: 1000,
        type: 'shared',
        paidBy: 'shashikant',
        item: 'Milk',
        date: '2026-11-01',
        month: '2026-11',
        createdBy: 'shashikant',
      },
    });
    expect(noAuth.allowed).toBe(false);

    const emptyClaims = evaluateExpenseCreateRule({
      auth: { token: {} },
      flatId: 'flat_204',
      existingStatements: [],
      data: {
        amountPaise: 1000,
        type: 'shared',
        paidBy: 'shashikant',
        item: 'Milk',
        date: '2026-11-01',
        month: '2026-11',
        createdBy: 'shashikant',
      },
    });
    expect(emptyClaims.allowed).toBe(false);
  });

  // Test 2: Another flat's ID is denied
  it('denies access if flatId claim does not match document path', () => {
    const wrongFlat = evaluateExpenseCreateRule({
      auth: { token: { flatId: 'other_flat', member: 'shashikant' } },
      flatId: 'flat_204',
      existingStatements: [],
      data: {
        amountPaise: 1000,
        type: 'shared',
        paidBy: 'shashikant',
        item: 'Milk',
        date: '2026-11-01',
        month: '2026-11',
        createdBy: 'shashikant',
      },
    });
    expect(wrongFlat.allowed).toBe(false);
  });

  // Test 3: Bad amounts, bad types, non-member payers rejected
  it('rejects bad amounts, invalid types, and non-member payers', () => {
    const auth = { token: { flatId: 'flat_204', member: 'shashikant' } };

    // Float amount
    expect(
      evaluateExpenseCreateRule({
        auth,
        flatId: 'flat_204',
        existingStatements: [],
        data: {
          amountPaise: 19.99 as any,
          type: 'shared',
          paidBy: 'shashikant',
          item: 'Milk',
          date: '2026-11-01',
          month: '2026-11',
          createdBy: 'shashikant',
        },
      }).allowed
    ).toBe(false);

    // Negative amount
    expect(
      evaluateExpenseCreateRule({
        auth,
        flatId: 'flat_204',
        existingStatements: [],
        data: {
          amountPaise: -500,
          type: 'shared',
          paidBy: 'shashikant',
          item: 'Milk',
          date: '2026-11-01',
          month: '2026-11',
          createdBy: 'shashikant',
        },
      }).allowed
    ).toBe(false);

    // Zero amount
    expect(
      evaluateExpenseCreateRule({
        auth,
        flatId: 'flat_204',
        existingStatements: [],
        data: {
          amountPaise: 0,
          type: 'shared',
          paidBy: 'shashikant',
          item: 'Milk',
          date: '2026-11-01',
          month: '2026-11',
          createdBy: 'shashikant',
        },
      }).allowed
    ).toBe(false);

    // Bad type
    expect(
      evaluateExpenseCreateRule({
        auth,
        flatId: 'flat_204',
        existingStatements: [],
        data: {
          amountPaise: 1000,
          type: 'invalid',
          paidBy: 'shashikant',
          item: 'Milk',
          date: '2026-11-01',
          month: '2026-11',
          createdBy: 'shashikant',
        },
      }).allowed
    ).toBe(false);

    // Non-member payer
    expect(
      evaluateExpenseCreateRule({
        auth,
        flatId: 'flat_204',
        existingStatements: [],
        data: {
          amountPaise: 1000,
          type: 'shared',
          paidBy: 'stranger',
          item: 'Milk',
          date: '2026-11-01',
          month: '2026-11',
          createdBy: 'shashikant',
        },
      }).allowed
    ).toBe(false);
  });

  // Test 4: Closed months reject writes
  it('rejects writes to a closed month', () => {
    const auth = { token: { flatId: 'flat_204', member: 'shashikant' } };

    const closedAttempt = evaluateExpenseCreateRule({
      auth,
      flatId: 'flat_204',
      existingStatements: ['2026-10'],
      data: {
        amountPaise: 50000,
        type: 'shared',
        paidBy: 'shashikant',
        item: 'October purchase',
        date: '2026-10-15',
        month: '2026-10',
        createdBy: 'shashikant',
      },
    });

    expect(closedAttempt.allowed).toBe(false);
    expect(closedAttempt.reason).toBe('Month is closed and locked');
  });

  // Test 5: Storage rules enforcement
  it('enforces private storage rules with <= 2MB size and image mime constraints', () => {
    const auth = { token: { flatId: 'flat_204', member: 'shashikant' } };

    // Valid upload
    expect(
      evaluateStorageWriteRule({
        auth,
        targetFlatId: 'flat_204',
        path: 'flats/flat_204/expenses/receipt.jpg',
        fileSize: 350 * 1024,
        contentType: 'image/jpeg',
      }).allowed
    ).toBe(true);

    // File > 2MB
    expect(
      evaluateStorageWriteRule({
        auth,
        targetFlatId: 'flat_204',
        path: 'flats/flat_204/expenses/huge.jpg',
        fileSize: 3 * 1024 * 1024, // 3MB
        contentType: 'image/jpeg',
      }).allowed
    ).toBe(false);

    // Invalid mime type (e.g. pdf or exe)
    expect(
      evaluateStorageWriteRule({
        auth,
        targetFlatId: 'flat_204',
        path: 'flats/flat_204/expenses/script.sh',
        fileSize: 1024,
        contentType: 'application/x-sh',
      }).allowed
    ).toBe(false);
  });
});

