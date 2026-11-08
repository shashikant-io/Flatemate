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

  const firstMember = members[0] || { id: 'member-a', name: 'Member 1' };
  const secondMember = members[1] || { id: 'member-b', name: 'Member 2' };
  const firstMemberPaid = activeCalc.paidPerMember[firstMember.id] || 0;
  const secondMemberPaid = activeCalc.paidPerMember[secondMember.id] || 0;

  return (
    <div className="space-y-6 animate-fade-in pb-16 print:p-0">
      {/* Header & Controls (Inspired by Reference Image 3 Top Bar) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-[#737A95]">
            <span>Audit & Intelligence</span>
            <span>•</span>
            <span className="text-[#A1A5BC]">Monthly Financial Statement</span>
          </div>
          <h2 className="text-2xl font-heading font-extrabold tracking-tight text-white mt-0.5">
            Financial Reports
          </h2>
        </div>

        {/* Month Selector Pill */}
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

      {/* Action Buttons (Hidden on Print) */}
      <div className="flex flex-wrap gap-2.5 print:hidden">
        <Button
          variant="primary"
          size="sm"
          className="text-xs font-bold shadow-[0_4px_16px_rgba(49,91,255,0.4)]"
          onClick={handleDownloadCSV}
        >
          <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" />
          Export CSV (Protected)
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="text-xs font-medium bg-[#15182B] text-white border border-white/[0.08]"
          onClick={handlePrintPDF}
        >
          <Printer className="h-3.5 w-3.5 mr-1.5 text-[#477BFF]" />
          Print / PDF Export
        </Button>

        {!isClosed ? (
          <Button
            variant="outline"
            size="sm"
            className="text-xs font-medium border-white/[0.08] text-[#A1A5BC] hover:text-white"
            onClick={() => setShowCloseModal(true)}
          >
            <Lock className="h-3.5 w-3.5 mr-1.5" />
            Close Month
          </Button>
        ) : (
          <Badge variant="success" className="h-9 px-3 text-xs gap-1.5">
            <Lock className="h-3 w-3" />
            Month Closed & Locked
          </Badge>
        )}
      </div>

      {/* Closed Month Status Notice */}
      {isClosed && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-[#FFBD59]/10 border border-[#FFBD59]/25 text-[#FFBD59] text-xs">
          <Lock className="h-4 w-4 shrink-0" />
          <div className="flex-1">
            This month is closed. All transactions are permanently locked and cannot be edited or deleted.
          </div>
        </div>
      )}

      {closeSuccess && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-[#25D6B0]/10 border border-[#25D6B0]/25 text-[#25D6B0] text-xs font-semibold">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <div>Month {selectedMonth} closed successfully. Immutable snapshot saved.</div>
        </div>
      )}

      {/* Summary KPI Cards (Reference Image 3 Grid Style) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 rounded-2xl bg-[#101120] border border-white/[0.08] shadow-card space-y-1">
          <span className="text-[10px] text-[#737A95] uppercase font-bold tracking-wider">
            Total Shared
          </span>
          <div className="text-xl md:text-2xl font-heading font-black text-white">
            {formatINR(activeCalc.totalPaise)}
          </div>
          <span className="text-[10px] text-[#A1A5BC]">Verified expenses</span>
        </Card>

        <Card className="p-4 rounded-2xl bg-[#101120] border border-white/[0.08] shadow-card space-y-1">
          <span className="text-[10px] text-[#737A95] uppercase font-bold tracking-wider">
            Equal Share (50%)
          </span>
          <div className="text-xl md:text-2xl font-heading font-black text-white">
            {formatINR(activeCalc.sharePerMember[firstMember.id] || 0)}
          </div>
          <span className="text-[10px] text-[#A1A5BC]">Per flatmate</span>
        </Card>

        <Card className="p-4 rounded-2xl bg-[#15182B] border border-white/[0.08] shadow-card space-y-1">
          <span className="text-[10px] text-[#25D6B0] uppercase font-bold tracking-wider flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#25D6B0]" />
            {firstMember.name} Paid
          </span>
          <div className="text-xl md:text-2xl font-heading font-black text-[#25D6B0]">
            {formatINR(firstMemberPaid)}
          </div>
          <span className="text-[10px] text-[#A1A5BC] font-mono">
            Net: {formatINR(activeCalc.remainingBalance[firstMember.id] || 0, { showSign: true })}
          </span>
        </Card>

        <Card className="p-4 rounded-2xl bg-[#15182B] border border-white/[0.08] shadow-card space-y-1">
          <span className="text-[10px] text-[#818CF8] uppercase font-bold tracking-wider flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#818CF8]" />
            {secondMember.name} Paid
          </span>
          <div className="text-xl md:text-2xl font-heading font-black text-[#818CF8]">
            {formatINR(secondMemberPaid)}
          </div>
          <span className="text-[10px] text-[#A1A5BC] font-mono">
            Net: {formatINR(activeCalc.remainingBalance[secondMember.id] || 0, { showSign: true })}
          </span>
        </Card>
      </div>

      {/* Head-to-Head & AI Insights Row (Reference Image 3 Signature Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Head-to-Head Comparison Card */}
        <Card className="rounded-card p-5 bg-[#101120] border border-white/[0.08] shadow-card md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-base text-white">
              Flatmate Contribution Comparison
            </h3>
            <span className="text-xs text-[#737A95] font-mono">Earning vs Spending</span>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-[#25D6B0] flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#25D6B0]" />
                {firstMember.name}: {formatINR(firstMemberPaid)}
              </span>
              <span className="text-[#818CF8] flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#818CF8]" />
                {secondMember.name}: {formatINR(secondMemberPaid)}
              </span>
            </div>

            <div className="h-3.5 w-full bg-[#15182B] rounded-full overflow-hidden flex border border-white/[0.08] p-0.5">
              <div
                className="bg-gradient-to-r from-teal-500 to-emerald-500 h-full rounded-l-full transition-all duration-300 shadow-[0_0_8px_rgba(37,214,176,0.5)]"
                style={{
                  width: `${
                    activeCalc.totalPaise > 0
                      ? (firstMemberPaid / activeCalc.totalPaise) * 100
                      : 50
                  }%`,
                }}
              />
              <div
                className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full rounded-r-full transition-all duration-300 shadow-[0_0_8px_rgba(129,140,248,0.5)]"
                style={{
                  width: `${
                    activeCalc.totalPaise > 0
                      ? (secondMemberPaid / activeCalc.totalPaise) * 100
                      : 50
                  }%`,
                }}
              />
            </div>

            <div className="p-3.5 rounded-xl bg-[#15182B] border border-white/[0.08] text-xs text-[#A1A5BC] leading-relaxed">
              {activeCalc.settled
                ? `All ${members.map((member) => member.name).join(' and ')} debts are settled for this cycle.`
                : activeCalc.settlementTransfers.length > 0
                ? `${
                    members.find((member) => member.id === activeCalc.settlementTransfers[0].from)?.name ||
                    activeCalc.settlementTransfers[0].from
                  } needs to pay ${formatINR(
                    activeCalc.settlementTransfers[0].amountPaise
                  )} to ${
                    members.find((member) => member.id === activeCalc.settlementTransfers[0].to)?.name ||
                    activeCalc.settlementTransfers[0].to
                  } to be fully squared up.`
                : 'All settled up!'}
            </div>
          </div>
        </Card>

        {/* AI Insights Card (Inspired by Reference Image 3) */}
        <Card className="rounded-card p-5 bg-[#101120] border border-white/[0.08] shadow-card relative overflow-hidden flex flex-col justify-between">
          <div className="absolute inset-0 opacity-15 pointer-events-none" style={{ backgroundImage: 'radial-gradient(rgba(71, 123, 255, 0.4) 1px, transparent 1px)', backgroundSize: '14px 14px' }} />

          <div className="relative z-10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-lg bg-[#315BFF]/15 text-[#477BFF] font-bold text-[10px] uppercase tracking-wider border border-[#315BFF]/30 flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" />
                Audit Insights
              </span>
              <span className="h-2 w-2 rounded-full bg-[#25D6B0] shadow-[0_0_6px_#25D6B0]" />
            </div>

            <h4 className="font-heading font-bold text-sm text-white leading-snug">
              Monthly Spend Summary
            </h4>
            <p className="text-xs text-[#A1A5BC] leading-relaxed">
              {activeCalc.totalPaise > 0
                ? `Total household purchases recorded stand at ${formatINR(activeCalc.totalPaise)}. Split equally, each flatmate owes ${formatINR(activeCalc.sharePerMember[firstMember.id] || 0)}.`
                : 'No transactions recorded yet for this billing cycle.'}
            </p>
          </div>

          <div className="relative z-10 pt-4 border-t border-white/[0.08] flex items-center justify-between text-[11px] text-[#737A95]">
            <span>Deterministic Engine</span>
            <span className="text-[#477BFF] font-mono">0.00 Float Error</span>
          </div>
        </Card>
      </div>

      {/* Category Spending Table */}
      <Card className="rounded-card p-5 bg-[#101120] border border-white/[0.08] shadow-card space-y-4">
        <h3 className="font-heading font-bold text-base text-white">
          Category-Wise Spending
        </h3>

        <div className="divide-y divide-white/[0.06] text-xs">
          {Object.entries(activeCalc.categoryTotals).map(([cat, paise]) => {
            const pct =
              activeCalc.totalPaise > 0
                ? ((paise / activeCalc.totalPaise) * 100).toFixed(1)
                : '0.0';
            return (
              <div key={cat} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CategoryIcon category={cat as any} size={15} className="p-1 rounded-lg bg-[#15182B]" />
                  <span className="font-medium text-white">{cat}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[#737A95] font-mono text-[11px]">{pct}%</span>
                  <span className="font-mono font-bold text-white">
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
        <Card className="rounded-card p-5 bg-[#101120] border border-white/[0.08] shadow-card space-y-3">
          <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
            <Package className="h-4 w-4 text-[#477BFF]" />
            Most Purchased Household Items
          </h3>

          <div className="space-y-2">
            {activeCalc.mostPurchasedItems.slice(0, 5).map((item, idx) => (
              <div
                key={item.item}
                className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-[#15182B] border border-white/[0.06]"
              >
                <div className="flex items-center gap-2.5">
                  <span className="h-5 w-5 rounded-md bg-[#315BFF]/15 text-[#477BFF] font-bold flex items-center justify-center text-[10px]">
                    0{idx + 1}
                  </span>
                  <span className="capitalize font-semibold text-white">
                    {item.item}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#737A95]">
                    {item.count} purchase{item.count > 1 ? 's' : ''}
                  </span>
                  <span className="font-mono font-bold text-white">{formatINR(item.totalPaise)}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Close Month Modal */}
      {showCloseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in print:hidden">
          <Card className="max-w-md w-full p-6 space-y-4 rounded-hero shadow-2xl bg-[#101120] border border-white/[0.08]">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-[#FFBD59]/15 text-[#FFBD59] flex items-center justify-center border border-[#FFBD59]/25">
              <Lock className="h-6 w-6" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="font-heading font-bold text-xl text-white">
                Close Month {selectedMonth}?
              </h3>
              <p className="text-xs text-[#A1A5BC] leading-relaxed">
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
                variant="primary"
                className="flex-1 font-bold shadow-[0_8px_25px_-4px_rgba(49,91,255,0.5)]"
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
