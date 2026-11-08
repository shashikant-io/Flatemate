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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-heading font-extrabold tracking-tight">
            Expense History
          </h2>
          <p className="text-xs text-muted-foreground">
            Search, filter, and review all purchases
          </p>
        </div>

        {/* Month Selector */}
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="h-10 px-3 rounded-xl border border-border bg-card text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-saffron"
        >
          <option value="2026-11">November 2026</option>
          <option value="2026-10">October 2026 (Closed)</option>
        </select>
      </div>

      {/* Closed Month Read-only Alert */}
      {isClosed && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-300 text-xs">
          <Lock className="h-4 w-4 shrink-0" />
          <div className="flex-1">
            <strong>Closed Month:</strong> Statements for {selectedMonth} have been closed
            and are permanently read-only.
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search purchases (rice, milk, bills...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
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
                ? 'border-forest-600 bg-forest-600/15 text-forest-700 dark:text-sage font-bold'
                : 'border-border bg-card hover:bg-muted text-muted-foreground'
            )}
            aria-label="Filter expenses"
          >
            <Filter className="h-4 w-4" />
          </button>
        </div>

        {/* Collapsible Filter Bar */}
        {showFilters && (
          <Card className="rounded-2xl p-4 space-y-3 bg-muted/40 border-border animate-slide-up">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span>Filters</span>
              <button
                onClick={() => {
                  setFilterMember('all');
                  setFilterCategory('all');
                  setFilterType('all');
                }}
                className="text-forest-700 dark:text-sage hover:underline"
              >
                Reset all
              </button>
            </div>

            {/* Payer Filter */}
            <div className="space-y-1">
              <span className="text-[11px] font-medium text-muted-foreground">Payer</span>
              <div className="flex gap-1.5">
                {(['all', 'shashikant', 'nitesh'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setFilterMember(m)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs capitalize transition-colors',
                      filterMember === m
                        ? 'bg-primary text-primary-foreground font-semibold'
                        : 'bg-card border border-border/70 text-muted-foreground'
                    )}
                  >
                    {m === 'all' ? 'Everyone' : m}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div className="space-y-1">
              <span className="text-[11px] font-medium text-muted-foreground">Category</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setFilterCategory('all')}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs transition-colors',
                    filterCategory === 'all'
                      ? 'bg-primary text-primary-foreground font-semibold'
                      : 'bg-card border border-border/70 text-muted-foreground'
                  )}
                >
                  All
                </button>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-xs transition-colors',
                      filterCategory === cat
                        ? 'bg-primary text-primary-foreground font-semibold'
                        : 'bg-card border border-border/70 text-muted-foreground'
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
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span>Showing {filteredExpenses.length} transactions</span>
        <span>
          Total: {formatINR(filteredExpenses.reduce((acc, e) => acc + e.amountPaise, 0))}
        </span>
      </div>

      {/* Expense List */}
      {filteredExpenses.length === 0 ? (
        <Card className="p-8 text-center rounded-card border-dashed">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground mb-3">
            <Receipt className="h-6 w-6" />
          </div>
          <h4 className="font-heading font-semibold text-base mb-1">
            No transactions match criteria
          </h4>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto">
            Try adjusting your search terms or filters above.
          </p>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {filteredExpenses.map((exp) => (
            <Card
              key={exp.id}
              className="rounded-2xl p-4 flex items-center justify-between hover:shadow-card-hover transition-all bg-card"
            >
              <div className="flex items-center gap-3.5">
                {exp.imagePath ? (
                  <div className="h-12 w-12 rounded-xl overflow-hidden border border-border shrink-0">
                    <img
                      src={exp.imagePath}
                      alt={exp.item}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <CategoryIcon category={exp.category} size={20} className="p-2.5" />
                )}

                <div>
                  <h4 className="text-sm font-bold text-foreground leading-snug">
                    {exp.item}
                  </h4>
                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                    <span>{exp.date}</span>
                    <span>•</span>
                    <span
                      className={
                        exp.paidBy === 'shashikant'
                          ? 'text-teal-600 dark:text-teal-400 font-bold'
                          : 'text-indigo-600 dark:text-indigo-400 font-bold'
                      }
                    >
                      {exp.paidBy === 'shashikant' ? 'Shashikant' : 'Nitesh'}
                    </span>
                    {exp.quantity && (
                      <>
                        <span>•</span>
                        <span className="bg-muted px-1.5 py-0.2 rounded text-[11px]">
                          {exp.quantity}
                        </span>
                      </>
                    )}
                  </div>
                  {exp.notes && (
                    <p className="text-[11px] text-muted-foreground/80 mt-1 italic">
                      "{exp.notes}"
                    </p>
                  )}
                </div>
              </div>

              {/* Amount & Actions */}
              <div className="flex flex-col items-end gap-1.5">
                <span className="font-heading font-black text-base text-foreground">
                  {formatINR(exp.amountPaise)}
                </span>

                <div className="flex items-center gap-1">
                  {exp.hasPendingWrites && (
                    <Badge
                      variant="outline"
                      className="text-[9px] text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/10"
                    >
                      Pending sync
                    </Badge>
                  )}
                  <Badge
                    variant={exp.type === 'shared' ? 'saffron' : 'secondary'}
                    className="text-[10px] px-1.5 py-0"
                  >
                    {exp.type}
                  </Badge>

                  {/* Actions (disabled if month is closed) */}
                  {!isClosed && (
                    <>
                      <button
                        onClick={() => handleEditOpen(exp)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        aria-label="Edit expense"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setExpenseToDelete(exp)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        aria-label="Delete expense"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {expenseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <Card className="max-w-sm w-full p-6 space-y-4 rounded-hero shadow-2xl">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-heading font-bold text-lg">Delete Expense?</h3>
              <p className="text-xs text-muted-foreground">
                Are you sure you want to delete{' '}
                <strong>"{expenseToDelete.item}"</strong> ({formatINR(expenseToDelete.amountPaise)})?
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <Card className="max-w-md w-full p-6 space-y-4 rounded-hero shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-lg">Edit Expense</h3>
              <button
                onClick={() => setExpenseToEdit(null)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Item Name
                </label>
                <Input
                  value={editItem}
                  onChange={(e) => setEditItem(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
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
                variant="default"
                className="flex-1 font-bold bg-forest-700 text-mint hover:bg-forest-800"
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
