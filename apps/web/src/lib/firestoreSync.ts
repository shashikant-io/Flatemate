import {
  collection,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  setDoc,
  updateDoc,
  FirestoreError,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import { Expense, Settlement, Statement } from '@flatmate/shared';

export interface SyncableExpense extends Expense {
  hasPendingWrites?: boolean;
}

export interface SyncableSettlement extends Settlement {
  hasPendingWrites?: boolean;
}

/**
 * Listens in real-time to expenses for a given month with metadata tracking.
 * `hasPendingWrites` tells the UI whether an item has been confirmed by the server
 * or is still stored locally awaiting sync.
 */
export function subscribeToExpenses(
  flatId: string,
  month: string,
  onUpdate: (expenses: SyncableExpense[]) => void,
  onError?: (error: FirestoreError) => void
): Unsubscribe {
  const expensesRef = collection(db, 'flats', flatId, 'expenses');
  const q = query(
    expensesRef,
    where('month', '==', month),
    orderBy('date', 'desc')
  );

  return onSnapshot(
    q,
    { includeMetadataChanges: true },
    (snapshot) => {
      const items: SyncableExpense[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          ...(data as Expense),
          id: docSnap.id,
          hasPendingWrites: docSnap.metadata.hasPendingWrites,
        });
      });
      onUpdate(items);
    },
    (err) => {
      console.warn('[FlatMate] Expenses snapshot error:', err);
      onError?.(err);
    }
  );
}

/**
 * Listens in real-time to settlements for a given month with metadata tracking.
 */
export function subscribeToSettlements(
  flatId: string,
  month: string,
  onUpdate: (settlements: SyncableSettlement[]) => void,
  onError?: (error: FirestoreError) => void
): Unsubscribe {
  const settlementsRef = collection(db, 'flats', flatId, 'settlements');
  const q = query(
    settlementsRef,
    where('forMonth', '==', month),
    orderBy('date', 'desc')
  );

  return onSnapshot(
    q,
    { includeMetadataChanges: true },
    (snapshot) => {
      const items: SyncableSettlement[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          ...(data as Settlement),
          id: docSnap.id,
          hasPendingWrites: docSnap.metadata.hasPendingWrites,
        });
      });
      onUpdate(items);
    },
    (err) => {
      console.warn('[FlatMate] Settlements snapshot error:', err);
      onError?.(err);
    }
  );
}

/**
 * Listens to closed month statements for a flat.
 */
export function subscribeToStatements(
  flatId: string,
  onUpdate: (closedMonths: string[]) => void
): Unsubscribe {
  const statementsRef = collection(db, 'flats', flatId, 'statements');

  return onSnapshot(
    statementsRef,
    (snapshot) => {
      const closed: string[] = [];
      snapshot.forEach((docSnap) => {
        closed.push(docSnap.id);
      });
      onUpdate(closed);
    },
    (err) => {
      console.warn('[FlatMate] Statements snapshot error:', err);
    }
  );
}

/**
 * Saves an expense using a client-generated ID so offline re-submissions
 * and offline sync replays never generate duplicate documents.
 */
export async function saveExpenseDoc(flatId: string, expense: Expense): Promise<void> {
  const expenseRef = doc(db, 'flats', flatId, 'expenses', expense.id);
  await setDoc(expenseRef, expense);
}

/**
 * Updates an existing expense document.
 */
export async function updateExpenseDoc(
  flatId: string,
  expenseId: string,
  updates: Partial<Expense>
): Promise<void> {
  const expenseRef = doc(db, 'flats', flatId, 'expenses', expenseId);
  await updateDoc(expenseRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Performs a soft-delete by writing `deletedAt`. Never hard-deletes.
 */
export async function softDeleteExpenseDoc(
  flatId: string,
  expenseId: string
): Promise<void> {
  const expenseRef = doc(db, 'flats', flatId, 'expenses', expenseId);
  await updateDoc(expenseRef, {
    deletedAt: new Date().toISOString(),
  });
}

/**
 * Saves a settlement record.
 */
export async function saveSettlementDoc(
  flatId: string,
  settlement: Settlement
): Promise<void> {
  const setRef = doc(db, 'flats', flatId, 'settlements', settlement.id);
  await setDoc(setRef, settlement);
}

/**
 * Marks a settlement as completed.
 */
export async function markSettlementCompletedDoc(
  flatId: string,
  settlementId: string
): Promise<void> {
  const setRef = doc(db, 'flats', flatId, 'settlements', settlementId);
  await updateDoc(setRef, {
    status: 'completed',
  });
}

