import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRightLeft,
  CheckCircle2,
  Clock,
  Send,
  Calendar,
  FileText,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useFlat } from '@/context/FlatContext';
import { useAuth } from '@/context/AuthContext';
import {
  formatINR,
  rupeesToPaise,
  paiseToRupees,
  formatSettlementMessage,
} from '@flatmate/shared';
import { cn } from '@/lib/utils';

export function SettleUpPage() {
  const {
    currentMemberId,
    currentMonth,
    calculation,
    settlements,
    addSettlement,
    markSettlementCompleted,
  } = useFlat();
  const { member: authMember } = useAuth();

  const activeViewer = (authMember || currentMemberId) as 'shashikant' | 'nitesh';

  // Find who owes whom from calculation
  const primaryTransfer = calculation.settlementTransfers[0] || null;

  const defaultFrom = primaryTransfer ? primaryTransfer.from : 'nitesh';
  const defaultTo = primaryTransfer ? primaryTransfer.to : 'shashikant';
  const defaultAmount = primaryTransfer ? paiseToRupees(primaryTransfer.amountPaise) : '';

  const [fromMember, setFromMember] = useState<string>(defaultFrom);
  const [toMember, setToMember] = useState<string>(defaultTo);
  const [amountStr, setAmountStr] = useState<string>(defaultAmount);
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState<string>('UPI Transfer (GPay / PhonePe)');
  const [status, setStatus] = useState<'completed' | 'pending'>('completed');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // Quick fill remaining balance
  const handleQuickFill = () => {
    if (primaryTransfer) {
      setFromMember(primaryTransfer.from);
      setToMember(primaryTransfer.to);
      setAmountStr(paiseToRupees(primaryTransfer.amountPaise));
    }
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let amountPaise = 0;
    try {
      amountPaise = rupeesToPaise(amountStr);
    } catch {
      setError('Please enter a valid rupee amount (e.g. 500.00)');
      return;
    }

    if (amountPaise <= 0) {
      setError('Amount must be greater than zero.');
      return;
    }

    if (fromMember === toMember) {
      setError('Payer and receiver cannot be the same person.');
      return;
    }

    addSettlement({
      from: fromMember,
      to: toMember,
      amountPaise,
      date,
      forMonth: currentMonth,
      status,
      notes: notes.trim() || undefined,
    });

    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  // Filter settlements for this month
  const monthSettlements = settlements.filter(
    (s) => !s.deletedAt && s.forMonth === currentMonth
  );

  return (
    <div className="space-y-6 animate-fade-in max-w-lg mx-auto pb-12">
      <div>
        <h2 className="text-2xl font-heading font-extrabold tracking-tight">
          Settle Up
        </h2>
        <p className="text-xs text-muted-foreground">
          Clear balances between Shashikant & Nitesh
        </p>
      </div>

      {/* Hero Settlement Status Card */}
      <Card className="rounded-hero p-6 bg-gradient-to-br from-card via-card to-muted/50 border shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase font-semibold tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-saffron" />
            Current Net Balance
          </span>
          <Badge variant={calculation.settled ? 'teal' : 'saffron'}>
            {calculation.settled ? 'All Settled' : 'Payment Due'}
          </Badge>
        </div>

        {calculation.settled ? (
          <div className="text-center py-4 space-y-2">
            <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 stroke-[2.5]" />
            </div>
            <h3 className="font-heading font-extrabold text-2xl text-foreground">
              All Even!
            </h3>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              No outstanding balance for {currentMonth}. Everyone has contributed their equal share.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground block font-medium">
                  Recommended Transfer:
                </span>
                <span className="font-heading font-black text-xl text-foreground">
                  {primaryTransfer
                    ? `${primaryTransfer.from === 'shashikant' ? 'Shashikant' : 'Nitesh'} owes ${
                        primaryTransfer.to === 'shashikant' ? 'Shashikant' : 'Nitesh'
                      } ${formatINR(primaryTransfer.amountPaise)}`
                    : 'Balances even'}
                </span>
              </div>
              <Button
                variant="saffron"
                size="sm"
                onClick={handleQuickFill}
                className="text-xs font-black shadow-sm"
              >
                Auto-fill
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs pt-1">
              <div className="p-3 rounded-xl bg-teal-500/5 border border-teal-500/20">
                <span className="text-muted-foreground block font-medium">Shashikant Remaining:</span>
                <span
                  className={cn(
                    'font-mono font-black text-sm',
                    calculation.remainingBalance['shashikant'] > 0
                      ? 'text-teal-600 dark:text-teal-400'
                      : calculation.remainingBalance['shashikant'] < 0
                      ? 'text-destructive'
                      : 'text-foreground'
                  )}
                >
                  {formatINR(calculation.remainingBalance['shashikant'] || 0, { showSign: true })}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/20">
                <span className="text-muted-foreground block font-medium">Nitesh Remaining:</span>
                <span
                  className={cn(
                    'font-mono font-black text-sm',
                    calculation.remainingBalance['nitesh'] > 0
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : calculation.remainingBalance['nitesh'] < 0
                      ? 'text-destructive'
                      : 'text-foreground'
                  )}
                >
                  {formatINR(calculation.remainingBalance['nitesh'] || 0, { showSign: true })}
                </span>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Record Payment Form */}
      <Card className="rounded-card p-5 space-y-4 shadow-card">
        <h3 className="font-heading font-bold text-base text-foreground flex items-center gap-2">
          <ArrowRightLeft className="h-4 w-4 text-saffron" />
          Record a Payment
        </h3>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-xs">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 text-emerald-600 text-xs font-semibold">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>Payment successfully recorded!</span>
          </div>
        )}

        <form onSubmit={handleRecordPayment} className="space-y-4">
          {/* Payer and Receiver */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground block">
                Sender (Paid by)
              </label>
              <select
                value={fromMember}
                onChange={(e) => setFromMember(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-input bg-card text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-saffron"
              >
                <option value="shashikant">Shashikant</option>
                <option value="nitesh">Nitesh</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground block">
                Receiver (Paid to)
              </label>
              <select
                value={toMember}
                onChange={(e) => setToMember(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-input bg-card text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-saffron"
              >
                <option value="shashikant">Shashikant</option>
                <option value="nitesh">Nitesh</option>
              </select>
            </div>
          </div>

          {/* Amount in Rupees */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground block">
              Amount Paid (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-saffron font-bold text-lg">
                ₹
              </span>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className="pl-8 text-base font-mono font-bold"
                required
              />
            </div>
          </div>

          {/* Date & Notes */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Date
              </label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="text-xs font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <FileText className="h-3 w-3" />
                Payment Note
              </label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. GPay UPI"
                className="text-xs"
              />
            </div>
          </div>

          {/* Payment Status Segmented Control */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground block">
              Payment Status
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-xl">
              <button
                type="button"
                onClick={() => setStatus('completed')}
                className={cn(
                  'py-2 rounded-lg text-xs font-semibold transition-all min-h-[40px]',
                  status === 'completed'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Completed (Applies Now)
              </button>
              <button
                type="button"
                onClick={() => setStatus('pending')}
                className={cn(
                  'py-2 rounded-lg text-xs font-semibold transition-all min-h-[40px]',
                  status === 'pending'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Pending (Awaiting Confirmation)
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Only completed payments alter the calculated balance.
            </p>
          </div>

          <Button
            type="submit"
            variant="saffron"
            size="huge"
            className="w-full font-black shadow-josh hover:scale-[1.01] active:scale-[0.98]"
          >
            Record Payment
          </Button>
        </form>
      </Card>

      {/* Payment History List */}
      <div className="space-y-3">
        <h3 className="font-heading font-bold text-base text-foreground">
          Settlement History ({monthSettlements.length})
        </h3>

        {monthSettlements.length === 0 ? (
          <Card className="p-6 text-center rounded-card border-dashed">
            <p className="text-xs text-muted-foreground">
              No payments recorded for this month yet.
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {monthSettlements.map((set) => (
              <Card
                key={set.id}
                className="rounded-xl p-3.5 flex items-center justify-between bg-card"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'p-2.5 rounded-xl border',
                      set.status === 'completed'
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                    )}
                  >
                    {set.status === 'completed' ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <Clock className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">
                      {set.from === 'shashikant' ? 'Shashikant' : 'Nitesh'} paid{' '}
                      {set.to === 'shashikant' ? 'Shashikant' : 'Nitesh'}
                    </h4>
                    <span className="text-[11px] text-muted-foreground block">
                      {set.date} • {set.notes || 'No note'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-heading font-black text-sm text-foreground block">
                    {formatINR(set.amountPaise)}
                  </span>
                  {set.status === 'pending' ? (
                    <button
                      onClick={() => markSettlementCompleted(set.id)}
                      className="text-[10px] text-amber-600 font-bold hover:underline"
                    >
                      Mark Completed
                    </button>
                  ) : (
                    <Badge variant="teal" className="text-[9px] px-1.5 py-0">
                      Completed
                    </Badge>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
