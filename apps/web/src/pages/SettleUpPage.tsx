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
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-[#737A95]">
          <span>Debt Clearance</span>
          <span>•</span>
          <span className="text-[#A1A5BC]">Peer-to-Peer</span>
        </div>
        <h2 className="text-2xl font-heading font-extrabold tracking-tight text-white mt-0.5">
          Settle Up
        </h2>
        <p className="text-xs text-[#737A95]">
          Clear balances between Shashikant & Nitesh
        </p>
      </div>

      {/* Hero Settlement Status Card */}
      <Card className="rounded-hero p-6 bg-[#101120] border border-white/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.45)] space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-[#315BFF]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between">
          <span className="text-xs uppercase font-bold tracking-wider text-[#A1A5BC] flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-[#477BFF]" />
            Current Net Balance
          </span>
          <Badge variant={calculation.settled ? 'success' : 'blue'}>
            {calculation.settled ? 'All Settled' : 'Payment Due'}
          </Badge>
        </div>

        {calculation.settled ? (
          <div className="text-center py-4 space-y-2">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-[#25D6B0]/15 text-[#25D6B0] flex items-center justify-center border border-[#25D6B0]/30 shadow-[0_0_20px_rgba(37,214,176,0.3)]">
              <CheckCircle2 className="h-6 w-6 stroke-[2.5]" />
            </div>
            <h3 className="font-heading font-extrabold text-2xl text-white">
              All Even!
            </h3>
            <p className="text-xs text-[#737A95] max-w-xs mx-auto">
              No outstanding balance for {currentMonth}. Everyone has contributed their equal share.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-[#15182B] border border-white/[0.08] flex items-center justify-between">
              <div>
                <span className="text-xs text-[#737A95] block font-medium">
                  Recommended Transfer:
                </span>
                <span className="font-heading font-black text-xl text-white">
                  {primaryTransfer
                    ? `${primaryTransfer.from === 'shashikant' ? 'Shashikant' : 'Nitesh'} owes ${
                        primaryTransfer.to === 'shashikant' ? 'Shashikant' : 'Nitesh'
                      } ${formatINR(primaryTransfer.amountPaise)}`
                    : 'Balances even'}
                </span>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={handleQuickFill}
                className="text-xs font-bold shadow-[0_4px_16px_rgba(49,91,255,0.4)]"
              >
                Auto-fill
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs pt-1">
              <div className="p-3.5 rounded-xl bg-[#15182B] border border-white/[0.08]">
                <span className="text-[#737A95] block font-medium">Shashikant Remaining:</span>
                <span
                  className={cn(
                    'font-mono font-black text-sm block mt-0.5',
                    calculation.remainingBalance['shashikant'] > 0
                      ? 'text-[#25D6B0]'
                      : calculation.remainingBalance['shashikant'] < 0
                      ? 'text-destructive'
                      : 'text-white'
                  )}
                >
                  {formatINR(calculation.remainingBalance['shashikant'] || 0, { showSign: true })}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#15182B] border border-white/[0.08]">
                <span className="text-[#737A95] block font-medium">Nitesh Remaining:</span>
                <span
                  className={cn(
                    'font-mono font-black text-sm block mt-0.5',
                    calculation.remainingBalance['nitesh'] > 0
                      ? 'text-[#818CF8]'
                      : calculation.remainingBalance['nitesh'] < 0
                      ? 'text-destructive'
                      : 'text-white'
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
      <Card className="rounded-card p-5 space-y-4 bg-[#101120] border border-white/[0.08] shadow-card">
        <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
          <ArrowRightLeft className="h-4 w-4 text-[#477BFF]" />
          Record a Payment
        </h3>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-xs border border-destructive/20">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-[#25D6B0]/10 text-[#25D6B0] text-xs font-semibold border border-[#25D6B0]/20">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>Payment successfully recorded!</span>
          </div>
        )}

        <form onSubmit={handleRecordPayment} className="space-y-4">
          {/* Payer and Receiver */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#A1A5BC] block">
                Sender (Paid by)
              </label>
              <select
                value={fromMember}
                onChange={(e) => setFromMember(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-white/[0.08] bg-[#15182B] text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#315BFF] transition-all"
              >
                <option value="shashikant">Shashikant</option>
                <option value="nitesh">Nitesh</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#A1A5BC] block">
                Receiver (Paid to)
              </label>
              <select
                value={toMember}
                onChange={(e) => setToMember(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-white/[0.08] bg-[#15182B] text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#315BFF] transition-all"
              >
                <option value="shashikant">Shashikant</option>
                <option value="nitesh">Nitesh</option>
              </select>
            </div>
          </div>

          {/* Amount in Rupees */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#A1A5BC] block">
              Amount Paid (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#477BFF] font-bold text-lg">
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
              <label className="text-xs font-semibold text-[#A1A5BC] flex items-center gap-1">
                <Calendar className="h-3 w-3 text-[#477BFF]" />
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
              <label className="text-xs font-semibold text-[#A1A5BC] flex items-center gap-1">
                <FileText className="h-3 w-3 text-[#477BFF]" />
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
            <label className="text-xs font-semibold text-[#A1A5BC] block">
              Payment Status
            </label>
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#15182B] rounded-2xl border border-white/[0.08]">
              <button
                type="button"
                onClick={() => setStatus('completed')}
                className={cn(
                  'py-2 rounded-xl text-xs font-bold transition-all min-h-[40px]',
                  status === 'completed'
                    ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 shadow-[0_4px_16px_rgba(37,214,176,0.35)]'
                    : 'text-[#737A95] hover:text-white'
                )}
              >
                Completed (Applies Now)
              </button>
              <button
                type="button"
                onClick={() => setStatus('pending')}
                className={cn(
                  'py-2 rounded-xl text-xs font-bold transition-all min-h-[40px]',
                  status === 'pending'
                    ? 'bg-[#FFBD59]/15 text-[#FFBD59] border border-[#FFBD59]/30 shadow-sm'
                    : 'text-[#737A95] hover:text-white'
                )}
              >
                Pending (Awaiting Confirmation)
              </button>
            </div>
            <p className="text-[11px] text-[#737A95]">
              Only completed payments alter the calculated balance.
            </p>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="huge"
            className="w-full font-black shadow-[0_8px_30px_rgba(49,91,255,0.55)] bg-gradient-to-r from-[#1745D1] to-[#4169FF] text-white hover:brightness-110 active:scale-[0.98] border border-blue-400/30"
          >
            Record Payment
          </Button>
        </form>
      </Card>

      {/* Payment History List */}
      <div className="space-y-3">
        <h3 className="font-heading font-bold text-base text-white">
          Settlement History ({monthSettlements.length})
        </h3>

        {monthSettlements.length === 0 ? (
          <Card className="p-6 text-center rounded-card border-dashed bg-[#101120] border-white/[0.08]">
            <p className="text-xs text-[#737A95]">
              No payments recorded for this month yet.
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {monthSettlements.map((set) => (
              <Card
                key={set.id}
                className="rounded-2xl p-4 flex items-center justify-between bg-[#101120] border border-white/[0.08] hover:border-[#477BFF]/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'p-2.5 rounded-xl border',
                      set.status === 'completed'
                        ? 'bg-[#25D6B0]/10 text-[#25D6B0] border-[#25D6B0]/25'
                        : 'bg-[#FFBD59]/10 text-[#FFBD59] border-[#FFBD59]/25'
                    )}
                  >
                    {set.status === 'completed' ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Clock className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">
                      <span className="capitalize">{set.from}</span> paid{' '}
                      <span className="capitalize">{set.to}</span>
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-[#737A95] mt-0.5">
                      <span>{set.date}</span>
                      {set.notes && (
                        <>
                          <span>•</span>
                          <span>{set.notes}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-heading font-bold text-base text-white block">
                    {formatINR(set.amountPaise)}
                  </span>
                  <Badge
                    variant={set.status === 'completed' ? 'success' : 'warning'}
                    className="text-[10px] capitalize px-2 py-0 mt-0.5"
                  >
                    {set.status}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

