import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, KeyRound, Check, AlertCircle, Eye, EyeOff, Lock, Sparkles } from 'lucide-react';
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#080914] relative overflow-hidden font-sans">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#315BFF]/12 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-[#1745D1]/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-10 right-10 w-72 h-72 bg-[#25D6B0]/10 rounded-full blur-[90px] pointer-events-none" />

      {/* Decorative Grid Accent */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="w-full max-w-md space-y-6 animate-scale-in relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-16 w-16 rounded-3xl bg-gradient-to-br from-[#1745D1] to-[#4169FF] items-center justify-center text-white font-heading font-black text-2xl shadow-[0_0_30px_rgba(49,91,255,0.45)] mb-2 border border-white/20">
            FM
          </div>
          <h1 className="text-3xl font-heading font-extrabold tracking-tight text-white">
            Welcome to FlatMate
          </h1>
          <p className="text-xs text-[#A1A5BC] max-w-xs mx-auto">
            High-precision shared expense engine for Shashikant & Nitesh.
          </p>
        </div>

        {/* Auth Card */}
        <Card className="rounded-3xl border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.6)] bg-[#101120] backdrop-blur-xl overflow-hidden">
          <CardHeader className="text-center pb-2 pt-6">
            <CardTitle className="text-xl font-heading font-bold text-white">
              Who are you?
            </CardTitle>
            <CardDescription className="text-xs text-[#737A95] max-w-xs mx-auto">
              Select your profile and enter your flat passcode to link this device.
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
                  'relative flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-200 text-center select-none min-h-[124px]',
                  selectedMember === 'shashikant'
                    ? 'border-[#25D6B0] bg-[#25D6B0]/10 shadow-[0_0_20px_rgba(37,214,176,0.25)]'
                    : 'border-white/[0.06] bg-[#15182B]/60 hover:bg-[#15182B] opacity-75'
                )}
              >
                {selectedMember === 'shashikant' && (
                  <span className="absolute top-2.5 right-2.5 h-5 w-5 rounded-full bg-[#25D6B0] text-[#080914] flex items-center justify-center shadow-sm">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </span>
                )}
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#25D6B0] to-[#0D9488] text-white flex items-center justify-center font-heading font-black text-xl mb-2 shadow-[0_0_15px_rgba(37,214,176,0.3)]">
                  S
                </div>
                <span className="font-heading font-bold text-sm text-white">
                  Shashikant
                </span>
                <span className="text-[11px] text-[#25D6B0] mt-0.5 font-medium">Flatmate</span>
              </button>

              {/* Nitesh Option */}
              <button
                type="button"
                onClick={() => {
                  setSelectedMember('nitesh');
                  clearError();
                }}
                className={cn(
                  'relative flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-200 text-center select-none min-h-[124px]',
                  selectedMember === 'nitesh'
                    ? 'border-[#818CF8] bg-[#818CF8]/10 shadow-[0_0_20px_rgba(129,140,248,0.25)]'
                    : 'border-white/[0.06] bg-[#15182B]/60 hover:bg-[#15182B] opacity-75'
                )}
              >
                {selectedMember === 'nitesh' && (
                  <span className="absolute top-2.5 right-2.5 h-5 w-5 rounded-full bg-[#818CF8] text-white flex items-center justify-center shadow-sm">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </span>
                )}
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#818CF8] to-[#4F46E5] text-white flex items-center justify-center font-heading font-black text-xl mb-2 shadow-[0_0_15px_rgba(129,140,248,0.3)]">
                  N
                </div>
                <span className="font-heading font-bold text-sm text-white">
                  Nitesh
                </span>
                <span className="text-[11px] text-[#818CF8] mt-0.5 font-medium">Flatmate</span>
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs animate-shake">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <div className="flex-1 leading-snug">{error}</div>
              </div>
            )}

            {/* Passcode Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="flat-passcode"
                  className="text-xs font-semibold text-[#A1A5BC] flex items-center gap-1.5"
                >
                  <KeyRound className="h-3.5 w-3.5 text-[#477BFF]" />
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
                    className="pr-12 text-center text-lg font-mono tracking-widest bg-[#15182B] border-white/[0.08] text-white focus:border-[#315BFF] focus:ring-[#315BFF]/30 h-12"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasscode(!showPasscode)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737A95] hover:text-white p-1 min-h-[32px] min-w-[32px] flex items-center justify-center transition-colors"
                    aria-label="Toggle password visibility"
                  >
                    {showPasscode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-[#737A95] text-center flex items-center justify-center gap-1 pt-1">
                  <Lock className="h-3 w-3 text-[#25D6B0]" />
                  SHA-256 verification & 5-attempt rate limit.
                </p>
              </div>

              <Button
                type="submit"
                size="huge"
                className="w-full bg-gradient-to-r from-[#1745D1] to-[#4169FF] text-white font-bold h-12 shadow-[0_0_25px_rgba(49,91,255,0.4)] hover:brightness-110 active:scale-[0.99] transition-all rounded-xl"
                disabled={isSubmitting || !passcode.trim()}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
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
        <div className="flex items-center justify-center gap-2 text-xs text-[#737A95]">
          <Shield className="h-3.5 w-3.5 text-[#25D6B0]" />
          <span>Device linked anonymously via Firebase Auth & Custom Claims</span>
        </div>
      </div>
    </div>
  );
}
