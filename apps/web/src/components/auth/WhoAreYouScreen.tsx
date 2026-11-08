import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Shield, KeyRound, Check, AlertCircle, Eye, EyeOff, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

export function WhoAreYouScreen() {
  const { joinFlat, error, clearError } = useAuth();
  const [selectedMember, setSelectedMember] = useState<'shashikant' | 'nitesh'>('shashikant');
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) return;

    setIsSubmitting(true);
    await joinFlat(selectedMember, passcode);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-[#051F20] via-[#0B2B26] to-[#163832] relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 animate-scale-in relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-16 w-16 rounded-3xl bg-gradient-to-br from-[#051F20] via-[#0B2B26] to-[#163832] items-center justify-center text-amber-300 font-heading font-black text-2xl shadow-[0_0_25px_rgba(245,158,11,0.4)] mb-2 border border-amber-400/40">
            FM
          </div>
          <h1 className="text-3xl font-heading font-black tracking-tight text-white">
            Welcome to FlatMate
          </h1>
          <p className="text-sm text-mint/80 max-w-xs mx-auto">
            Shared expense manager for Shashikant & Nitesh.
          </p>
        </div>

        {/* Auth Card */}
        <Card className="rounded-hero border border-white/15 shadow-2xl bg-card/95 backdrop-blur-xl overflow-hidden">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl">Who are you?</CardTitle>
            <CardDescription>
              Select your identity and enter your secret flat passcode to link this device.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 p-6">
            {/* Member Selection Buttons */}
            <div className="grid grid-cols-2 gap-3">
              {/* Shashikant Option */}
              <button
                type="button"
                onClick={() => {
                  setSelectedMember('shashikant');
                  clearError();
                }}
                className={cn(
                  'relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-200 text-center select-none min-h-[120px]',
                  selectedMember === 'shashikant'
                    ? 'border-teal-500 bg-teal-500/15 shadow-teal-glow'
                    : 'border-border/80 bg-background/50 hover:bg-muted opacity-80'
                )}
              >
                {selectedMember === 'shashikant' && (
                  <span className="absolute top-2 right-2 h-5 w-5 rounded-full bg-teal-500 text-white flex items-center justify-center shadow-sm">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </span>
                )}
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-400 text-white flex items-center justify-center font-heading font-black text-xl mb-2 shadow-md">
                  S
                </div>
                <span className="font-heading font-bold text-sm text-foreground">
                  Shashikant
                </span>
                <span className="text-[11px] text-muted-foreground mt-0.5">Flatmate</span>
              </button>

              {/* Nitesh Option */}
              <button
                type="button"
                onClick={() => {
                  setSelectedMember('nitesh');
                  clearError();
                }}
                className={cn(
                  'relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-200 text-center select-none min-h-[120px]',
                  selectedMember === 'nitesh'
                    ? 'border-indigo-500 bg-indigo-500/15 shadow-plum-glow'
                    : 'border-border/80 bg-background/50 hover:bg-muted opacity-80'
                )}
              >
                {selectedMember === 'nitesh' && (
                  <span className="absolute top-2 right-2 h-5 w-5 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-sm">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </span>
                )}
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white flex items-center justify-center font-heading font-black text-xl mb-2 shadow-md">
                  N
                </div>
                <span className="font-heading font-bold text-sm text-foreground">
                  Nitesh
                </span>
                <span className="text-[11px] text-muted-foreground mt-0.5">Flatmate</span>
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs animate-shake">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <div className="flex-1 leading-snug">{error}</div>
              </div>
            )}

            {/* Passcode Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="flat-passcode"
                  className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5"
                >
                  <KeyRound className="h-3.5 w-3.5" />
                  Flat Passcode
                </label>
                <div className="relative">
                  <Input
                    id="flat-passcode"
                    type={showPasscode ? 'text' : 'password'}
                    placeholder="Enter secret passcode"
                    value={passcode}
                    onChange={(e) => {
                      setPasscode(e.target.value);
                      if (error) clearError();
                    }}
                    className="pr-12 text-center text-lg font-mono tracking-widest"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasscode(!showPasscode)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 min-h-[32px] min-w-[32px] flex items-center justify-center"
                    aria-label="Toggle password visibility"
                  >
                    {showPasscode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground text-center">
                  Protected with SHA-256 hash & rate limiting.
                </p>
              </div>

              <Button
                type="submit"
                variant="saffron"
                size="huge"
                className="w-full font-black shadow-josh hover:scale-[1.01] active:scale-[0.98]"
                disabled={isSubmitting || !passcode.trim()}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-slate-900 border-t-transparent animate-spin" />
                    Authenticating...
                  </span>
                ) : (
                  <span>Access Flat</span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Security badge note */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Shield className="h-3.5 w-3.5 text-emerald-500" />
          <span>Device is paired anonymously. No password or email needed.</span>
        </div>
      </div>
    </div>
  );
}

