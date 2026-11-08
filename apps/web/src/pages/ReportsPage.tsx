import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CategoryIcon } from '@/components/common/CategoryIcon';
import {
  Download,
  FileSpreadsheet,
  Lock,
  Printer,
  Calendar,
  Sparkles,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Package,
} from 'lucide-react';
import { useFlat } from '@/context/FlatContext';
import { useAuth } from '@/context/AuthContext';
import {
  formatINR,
  paiseToRupees,
  generateMonthCSV,
  calculateMonth,
} from '@flatmate/shared';
import { cn } from '@/lib/utils';

export function ReportsPage() {
  const {
    currentMonth,
    setCurrentMonth,
    members,
    expenses,
    settlements,
    calculation,
    isMonthClosed,
    closeMonth,
  } = useFlat();

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [closeSuccess, setCloseSuccess] = useState(false);

  const isClosed = isMonthClosed(selectedMonth);

  // Re-calculate for selected month if different from current
  const activeCalc =
    selectedMonth === currentMonth
      ? calculation
      : calculateMonth(expenses, settlements, selectedMonth, members);

  // CSV Export
  const handleDownloadCSV = () => {
    const csvContent = generateMonthCSV(activeCalc, expenses, settlements, members);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `flatmate-report-${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Browser Print / PDF Export
  const handlePrintPDF = () => {
    window.print();
  };

  // Close Month Action
  const handleCloseMonthConfirm = async () => {
    setIsClosing(true);
    closeMonth(selectedMonth);
    setIsClosing(false);
    setShowCloseModal(false);
    setCloseSuccess(true);
    setTimeout(() => setCloseSuccess(false), 3000);
  };

  const shashikantPaid = activeCalc.paidPerMember['shashikant'] || 0;
  const niteshPaid = activeCalc.paidPerMember['nitesh'] || 0;

  return (
    <div className="space-y-6 animate-fade-in pb-16 print:p-0">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading font-extrabold tracking-tight">
            Monthly Reports
          </h2>
          <p className="text-xs text-muted-foreground">
            Audit-ready statement, analytics, and exports
          </p>
        </div>

        {/* Month Selector */}
        <div className="flex items-center gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="h-11 px-3 rounded-xl border border-border bg-card text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-saffron"
          >
            <option value="2026-11">November 2026</option>
            <option value="2026-10">October 2026 (Closed)</option>
          </select>
        </div>
      </div>

      {/* Action Buttons (Hidden on Print) */}
      <div className="flex flex-wrap gap-2 print:hidden">
        <Button
          variant="saffron"
          size="sm"
          className="text-xs font-bold shadow-josh"
          onClick={handleDownloadCSV}
        >
          <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" />
          Download CSV
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-xs font-medium"
          onClick={handlePrintPDF}
        >
          <Printer className="h-3.5 w-3.5 mr-1.5" />
          Print / PDF Export
        </Button>

        {!isClosed ? (
          <Button
            variant="secondary"
            size="sm"
            className="text-xs font-medium bg-card border"
            onClick={() => setShowCloseModal(true)}
          >
            <Lock className="h-3.5 w-3.5 mr-1.5" />
            Close Month
          </Button>
        ) : (
          <Badge variant="teal" className="h-9 px-3 text-xs gap-1">
            <Lock className="h-3 w-3" />
            Month Closed & Locked
          </Badge>
        )}
      </div>

      {/* Closed Month Status Notice */}
      {isClosed && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-300 text-xs">
          <Lock className="h-4 w-4 shrink-0" />
          <div className="flex-1">
            This month is closed. All transactions are permanently locked and cannot be edited or deleted.
          </div>
        </div>
      )}

      {closeSuccess && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 text-xs font-semibold">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <div>Month {selectedMonth} closed successfully. Immutable snapshot saved.</div>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4 rounded-card space-y-1">
          <span className="text-[11px] text-muted-foreground uppercase font-semibold">
            Total Shared
          </span>
          <div className="text-xl font-heading font-black text-foreground">
            {formatINR(activeCalc.totalPaise)}
          </div>
          <span className="text-[10px] text-muted-foreground">Household purchases</span>
        </Card>

        <Card className="p-4 rounded-card space-y-1">
          <span className="text-[11px] text-muted-foreground uppercase font-semibold">
            Equal Share
          </span>
          <div className="text-xl font-heading font-black text-foreground">
            {formatINR(activeCalc.sharePerMember['shashikant'] || 0)}
          </div>
          <span className="text-[10px] text-muted-foreground">Per flatmate (50%)</span>
        </Card>

        <Card className="p-4 rounded-card space-y-1 bg-teal-500/5 border border-teal-500/20">
          <span className="text-[11px] text-teal-600 dark:text-teal-400 uppercase font-bold">
            Shashikant Paid
          </span>
          <div className="text-xl font-heading font-black text-teal-600 dark:text-teal-400">
            {formatINR(shashikantPaid)}
          </div>
          <span className="text-[10px] text-muted-foreground">
            Net:{' '}
            {formatINR(activeCalc.remainingBalance['shashikant'] || 0, {
              showSign: true,
            })}
          </span>
        </Card>

        <Card className="p-4 rounded-card space-y-1 bg-indigo-500/5 border border-indigo-500/20">
          <span className="text-[11px] text-indigo-600 dark:text-indigo-400 uppercase font-bold">
            Nitesh Paid
          </span>
          <div className="text-xl font-heading font-black text-indigo-600 dark:text-indigo-400">
            {formatINR(niteshPaid)}
          </div>
          <span className="text-[10px] text-muted-foreground">
            Net:{' '}
            {formatINR(activeCalc.remainingBalance['nitesh'] || 0, {
              showSign: true,
            })}
          </span>
        </Card>
      </div>

      {/* Head-to-Head Comparison Card */}
      <Card className="rounded-card p-5 space-y-4 shadow-card">
        <h3 className="font-heading font-bold text-base text-foreground">
          Flatmate Contribution Comparison
        </h3>

        <div className="space-y-3">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-teal-400 inline-block" />
              Shashikant ({formatINR(shashikantPaid)})
            </span>
            <span className="text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-indigo-400 inline-block" />
              Nitesh ({formatINR(niteshPaid)})
            </span>
          </div>

          <div className="h-4 w-full bg-muted rounded-full overflow-hidden flex border p-0.5">
            <div
              className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-l-full transition-all duration-300 shadow-teal-glow"
              style={{
                width: `${
                  activeCalc.totalPaise > 0
                    ? (shashikantPaid / activeCalc.totalPaise) * 100
                    : 50
                }%`,
              }}
            />
            <div
              className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full rounded-r-full transition-all duration-300 shadow-plum-glow"
              style={{
                width: `${
                  activeCalc.totalPaise > 0
                    ? (niteshPaid / activeCalc.totalPaise) * 100
                    : 50
                }%`,
              }}
            />
          </div>

          <div className="p-3 rounded-xl bg-muted/60 text-xs text-muted-foreground leading-relaxed">
            {activeCalc.settled
              ? 'Both Shashikant and Nitesh have settled all debts for this cycle.'
              : activeCalc.settlementTransfers.length > 0
              ? `${
                  activeCalc.settlementTransfers[0].from === 'shashikant'
                    ? 'Shashikant'
                    : 'Nitesh'
                } needs to pay ${formatINR(
                  activeCalc.settlementTransfers[0].amountPaise
                )} to ${
                  activeCalc.settlementTransfers[0].to === 'shashikant'
                    ? 'Shashikant'
                    : 'Nitesh'
                } to be fully squared up.`
              : 'All settled up!'}
          </div>
        </div>
      </Card>

      {/* Category Spending Table */}
      <Card className="rounded-card p-5 space-y-4 shadow-card">
        <h3 className="font-heading font-bold text-base text-foreground">
          Category-Wise Spending
        </h3>

        <div className="divide-y divide-border text-xs">
          {Object.entries(activeCalc.categoryTotals).map(([cat, paise]) => {
            const pct =
              activeCalc.totalPaise > 0
                ? ((paise / activeCalc.totalPaise) * 100).toFixed(1)
                : '0.0';
            return (
              <div key={cat} className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CategoryIcon category={cat as any} size={14} className="p-1" />
                  <span className="font-medium text-foreground">{cat}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground">{pct}%</span>
                  <span className="font-mono font-bold text-foreground">
                    {formatINR(paise)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Most Purchased Items */}
      {activeCalc.mostPurchasedItems.length > 0 && (
        <Card className="rounded-card p-5 space-y-3 shadow-card">
          <h3 className="font-heading font-bold text-base text-foreground flex items-center gap-2">
            <Package className="h-4 w-4 text-saffron" />
            Most Purchased Household Items
          </h3>

          <div className="space-y-2">
            {activeCalc.mostPurchasedItems.slice(0, 5).map((item, idx) => (
              <div
                key={item.item}
                className="flex items-center justify-between text-xs p-2 rounded-lg bg-muted/40"
              >
                <div className="flex items-center gap-2">
                  <span className="h-5 w-5 rounded-md bg-muted text-muted-foreground font-bold flex items-center justify-center text-[10px]">
                    #{idx + 1}
                  </span>
                  <span className="capitalize font-semibold text-foreground">
                    {item.item}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">
                    {item.count} purchase{item.count > 1 ? 's' : ''}
                  </span>
                  <span className="font-mono font-bold">{formatINR(item.totalPaise)}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Close Month Modal */}
      {showCloseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in print:hidden">
          <Card className="max-w-md w-full p-6 space-y-4 rounded-hero shadow-2xl">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Lock className="h-6 w-6" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="font-heading font-bold text-xl">
                Close Month {selectedMonth}?
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Closing this month will compute a permanent statement snapshot. Once closed,
                expenses and settlements in this month cannot be edited, added, or deleted.
                Transactions will never be deleted.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowCloseModal(false)}
                disabled={isClosing}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                className="flex-1 font-bold bg-forest-700 text-mint hover:bg-forest-800"
                onClick={handleCloseMonthConfirm}
                disabled={isClosing}
              >
                {isClosing ? 'Closing...' : 'Confirm & Lock'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
