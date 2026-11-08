import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CategoryIcon } from '@/components/common/CategoryIcon';
import {
  ArrowRight,
  Plus,
  Sparkles,
  TrendingUp,
  Users,
  ArrowRightLeft,
  Calendar,
  ArrowUpRight,
  Receipt,
  CheckCircle2,
  PieChart,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFlat } from '@/context/FlatContext';
import { useAuth } from '@/context/AuthContext';
import { formatINR, formatSettlementMessage } from '@flatmate/shared';
import { cn } from '@/lib/utils';

export function HomePage() {
  const { currentMemberId, currentMonth, expenses, calculation, members } = useFlat();
  const { member: authMember } = useAuth();

  const activeViewer = authMember || currentMemberId;

  const memberNameMap = Object.fromEntries(members.map((member) => [member.id, member.name]));
  const firstMember = members[0] || { id: 'legacy-a', name: 'Member 1' };
  const secondMember = members[1] || { id: 'legacy-b', name: 'Member 2' };

  const firstMemberPaid = calculation.paidPerMember[firstMember.id] || 0;
  const secondMemberPaid = calculation.paidPerMember[secondMember.id] || 0;
  const totalPaid = firstMemberPaid + secondMemberPaid;

  const firstMemberPct = totalPaid > 0 ? (firstMemberPaid / totalPaid) * 100 : 50;
  const secondMemberPct = totalPaid > 0 ? (secondMemberPaid / totalPaid) * 100 : 50;

  // Settlement message
  let settlementMessage = 'All settled up!';
  let owesOrOwed = 0;
  let isViewerOwed = false;
  let isViewerOwing = false;

  if (calculation.settlementTransfers.length > 0) {
    const transfer = calculation.settlementTransfers[0];
    settlementMessage = formatSettlementMessage(
      transfer.from,
      transfer.to,
      transfer.amountPaise,
      activeViewer,
      memberNameMap
    );
    owesOrOwed = transfer.amountPaise;
    if (transfer.to === activeViewer) isViewerOwed = true;
    if (transfer.from === activeViewer) isViewerOwing = true;
  }

  // Filter current month non-deleted expenses for recent feed
  const currentMonthExpenses = expenses.filter(
    (e) => !e.deletedAt && e.date.startsWith(`${currentMonth}-`)
  );
  const recentExpenses = currentMonthExpenses.slice(0, 5);

  // Compute last 6 months trend strictly from real data
  const sixMonthsData = useMemo(() => {
    const list: Array<{
      monthKey: string;
      label: string;
      totalPaise: number;
      isCurrent: boolean;
    }> = [];
    const baseDate = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(baseDate.getFullYear(), baseDate.getMonth() - i, 1);
      const year = d.getFullYear();
      const monthNum = String(d.getMonth() + 1).padStart(2, '0');
      const monthKey = `${year}-${monthNum}`;
      const label = d.toLocaleDateString('en-US', { month: 'short' });

      const monthTotal = expenses
        .filter(
          (e) => !e.deletedAt && e.type === 'shared' && e.date.startsWith(`${monthKey}-`)
        )
        .reduce((sum, e) => sum + e.amountPaise, 0);

      list.push({
        monthKey,
        label,
        totalPaise: monthTotal,
        isCurrent: monthKey === currentMonth,
      });
    }

    return list;
  }, [expenses, currentMonth]);

  const maxHistoricalPaise = useMemo(() => {
    const max = Math.max(...sixMonthsData.map((d) => d.totalPaise), 0);
    return max > 0 ? max : 1;
  }, [sixMonthsData]);

  // Sorted category breakdown
  const sortedCategories = useMemo(() => {
    return Object.entries(calculation.categoryTotals)
      .filter(([_, paise]) => paise > 0)
      .sort((a, b) => b[1] - a[1]);
  }, [calculation.categoryTotals]);

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Top Breadcrumb & Status Pill */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-[#737A95]">
            <Calendar className="h-3.5 w-3.5 text-[#477BFF]" />
            <span>Active Cycle</span>
            <span>•</span>
            <span className="text-[#A1A5BC]">November 2026</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-heading font-extrabold tracking-tight text-white mt-0.5">
            Finance Overview
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant={calculation.settled ? 'success' : 'blue'}
            className="px-3 py-1 text-xs font-semibold gap-1.5"
          >
            <span className={cn('h-1.5 w-1.5 rounded-full', calculation.settled ? 'bg-[#25D6B0]' : 'bg-[#477BFF] animate-pulse')} />
            {calculation.settled ? 'All Settled' : 'Active Split'}
          </Badge>

          <Link to="/reports">
            <button className="p-2 rounded-xl bg-[#101120] hover:bg-[#15182B] border border-white/[0.08] text-[#A1A5BC] hover:text-white transition-colors" title="View Full Report">
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </Link>
        </div>
      </div>

      {/* Hero: Balance Overview Card (Inspired by Reference Image 1) */}
      <Card className="rounded-hero bg-[#101120] border border-white/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.45)] relative overflow-hidden group">
        {/* Subtle Ambient Glow in background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#315BFF]/15 via-[#1745D1]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <CardContent className="p-6 md:p-8 relative z-10 space-y-6">
          {/* Card Top Title Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#A1A5BC]">
                Balance Overview
              </span>
            </div>
            <Link to="/settle">
              <div className="h-8 w-8 rounded-xl bg-[#15182B] border border-white/[0.08] flex items-center justify-center text-[#737A95] group-hover:text-white transition-colors">
                <ArrowUpRight className="h-4 w-4" />
              </div>
            </Link>
          </div>

          {/* Amount & Status Badges */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-3xl md:text-5xl font-heading font-extrabold tracking-tight text-white">
                {formatINR(calculation.totalPaise)}
              </span>

              {isViewerOwed && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#25D6B0]/10 border border-[#25D6B0]/25 text-[#25D6B0] text-xs font-bold">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>+{formatINR(owesOrOwed)} to receive</span>
                </div>
              )}

              {isViewerOwing && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFBD59]/10 border border-[#FFBD59]/25 text-[#FFBD59] text-xs font-bold">
                  <span>Pay {formatINR(owesOrOwed)}</span>
                </div>
              )}

              {calculation.settled && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#25D6B0]/10 border border-[#25D6B0]/25 text-[#25D6B0] text-xs font-bold">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Balanced</span>
                </div>
              )}
            </div>

            {/* Meta Row: Transaction count & Categories */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-[#15182B] text-[#A1A5BC] border border-white/[0.08] flex items-center gap-1.5">
                <Receipt className="h-3.5 w-3.5 text-[#477BFF]" />
                <span>{currentMonthExpenses.length} transactions</span>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#15182B] text-[#A1A5BC] border border-white/[0.08]">
                {sortedCategories.length} categories active
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#15182B] text-[#A1A5BC] border border-white/[0.08]">
                50 / 50 Equal Split
              </span>
            </div>
          </div>

          {/* Glowing Wave Chart Section (Reference Image 1 Signature) */}
          <div className="relative pt-3 pb-1">
            <div className="h-28 w-full relative">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 600 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="blueWaveGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#477BFF" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#1745D1" stopOpacity="0.0" />
                  </linearGradient>
                  <filter id="glowWave" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                {/* Area Gradient Fill */}
                <path
                  d="M0,80 Q75,30 150,55 T300,45 T450,25 T600,65 L600,100 L0,100 Z"
                  fill="url(#blueWaveGrad)"
                />
                {/* Glowing Blue Stroke */}
                <path
                  d="M0,80 Q75,30 150,55 T300,45 T450,25 T600,65"
                  fill="none"
                  stroke="#477BFF"
                  strokeWidth="3"
                  filter="url(#glowWave)"
                />
                {/* Floating Highlight Dot */}
                <circle cx="450" cy="25" r="5" fill="#FFFFFF" stroke="#315BFF" strokeWidth="3" />
              </svg>

              {/* Floating Tooltip Pill (like +$320 in reference image 1) */}
              <div className="absolute right-[22%] top-0 -translate-y-2 px-2.5 py-1 rounded-lg bg-[#15182B] border border-[#477BFF]/40 text-white font-mono font-bold text-[11px] shadow-[0_0_15px_rgba(49,91,255,0.4)] flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#25D6B0]" />
                <span>{settlementMessage}</span>
              </div>
            </div>

            {/* Timeline X-Axis Labels */}
            <div className="flex justify-between text-[11px] font-mono text-[#737A95] pt-2 px-1">
              <span>Nov 1</span>
              <span>Nov 7</span>
              <span>Nov 14</span>
              <span>Nov 21</span>
              <span>Nov 28</span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link to="/add" className="flex-1">
              <Button
                variant="primary"
                size="lg"
                className="w-full text-sm font-bold shadow-[0_8px_25px_-4px_rgba(49,91,255,0.5)] bg-gradient-to-r from-[#1745D1] to-[#4169FF] text-white hover:brightness-110 active:scale-[0.98] border border-blue-400/25 h-12"
              >
                <Plus className="h-4 w-4 mr-1.5 stroke-[2.75]" />
                Record New Expense
              </Button>
            </Link>
            <Link to="/settle" className="flex-1">
              <Button
                variant="secondary"
                size="lg"
                className="w-full bg-[#15182B] hover:bg-[#1A1E35] text-white border border-white/[0.08] text-sm font-semibold h-12"
              >
                <ArrowRightLeft className="h-4 w-4 mr-1.5 text-[#477BFF]" />
                Settle Up Balances
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* 2-Column Analytics Section (Circular Split Meter & Stats) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Earnings / Split Donut Card (Inspired by Reference Image 1) */}
        <Card className="rounded-card p-5 bg-[#101120] border border-white/[0.08] shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#A1A5BC]">
              Flatmate Split Ratio
            </span>
            <span className="text-xs text-[#737A95] font-mono">50% Target</span>
          </div>

          {/* Circular Progress Arc Visual */}
          <div className="relative flex flex-col items-center justify-center my-4">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Track */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#15182B"
                  strokeWidth="10"
                  fill="transparent"
                />
                {/* Primary member contribution arc */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#25D6B0"
                  strokeWidth="10"
                  strokeDasharray={`${firstMemberPct * 2.51} 251`}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-heading font-black text-white">
                  {firstMemberPct.toFixed(0)}%
                </span>
                <span className="text-[10px] uppercase font-bold text-[#737A95] tracking-wider">
                  {firstMember.name}
                </span>
              </div>
            </div>
          </div>

          {/* Legend Row */}
          <div className="space-y-2 pt-2 border-t border-white/[0.08]">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-[#A1A5BC]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#25D6B0] shadow-[0_0_8px_#25D6B0]" />
                {firstMember.name}
              </span>
              <span className="font-mono font-bold text-white">
                {formatINR(firstMemberPaid)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-[#A1A5BC]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#818CF8] shadow-[0_0_8px_#818CF8]" />
                {secondMember.name}
              </span>
              <span className="font-mono font-bold text-white">
                {formatINR(secondMemberPaid)}
              </span>
            </div>
          </div>
        </Card>

        {/* Breakdown of Categories (Inspired by Income Sources Breakdown in Reference Image 1) */}
        <Card className="rounded-card p-5 bg-[#101120] border border-white/[0.08] shadow-card md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-base text-white">
                Category Spending Breakdown
              </h3>
              <p className="text-xs text-[#737A95]">Ranked household purchase categories</p>
            </div>
            <Link to="/reports">
              <div className="h-8 w-8 rounded-xl bg-[#15182B] border border-white/[0.08] flex items-center justify-center text-[#737A95] hover:text-white transition-colors">
                <ArrowUpRight className="h-4 w-4" />
              </div>
            </Link>
          </div>

          <div className="space-y-3">
            {sortedCategories.length === 0 ? (
              <p className="text-xs text-[#737A95] py-4 text-center">
                No categorized expenses recorded for this billing cycle.
              </p>
            ) : (
              sortedCategories.slice(0, 5).map(([cat, paise], idx) => {
                const pct =
                  calculation.totalPaise > 0
                    ? ((paise / calculation.totalPaise) * 100).toFixed(0)
                    : '0';

                return (
                  <div key={cat} className="space-y-1.5 group">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[11px] text-[#737A95] w-5">
                          0{idx + 1}
                        </span>
                        <CategoryIcon category={cat as any} size={15} className="p-1 rounded-lg bg-[#15182B]" />
                        <span className="text-white font-medium">{cat}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white">
                          {formatINR(paise)}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-[#315BFF]/15 text-[#477BFF] font-mono text-[10px] font-bold border border-[#315BFF]/30">
                          {pct}%
                        </span>
                      </div>
                    </div>

                    <div className="h-1.5 w-full bg-[#15182B] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#1745D1] to-[#4169FF] rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(49,91,255,0.4)]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>

      {/* 6-Month Real Data Trend Chart (Inspired by Monthly Income Overview in Reference Image 1) */}
      <Card className="rounded-card p-6 bg-[#101120] border border-white/[0.08] shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading font-bold text-base text-white">
              Monthly Expense Overview
            </h3>
            <span className="text-xs text-[#737A95]">
              Real 6-month historical billing trend
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-[#737A95] block">
              Peak Month
            </span>
            <span className="text-xs font-mono font-bold text-[#477BFF]">
              {formatINR(maxHistoricalPaise)}
            </span>
          </div>
        </div>

        <div className="pt-4 pb-2">
          <div className="grid grid-cols-6 gap-3 items-end h-36">
            {sixMonthsData.map((d) => {
              const heightPct = Math.max(
                Math.round((d.totalPaise / maxHistoricalPaise) * 100),
                8
              );

              return (
                <div key={d.monthKey} className="flex flex-col items-center h-full justify-end group">
                  <span className="text-[10px] font-mono font-semibold text-[#737A95] mb-2 group-hover:text-white transition-colors truncate max-w-full">
                    {d.totalPaise > 0
                      ? d.totalPaise >= 100000
                        ? `₹${(d.totalPaise / 100000).toFixed(1)}k`
                        : `₹${Math.round(d.totalPaise / 100)}`
                      : '₹0'}
                  </span>

                  <div className="w-full bg-[#15182B] rounded-2xl h-28 flex items-end p-1 border border-white/[0.04]">
                    <div
                      className={cn(
                        'w-full rounded-xl transition-all duration-500',
                        d.isCurrent
                          ? 'bg-gradient-to-t from-[#1745D1] to-[#4169FF] shadow-[0_0_20px_rgba(49,91,255,0.6)] border border-blue-400/40'
                          : d.totalPaise > 0
                          ? 'bg-gradient-to-t from-[#1A1F3B] to-[#252C52] group-hover:from-[#1745D1]/60 group-hover:to-[#4169FF]/60'
                          : 'bg-white/[0.02]'
                      )}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>

                  <span
                    className={cn(
                      'text-xs mt-2.5 font-medium',
                      d.isCurrent ? 'font-bold text-[#477BFF]' : 'text-[#737A95]'
                    )}
                  >
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Recent Transactions List */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold text-lg text-white">Recent Purchases</h3>
          <Link
            to="/history"
            className="text-xs font-semibold text-[#477BFF] hover:text-[#7098FF] flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {recentExpenses.length === 0 ? (
          <Card className="p-8 text-center rounded-card border-dashed bg-[#101120] border-white/[0.08]">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-[#15182B] text-[#477BFF] flex items-center justify-center mb-3">
              <Plus className="h-6 w-6 stroke-[2.5]" />
            </div>
            <h4 className="font-heading font-semibold text-base mb-1 text-white">
              No expenses recorded yet
            </h4>
            <p className="text-xs text-[#737A95] max-w-xs mx-auto mb-4">
              Tap below to record groceries, milk, vegetables, or electricity.
            </p>
            <Link to="/add">
              <Button variant="primary" size="sm" className="font-bold">
                Add first expense
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recentExpenses.map((exp) => (
              <Card
                key={exp.id}
                className="rounded-2xl p-4 flex items-center justify-between bg-[#101120] border border-white/[0.08] hover:border-[#477BFF]/30 hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-all group"
              >
                <div className="flex items-center gap-3.5">
                  <CategoryIcon category={exp.category} size={18} className="p-2.5 rounded-xl bg-[#15182B]" />
                  <div>
                    <h4 className="text-sm font-semibold text-white leading-snug line-clamp-1">
                      {exp.item}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-[#737A95] mt-1">
                      <span>{exp.date}</span>
                      <span>•</span>
                      <span
                        className={cn(
                          'font-semibold text-[11px] px-2 py-0.2 rounded-md',
                          exp.paidBy === firstMember.id
                            ? 'bg-[#25D6B0]/10 text-[#25D6B0]'
                            : 'bg-[#818CF8]/10 text-[#818CF8]'
                        )}
                      >
                        {memberNameMap[exp.paidBy] || exp.paidBy} paid
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-heading font-bold text-base text-white block">
                    {formatINR(exp.amountPaise)}
                  </span>
                  <div className="flex items-center gap-1.5 justify-end mt-1">
                    {exp.hasPendingWrites && (
                      <Badge variant="warning" className="text-[9px] px-1.5 py-0">
                        Pending sync
                      </Badge>
                    )}
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      {exp.type}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
