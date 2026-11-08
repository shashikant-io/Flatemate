import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CategoryIcon } from '@/components/common/CategoryIcon';
import {
  Search,
  Filter,
  Receipt,
  Trash2,
  Edit3,
  Lock,
  Calendar,
  AlertTriangle,
  X,
  Check,
} from 'lucide-react';
import { useFlat } from '@/context/FlatContext';
import { useAuth } from '@/context/AuthContext';
import { Expense, ExpenseCategory, EXPENSE_CATEGORIES, formatINR } from '@flatmate/shared';
import { cn } from '@/lib/utils';

export function HistoryPage() {
  const { expenses, deleteExpense, updateExpense, currentMonth, isMonthClosed } = useFlat();
  const { member: authMember } = useAuth();

  const [search, setSearch] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [filterMember, setFilterMember] = useState<'all' | 'shashikant' | 'nitesh'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterType, setFilterType] = useState<'all' | 'shared' | 'personal'>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Delete confirmation state
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  // Edit expense state
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const [editItem, setEditItem] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const isClosed = isMonthClosed(selectedMonth);

  // Filter expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      // Must not be deleted
      if (e.deletedAt) return false;

      // Month check
      if (!e.date.startsWith(`${selectedMonth}-`)) return false;

      // Search check
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesItem = e.item.toLowerCase().includes(q);
        const matchesNotes = e.notes ? e.notes.toLowerCase().includes(q) : false;
        if (!matchesItem && !matchesNotes) return false;
      }

      // Member filter
      if (filterMember !== 'all' && e.paidBy !== filterMember) return false;

      // Category filter
      if (filterCategory !== 'all' && e.category !== filterCategory) return false;

      // Type filter
      if (filterType !== 'all' && e.type !== filterType) return false;

      return true;
    });
  }, [expenses, selectedMonth, search, filterMember, filterCategory, filterType]);

  const handleDeleteConfirm = () => {
    if (expenseToDelete) {
      deleteExpense(expenseToDelete.id);
      setExpenseToDelete(null);
    }
  };

  const handleEditOpen = (exp: Expense) => {
    setExpenseToEdit(exp);
    setEditItem(exp.item);
    setEditNotes(exp.notes || '');
  };

  const handleEditSave = () => {
    if (expenseToEdit && editItem.trim()) {
      updateExpense(expenseToEdit.id, {
        item: editItem.trim(),
        notes: editNotes.trim() || undefined,
      });
      setExpenseToEdit(null);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-[#737A95]">
            <span>Records Ledger</span>
            <span>•</span>
            <span className="text-[#A1A5BC]">Verified Purchases</span>
          </div>
          <h2 className="text-2xl font-heading font-extrabold tracking-tight text-white mt-0.5">
            Transaction History
          </h2>
        </div>

        {/* Month Selector */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-[#477BFF]" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="h-10 px-3.5 rounded-xl border border-white/[0.08] bg-[#101120] text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#315BFF] transition-all cursor-pointer"
          >
            <option value="2026-11">November 2026 (Active)</option>
            <option value="2026-10">October 2026 (Closed)</option>
          </select>
        </div>
      </div>

      {/* Closed Month Read-only Alert */}
      {isClosed && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-[#FFBD59]/10 border border-[#FFBD59]/25 text-[#FFBD59] text-xs">
          <Lock className="h-4 w-4 shrink-0" />
          <div className="flex-1">
            <strong>Closed Month:</strong> Statements for {selectedMonth} have been closed
            and are permanently read-only.
          </div>
        </div>
      )}

      {/* Search & Filter Bar (Inspired by Reference Image 2 Top Filter Bar) */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737A95]" />
            <Input
              placeholder="Search purchases (rice, milk, electricity...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-[#101120] border-white/[0.08] text-white placeholder:text-[#737A95]"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#737A95] hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'px-3.5 rounded-xl border flex items-center justify-center transition-colors min-h-[44px]',
              showFilters
                ? 'border-[#477BFF] bg-[#315BFF]/15 text-[#477BFF] font-bold'
                : 'border-white/[0.08] bg-[#101120] hover:bg-[#15182B] text-[#A1A5BC]'
            )}
            aria-label="Filter expenses"
          >
            <Filter className="h-4 w-4" />
          </button>
        </div>

        {/* Collapsible Filter Bar */}
        {showFilters && (
          <Card className="rounded-2xl p-4 space-y-3 bg-[#101120] border-white/[0.08] animate-slide-up shadow-card">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-white">Filters</span>
              <button
                onClick={() => {
                  setFilterMember('all');
                  setFilterCategory('all');
                  setFilterType('all');
                }}
                className="text-[#477BFF] hover:underline"
              >
                Reset all
              </button>
            </div>

            {/* Payer Filter */}
            <div className="space-y-1">
              <span className="text-[11px] font-medium text-[#737A95]">Payer</span>
              <div className="flex gap-1.5">
                {(['all', 'shashikant', 'nitesh'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setFilterMember(m)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs capitalize transition-all',
                      filterMember === m
                        ? 'bg-gradient-to-r from-[#1745D1] to-[#4169FF] text-white font-semibold shadow-[0_2px_10px_rgba(49,91,255,0.35)]'
                        : 'bg-[#15182B] border border-white/[0.08] text-[#A1A5BC] hover:text-white'
                    )}
                  >
                    {m === 'all' ? 'Everyone' : m}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div className="space-y-1">
              <span className="text-[11px] font-medium text-[#737A95]">Category</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setFilterCategory('all')}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs transition-all',
                    filterCategory === 'all'
                      ? 'bg-gradient-to-r from-[#1745D1] to-[#4169FF] text-white font-semibold'
                      : 'bg-[#15182B] border border-white/[0.08] text-[#A1A5BC] hover:text-white'
                  )}
                >
                  All
                </button>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-xs transition-all',
                      filterCategory === cat
                        ? 'bg-gradient-to-r from-[#1745D1] to-[#4169FF] text-white font-semibold'
                        : 'bg-[#15182B] border border-white/[0.08] text-[#A1A5BC] hover:text-white'
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Expenses Count */}
      <div className="flex items-center justify-between text-xs text-[#737A95] px-1 font-mono">
        <span>Showing {filteredExpenses.length} transactions</span>
        <span>
          Total: {formatINR(filteredExpenses.reduce((acc, e) => acc + e.amountPaise, 0))}
        </span>
      </div>

      {/* Expense List (Reference Image 2 Documents Grid Style) */}
      {filteredExpenses.length === 0 ? (
        <Card className="p-8 text-center rounded-card border-dashed bg-[#101120] border-white/[0.08]">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-[#15182B] text-[#477BFF] flex items-center justify-center mb-3">
            <Receipt className="h-6 w-6" />
          </div>
          <h4 className="font-heading font-semibold text-base mb-1 text-white">
            No transactions match criteria
          </h4>
          <p className="text-xs text-[#737A95] max-w-xs mx-auto">
            Try adjusting your search terms or filters above.
          </p>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {filteredExpenses.map((exp) => (
            <Card
              key={exp.id}
              className="rounded-2xl p-4 flex items-center justify-between bg-[#101120] border border-white/[0.08] hover:border-[#477BFF]/35 hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all group"
            >
              <div className="flex items-center gap-3.5">
                {exp.imagePath ? (
                  <div className="h-12 w-12 rounded-xl overflow-hidden border border-white/[0.08] shrink-0 bg-black/40">
                    <img
                      src={exp.imagePath}
                      alt={exp.item}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <CategoryIcon category={exp.category} size={18} className="p-2.5 rounded-xl bg-[#15182B]" />
                )}

                <div>
                  <h4 className="text-sm font-bold text-white leading-snug">
                    {exp.item}
                  </h4>
                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#737A95] mt-1">
                    <span>{exp.date}</span>
                    <span>•</span>
                    <span
                      className={cn(
                        'font-semibold text-[11px] px-2 py-0.2 rounded-md',
                        exp.paidBy === 'shashikant'
                          ? 'bg-[#25D6B0]/10 text-[#25D6B0]'
                          : 'bg-[#818CF8]/10 text-[#818CF8]'
                      )}
                    >
                      {exp.paidBy === 'shashikant' ? 'Shashikant' : 'Nitesh'}
                    </span>
                    {exp.quantity && (
                      <>
                        <span>•</span>
                        <span className="bg-[#15182B] text-[#A1A5BC] px-1.5 py-0.2 rounded text-[11px]">
                          {exp.quantity}
                        </span>
                      </>
                    )}
                  </div>
                  {exp.notes && (
                    <p className="text-[11px] text-[#737A95] mt-1 italic">
                      "{exp.notes}"
                    </p>
                  )}
                </div>
              </div>

              {/* Amount & Actions */}
              <div className="flex flex-col items-end gap-1.5">
                <span className="font-heading font-black text-base text-white">
                  {formatINR(exp.amountPaise)}
                </span>

                <div className="flex items-center gap-1.5">
                  {exp.hasPendingWrites && (
                    <Badge
                      variant="warning"
                      className="text-[9px] px-1.5 py-0"
                    >
                      Pending sync
                    </Badge>
                  )}
                  <Badge
                    variant={exp.type === 'shared' ? 'blue' : 'secondary'}
                    className="text-[10px] px-1.5 py-0"
                  >
                    {exp.type}
                  </Badge>

                  {/* Actions (disabled if month is closed) */}
                  {!isClosed && (
                    <div className="flex items-center gap-1 ml-1">
                      <button
                        onClick={() => handleEditOpen(exp)}
                        className="p-1.5 rounded-lg text-[#737A95] hover:text-white hover:bg-[#15182B] transition-colors"
                        aria-label="Edit expense"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setExpenseToDelete(exp)}
                        className="p-1.5 rounded-lg text-[#737A95] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
                        aria-label="Delete expense"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {expenseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <Card className="max-w-sm w-full p-6 space-y-4 rounded-hero shadow-2xl bg-[#101120] border border-white/[0.08]">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-[#EF4444]/10 text-[#EF4444] flex items-center justify-center">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-heading font-bold text-lg text-white">Delete Expense?</h3>
              <p className="text-xs text-[#A1A5BC]">
                Are you sure you want to delete{' '}
                <strong className="text-white">"{expenseToDelete.item}"</strong> ({formatINR(expenseToDelete.amountPaise)})?
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setExpenseToDelete(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1 font-semibold"
                onClick={handleDeleteConfirm}
              >
                Delete
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Edit Modal */}
      {expenseToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <Card className="max-w-md w-full p-6 space-y-4 rounded-hero shadow-2xl bg-[#101120] border border-white/[0.08]">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-lg text-white">Edit Expense</h3>
              <button
                onClick={() => setExpenseToEdit(null)}
                className="p-1 rounded-lg text-[#737A95] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#A1A5BC] block mb-1">
                  Item Name
                </label>
                <Input
                  value={editItem}
                  onChange={(e) => setEditItem(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#A1A5BC] block mb-1">
                  Notes
                </label>
                <Input
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Optional notes"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setExpenseToEdit(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1 font-bold shadow-[0_8px_25px_-4px_rgba(49,91,255,0.5)]"
                onClick={handleEditSave}
              >
                Save Changes
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
