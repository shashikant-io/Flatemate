import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import {
  Expense,
  Settlement,
  FlatMember,
  MonthCalculation,
  calculateMonth,
  rupeesToPaise,
} from '@flatmate/shared';
import { useAuth } from './AuthContext';
import {
  subscribeToExpenses,
  subscribeToSettlements,
  subscribeToStatements,
  subscribeToFlat,
  saveExpenseDoc,
  updateExpenseDoc,
  softDeleteExpenseDoc,
  saveSettlementDoc,
  markSettlementCompletedDoc,
  SyncableExpense,
  SyncableSettlement,
} from '@/lib/firestoreSync';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

export interface FlatContextType {
  currentMemberId: string;
  setCurrentMemberId: (id: string) => void;
  members: FlatMember[];
  flatName: string;
  currentMonth: string;
  setCurrentMonth: (month: string) => void;
  expenses: SyncableExpense[];
  settlements: SyncableSettlement[];
  calculation: MonthCalculation;
  closedMonths: string[];
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => string;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  addSettlement: (settlement: Omit<Settlement, 'id' | 'createdAt' | 'createdBy'>) => string;
  markSettlementCompleted: (id: string) => void;
  isMonthClosed: (month: string) => boolean;
  closeMonth: (month: string) => Promise<boolean>;
  forgetDevice: () => void;
}

const LEGACY_MEMBERS: FlatMember[] = [
  { id: 'legacy', name: 'Member' },
];
/* Legacy data is intentionally not used as a shared-data fallback. */
/*
  {
    id: 'exp-1',
    item: 'Aashirvaad Atta (10kg) & Rice (5kg)',
    amountPaise: 99000,
    quantity: '10kg + 5kg',
    category: 'Groceries',
    paidBy: 'shashikant',
    date: '2026-11-01',
    month: '2026-11',
    type: 'shared',
    notes: 'Bought from Nature Basket',
    createdAt: '2026-11-01T10:15:00Z',
    updatedAt: '2026-11-01T10:15:00Z',
    createdBy: 'shashikant',
  },
  {
    id: 'exp-2',
    item: 'Amul Taaza Milk & Dahi',
    amountPaise: 16000,
    quantity: '2L + 400g',
    category: 'Dairy',
    paidBy: 'nitesh',
    date: '2026-11-02',
    month: '2026-11',
    type: 'shared',
    notes: 'Morning Blinkit delivery',
    createdAt: '2026-11-02T07:30:00Z',
    updatedAt: '2026-11-02T07:30:00Z',
    createdBy: 'nitesh',
  },
  {
    id: 'exp-3',
    item: 'Tomatoes, Onions, Potatoes, Chillies',
    amountPaise: 24000,
    quantity: 'Weekly veggies',
    category: 'Vegetables',
    paidBy: 'shashikant',
    date: '2026-11-03',
    month: '2026-11',
    type: 'shared',
    notes: 'Local mandi',
    createdAt: '2026-11-03T18:00:00Z',
    updatedAt: '2026-11-03T18:00:00Z',
    createdBy: 'shashikant',
  },
  {
    id: 'exp-4',
    item: 'Fortune Sunflower Oil (5L Jar)',
    amountPaise: 79000,
    quantity: '5 Litres',
    category: 'Groceries',
    paidBy: 'nitesh',
    date: '2026-11-04',
    month: '2026-11',
    type: 'shared',
    notes: 'Amazon Fresh discount',
    createdAt: '2026-11-04T12:00:00Z',
    updatedAt: '2026-11-04T12:00:00Z',
    createdBy: 'nitesh',
  },
  {
    id: 'exp-5',
    item: 'Electricity Bill (Bescom)',
    amountPaise: 168000,
    quantity: 'Units: 142',
    category: 'Utilities',
    paidBy: 'shashikant',
    date: '2026-11-05',
    month: '2026-11',
    type: 'shared',
    notes: 'Paid via GPay UPI',
    createdAt: '2026-11-05T14:20:00Z',
    updatedAt: '2026-11-05T14:20:00Z',
    createdBy: 'shashikant',
  },
  {
    id: 'exp-6',
    item: 'Surf Excel Matic & Vim Liquid Gel',
    amountPaise: 38000,
    quantity: '2L + 500ml',
    category: 'Cleaning',
    paidBy: 'nitesh',
    date: '2026-11-06',
    month: '2026-11',
    type: 'shared',
    notes: 'House maintenance items',
    createdAt: '2026-11-06T19:40:00Z',
    updatedAt: '2026-11-06T19:40:00Z',
    createdBy: 'nitesh',
  },
  {
    id: 'exp-oct-1',
    item: 'WiFi Broadband - ACT Fibernet',
    amountPaise: 115000,
    category: 'Utilities',
    paidBy: 'nitesh',
    date: '2026-10-15',
    month: '2026-10',
    type: 'shared',
    createdAt: '2026-10-15T10:00:00Z',
    updatedAt: '2026-10-15T10:00:00Z',
    createdBy: 'nitesh',
  },
  {
    id: 'exp-oct-2',
    item: 'Monthly Grocery Stockup',
    amountPaise: 325000,
    category: 'Groceries',
    paidBy: 'shashikant',
    date: '2026-10-02',
    month: '2026-10',
    type: 'shared',
    createdAt: '2026-10-02T10:00:00Z',
    updatedAt: '2026-10-02T10:00:00Z',
    createdBy: 'shashikant',
  },
];
*/

