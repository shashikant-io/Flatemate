import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { calculateMonth, Expense, Settlement, FlatMember } from '@flatmate/shared';

interface CloseMonthData {
  month: string; // YYYY-MM
}

export const closeMonth = onCall(
  {
    region: 'asia-south1',
  },
  async (request) => {
    // 1. Must be authenticated with valid custom claims
    if (!request.auth || !request.auth.token.flatId || !request.auth.token.member) {
      throw new HttpsError(
        'permission-denied',
        'Caller must be an authorized member of a flat.'
      );
    }

    const flatId = request.auth.token.flatId as string;
    const callerMember = request.auth.token.member as string;
    const { month } = request.data as CloseMonthData;

    // 2. Validate month format
    const monthRegex = /^\d{4}-\d{2}$/;
    if (!month || !monthRegex.test(month)) {
      throw new HttpsError('invalid-argument', 'Month must be in YYYY-MM format.');
    }

    // Disallow future months
    const currentMonthStr = new Date().toISOString().slice(0, 7);
    if (month > currentMonthStr) {
      throw new HttpsError('invalid-argument', 'Cannot close future months.');
    }

    const db = admin.firestore();

    // 3. Disallow second close / immutable statements
    const statementRef = db.doc(`flats/${flatId}/statements/${month}`);
    const statementSnap = await statementRef.get();
    if (statementSnap.exists) {
      throw new HttpsError(
        'already-exists',
        `Month ${month} is already closed and statements cannot be modified.`
      );
    }

    // 4. Fetch flat metadata and members
    const flatRef = db.doc(`flats/${flatId}`);
    const flatSnap = await flatRef.get();
    if (!flatSnap.exists) {
      throw new HttpsError('not-found', 'Flat document does not exist.');
    }
    const members: FlatMember[] = flatSnap.data()?.members || [
      { id: 'shashikant', name: 'Shashikant' },
      { id: 'nitesh', name: 'Nitesh' },
    ];

    // 5. Fetch all non-deleted expenses for this month
    const expensesSnap = await db
      .collection(`flats/${flatId}/expenses`)
      .where('month', '==', month)
      .get();

    const expenses: Expense[] = [];
    expensesSnap.forEach((doc) => {
      const data = doc.data();
      if (!data.deletedAt) {
        expenses.push({ id: doc.id, ...data } as Expense);
      }
    });

    // 6. Fetch all non-deleted settlements for this month
    const settlementsSnap = await db
      .collection(`flats/${flatId}/settlements`)
      .where('forMonth', '==', month)
      .get();

    const settlements: Settlement[] = [];
    settlementsSnap.forEach((doc) => {
      const data = doc.data();
      if (!data.deletedAt) {
        settlements.push({ id: doc.id, ...data } as Settlement);
      }
    });

    // 7. Recompute calculation on the server
    const calculation = calculateMonth(expenses, settlements, month, members);

    // 8. Write immutable statement snapshot
    const statement = {
      closedAt: new Date().toISOString(),
      closedBy: callerMember,
      result: calculation,
    };

    await statementRef.set(statement);

    return {
      success: true,
      statement,
    };
  }
);

