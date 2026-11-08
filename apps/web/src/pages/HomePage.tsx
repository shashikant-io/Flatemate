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
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFlat } from '@/context/FlatContext';
import { useAuth } from '@/context/AuthContext';
import { formatINR, formatSettlementMessage } from '@flatmate/shared';
import { cn } from '@/lib/utils';

export function HomePage() {
  const { currentMemberId, currentMonth, expenses, calculation } = useFlat();
  const { member: authMember } = useAuth();

  const activeViewer = authMember || currentMemberId;

  const memberNameMap: Record<string, string> = {
    shashikant: 'Shashikant',
    nitesh: 'Nitesh',
  };

  const shashikantPaid = calculation.paidPerMember['shashikant'] || 0;
  const niteshPaid = calculation.paidPerMember['nitesh'] || 0;
  const totalPaid = shashikantPaid + niteshPaid;

  const shashikantPct = totalPaid > 0 ? (shashikantPaid / totalPaid) * 100 : 50;
  const niteshPct = totalPaid > 0 ? (niteshPaid / totalPaid) * 100 : 50;

  // Settlement message
  let settlementMessage = 'All settled up!';
  if (calculation.settlementTransfers.length > 0) {
    const transfer = calculation.settlementTransfers[0];
    settlementMessage = formatSettlementMessage(
      transfer.from,
      transfer.to,
      transfer.amountPaise,
      activeViewer,
      memberNameMap
    );
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

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Month & Status Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-sage" />
            Billing Cycle
          </span>
          <h2 className="text-2xl md:text-3xl font-heading font-extrabold tracking-tight">
            November 2026
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={calculation.settled ? 'teal' : 'saffron'}
            className="px-3 py-1 text-xs"
          >
            {calculation.settled ? 'Settled' : 'Active Split'}
          </Badge>
        </div>
      </div>

      {/* Hero Balance Card - Forest Green Palette with Electric Josh */}
      <Card className="rounded-hero border-none bg-gradient-to-br from-[#051F20] via-[#0B2B26] to-[#163832] text-mint shadow-2xl overflow-hidden relative border border-[#235347]/40">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-amber-400/20 via-emerald-400/20 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-teal-500/15 rounded-full blur-2xl pointer-events-none" />

        <CardContent className="p-6 md:p-8 relative z-10 space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
              Live Net Balance
            </span>
            <span className="text-xs font-semibold text-mint/90 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10">
              50 / 50 Equal Split
            </span>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wider text-sage font-semibold mb-1">
              Net Position
            </div>
            <div className="text-2xl md:text-3xl font-heading font-black tracking-tight text-white flex items-center gap-2">
              <span
                className={cn(
                  'leading-tight',
                  settlementMessage.includes('owes you')
                    ? 'text-emerald-300 drop-shadow-[0_0_12px_rgba(52,211,153,0.4)]'
                    : settlementMessage.includes('You owe')
                    ? 'text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,0.4)]'
                    : 'text-white'
                )}
              >
                {settlementMessage}
              </span>
            </div>
            <p className="text-xs text-mint/80 mt-1.5">
              {calculation.settled
                ? 'All shared household expenses are balanced for this month.'
                : 'Based on total shared expenses and completed payments.'}
            </p>
          </div>

          {/* Contribution Progress Bar */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-teal-300">
                <span className="h-2.5 w-2.5 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.8)] inline-block"></span>
                Shashikant: {formatINR(shashikantPaid)} ({shashikantPct.toFixed(0)}%)
              </span>
              <span className="flex items-center gap-1.5 text-indigo-300">
                <span className="h-2.5 w-2.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)] inline-block"></span>
                Nitesh: {formatINR(niteshPaid)} ({niteshPct.toFixed(0)}%)
              </span>
            </div>

            <div className="h-3.5 w-full bg-[#051F20] rounded-full overflow-hidden flex border border-[#163832] p-0.5 shadow-inner">
              <div
                className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-l-full transition-all duration-500 shadow-teal-glow"
                style={{ width: `${shashikantPct}%` }}
              />
              <div
                className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full rounded-r-full transition-all duration-500 shadow-plum-glow"
                style={{ width: `${niteshPct}%` }}
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-3 pt-2">
            <Link to="/add" className="flex-1">
              <Button
                variant="saffron"
                className="w-full text-sm font-black shadow-josh h-12 border-0 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus className="h-4 w-4 mr-1.5 stroke-[3]" />
                Add Expense
              </Button>
            </Link>
            <Link to="/settle" className="flex-1">
              <Button
                variant="secondary"
                className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 text-sm font-bold h-12 backdrop-blur-md active:scale-[0.98]"
              >
                <ArrowRightLeft className="h-4 w-4 mr-1.5" />
                Settle Up
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="rounded-card p-4 space-y-1 bg-card shadow-card">
          <div className="text-xs text-muted-foreground font-medium flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5 text-sage" />
            Total Shared
          </div>
          <div className="text-2xl font-heading font-black text-foreground">
            {formatINR(calculation.totalPaise)}
          </div>
          <div className="text-[11px] text-muted-foreground">
            {currentMonthExpenses.length} transactions
          </div>
        </Card>

        <Card className="rounded-card p-4 space-y-1 bg-card shadow-card">
          <div className="text-xs text-muted-foreground font-medium flex items-center gap-1">
            <Users className="h-3.5 w-3.5 text-sage" />
            Equal Share
          </div>
          <div className="text-2xl font-heading font-black text-foreground">
            {formatINR(calculation.sharePerMember[activeViewer] || 0)}
          </div>
          <div className="text-[11px] text-muted-foreground">per person</div>
        </Card>
      </div>

      {/* Category Breakdown Card */}
      <Card className="rounded-card p-5 space-y-4 shadow-card">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold text-base text-foreground">
            Category Breakdown
          </h3>
          <span className="text-xs text-muted-foreground">This Month</span>
        </div>

        <div className="space-y-3">
          {Object.entries(calculation.categoryTotals)
            .filter(([_, paise]) => paise > 0)
            .map(([cat, paise]) => {
              const pct =
                calculation.totalPaise > 0
                  ? ((paise / calculation.totalPaise) * 100).toFixed(0)
                  : '0';
              return (
                <div key={cat} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <div className="flex items-center gap-2">
                      <CategoryIcon
                        category={cat as any}
                        size={14}
                        className="p-1 rounded-lg"
                      />
                      <span className="text-foreground">{cat}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-foreground">
                        {formatINR(paise)}
                      </span>
                      <span className="text-muted-foreground text-[11px]">({pct}%)</span>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal-500 via-emerald-500 to-amber-400 rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </Card>

      {/* 6-Month Real Data Trend Chart */}
      <Card className="rounded-card p-5 space-y-4 shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading font-bold text-base text-foreground">
              6-Month Spending Trend
            </h3>
            <span className="text-[11px] text-muted-foreground">
              Built from real purchase history
            </span>
          </div>
          <span className="text-xs font-mono font-semibold text-muted-foreground">
            Peak: {formatINR(maxHistoricalPaise)}
          </span>
        </div>

        <div className="pt-4 pb-1">
          <div className="grid grid-cols-6 gap-2 items-end h-32">
            {sixMonthsData.map((d) => {
              const heightPct = Math.max(
                Math.round((d.totalPaise / maxHistoricalPaise) * 100),
                8
              );

              return (
                <div key={d.monthKey} className="flex flex-col items-center h-full justify-end group">
                  <span className="text-[10px] font-mono font-semibold text-muted-foreground mb-1 group-hover:text-foreground transition-colors truncate max-w-full">
                    {d.totalPaise > 0
                      ? d.totalPaise >= 100000
                        ? `₹${(d.totalPaise / 100000).toFixed(1)}k`
                        : `₹${Math.round(d.totalPaise / 100)}`
                      : '₹0'}
                  </span>

                  <div className="w-full bg-muted/60 rounded-xl h-24 flex items-end p-1">
                    <div
                      className={cn(
                        'w-full rounded-lg transition-all duration-500',
                        d.isCurrent
                          ? 'bg-gradient-to-t from-amber-500 via-amber-400 to-yellow-300 shadow-josh'
                          : d.totalPaise > 0
                          ? 'bg-forest-700/80 group-hover:bg-forest-700'
                          : 'bg-muted-foreground/20'
                      )}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>

                  <span
                    className={cn(
                      'text-[11px] mt-2 font-medium',
                      d.isCurrent ? 'font-black text-amber-600 dark:text-amber-400' : 'text-muted-foreground'
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
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold text-lg text-foreground">Recent Expenses</h3>
          <Link
            to="/history"
            className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
          >
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {recentExpenses.length === 0 ? (
          <Card className="p-8 text-center rounded-card border-dashed">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3">
              <Plus className="h-6 w-6 stroke-[2.5]" />
            </div>
            <h4 className="font-heading font-semibold text-base mb-1">
              No expenses recorded yet
            </h4>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto mb-4">
              Tap below to record groceries, milk, vegetables, or electricity.
            </p>
            <Link to="/add">
              <Button variant="saffron" size="sm" className="font-bold shadow-josh">
                Add first expense
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-2">
            {recentExpenses.map((exp) => (
              <Card
                key={exp.id}
                className="rounded-xl p-3.5 flex items-center justify-between hover:shadow-card-hover transition-all duration-150"
              >
                <div className="flex items-center gap-3">
                  <CategoryIcon category={exp.category} size={18} />
                  <div>
                    <h4 className="text-sm font-semibold text-foreground leading-snug line-clamp-1">
                      {exp.item}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <span>{exp.date}</span>
                      <span>•</span>
                      <span
                        className={cn(
                          'font-semibold',
                          exp.paidBy === 'shashikant'
                            ? 'text-teal-600 dark:text-teal-400'
                            : 'text-indigo-600 dark:text-indigo-400'
                        )}
                      >
                        {memberNameMap[exp.paidBy] || exp.paidBy} paid
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-heading font-bold text-base text-foreground block">
                    {formatINR(exp.amountPaise)}
                  </span>
                  <div className="flex items-center gap-1 justify-end mt-0.5">
                    {exp.hasPendingWrites && (
                      <Badge
                        variant="outline"
                        className="text-[9px] text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/10 px-1 py-0"
                      >
                        Pending sync
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
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