/*
  {
    id: 'set-1',
    from: 'nitesh',
    to: 'shashikant',
    amountPaise: 50000,
    date: '2026-11-06',
    forMonth: '2026-11',
    status: 'completed',
    notes: 'UPI transfer to bank account',
    createdAt: '2026-11-06T20:00:00Z',
    createdBy: 'nitesh',
  },
];
*/

const getLiveCurrentMonth = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

const FlatContext = createContext<FlatContextType | undefined>(undefined);

export function FlatProvider({ children }: { children: React.ReactNode }) {
  const { member: authMember, flatId } = useAuth();

  const [currentMemberId, setCurrentMemberId] = useState<string>(() => {
    return authMember || localStorage.getItem('flatmate-member') || 'shashikant';
  });

  const [currentMonth, setCurrentMonth] = useState<string>(getLiveCurrentMonth);
  const [closedMonths, setClosedMonths] = useState<string[]>([]);
  const [members, setMembers] = useState<FlatMember[]>([]);
  const [flatName, setFlatName] = useState('Shared Flat');

  // Automatically update currentMonth if month rolls over while app is open
  useEffect(() => {
    const handleMonthSync = () => {
      const live = getLiveCurrentMonth();
      setCurrentMonth((prev) => (prev !== live ? live : prev));
    };

    const interval = setInterval(handleMonthSync, 60000);
    window.addEventListener('visibilitychange', handleMonthSync);
    return () => {
      clearInterval(interval);
      window.removeEventListener('visibilitychange', handleMonthSync);
    };
  }, []);

  const [expenses, setExpenses] = useState<SyncableExpense[]>(() => {
    return [];
  });

  const [settlements, setSettlements] = useState<SyncableSettlement[]>(() => {
    return [];
  });

  useEffect(() => {
    if (authMember) {
      setCurrentMemberId(authMember);
    }
  }, [authMember]);

  // Real-time Firestore Listeners with automatic cleanup
  useEffect(() => {
    if (!flatId) return;

    const unsubscribeFlat = subscribeToFlat(
      flatId,
      (flat) => setFlatName(flat.name),
      (liveMembers) => setMembers(liveMembers),
      (error) => console.warn('[FlatMate] Flat metadata snapshot error:', error)
    );

    // 1. Subscribe to all expenses so month navigation and history stay synchronized
    const unsubscribeExpenses = subscribeToExpenses(
      flatId,
      currentMonth,
      (liveExpenses) => {
        setExpenses(liveExpenses);
      }
    );

    // 2. Subscribe to settlements for currentMonth
    const unsubscribeSettlements = subscribeToSettlements(
      flatId,
      currentMonth,
      (liveSettlements) => {
        setSettlements(liveSettlements);
      }
    );

    // 3. Subscribe to statements
    const unsubscribeStatements = subscribeToStatements(flatId, (closed) => {
      setClosedMonths((prev) => Array.from(new Set([...prev, ...closed])));
    });

    return () => {
      unsubscribeExpenses();
      unsubscribeSettlements();
      unsubscribeStatements();
      unsubscribeFlat();
    };
  }, [flatId, currentMonth]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('flatmate-member', currentMemberId);
  }, [currentMemberId]);

  // Pure Calculation Engine evaluation
  const calculation = useMemo(() => {
    return calculateMonth(
      expenses,
      settlements,
      currentMonth,
      members.length > 0 ? members : LEGACY_MEMBERS
    );
  }, [expenses, settlements, currentMonth, members]);

  const addExpense = (data: Omit<Expense, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => {
    const id = `exp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const newExpense: SyncableExpense = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
      createdBy: currentMemberId,
      hasPendingWrites: true,
    };

    // Update local state immediately for zero-latency UI
    setExpenses((prev) => [newExpense, ...prev]);

    // Push to Firestore if connected
    if (flatId) {
      saveExpenseDoc(flatId, newExpense).catch((err) => {
        console.warn('[FlatMate] Offline or Firestore write error:', err);
      });
    }

    return id;
  };

  const updateExpense = (id: string, updates: Partial<Expense>) => {
    const now = new Date().toISOString();
    setExpenses((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, ...updates, updatedAt: now, hasPendingWrites: true } : e
      )
    );

    if (flatId) {
      updateExpenseDoc(flatId, id, updates).catch((err) => {
        console.warn('[FlatMate] Firestore update error:', err);
      });
    }
  };

  const deleteExpense = (id: string) => {
    const now = new Date().toISOString();
    setExpenses((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, deletedAt: now, hasPendingWrites: true } : e
      )
    );

    if (flatId) {
      softDeleteExpenseDoc(flatId, id).catch((err) => {
        console.warn('[FlatMate] Firestore delete error:', err);
      });
    }
  };

  const addSettlement = (data: Omit<Settlement, 'id' | 'createdAt' | 'createdBy'>) => {
    const id = `set_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const newSettlement: SyncableSettlement = {
      ...data,
      id,
      createdAt: now,
      createdBy: currentMemberId,
      hasPendingWrites: true,
    };

    setSettlements((prev) => [newSettlement, ...prev]);

    if (flatId) {
      saveSettlementDoc(flatId, newSettlement).catch((err) => {
        console.warn('[FlatMate] Firestore settlement write error:', err);
      });
    }

    return id;
  };

  const markSettlementCompleted = (id: string) => {
    setSettlements((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, status: 'completed', hasPendingWrites: true } : s
      )
    );

    if (flatId) {
      markSettlementCompletedDoc(flatId, id).catch((err) => {
        console.warn('[FlatMate] Firestore settlement update error:', err);
      });
    }
  };

  const isMonthClosed = (month: string) => {
    return closedMonths.includes(month);
  };

  const closeMonth = async (month: string): Promise<boolean> => {
    if (!closedMonths.includes(month)) {
      setClosedMonths((prev) => [...prev, month]);
    }

    // Call Cloud Function closeMonth if available
    try {
      const closeFn = httpsCallable<{ month: string }, { success: boolean }>(
        functions,
        'closeMonth'
      );
      await closeFn({ month });
      return true;
    } catch (err) {
      console.warn('[FlatMate] Cloud Function closeMonth warning:', err);
      return true;
    }
  };

  const forgetDevice = () => {
    localStorage.removeItem('flatmate-member');
    localStorage.removeItem('flatmate-expenses');
    localStorage.removeItem('flatmate-settlements');
    setExpenses([]);
    setSettlements([]);
    setCurrentMemberId('shashikant');
  };

  return (
    <FlatContext.Provider
      value={{
        currentMemberId,
        setCurrentMemberId,
        members,
        flatName,
        currentMonth,
        setCurrentMonth,
        expenses,
        settlements,
        calculation,
        closedMonths,
        addExpense,
        updateExpense,
        deleteExpense,
        addSettlement,
        markSettlementCompleted,
        isMonthClosed,
        closeMonth,
        forgetDevice,
      }}
    >
      {children}
    </FlatContext.Provider>
  );
}

export function useFlat() {
  const context = useContext(FlatContext);
  if (!context) {
    throw new Error('useFlat must be used within a FlatProvider');
  }
  return context;
}
