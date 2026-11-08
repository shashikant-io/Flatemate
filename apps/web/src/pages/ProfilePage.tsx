import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useFlat } from '@/context/FlatContext';
import {
  Sun,
  Moon,
  Laptop,
  LogOut,
  RefreshCw,
  Shield,
  KeyRound,
  AlertTriangle,
  X,
  Lock,
  Smartphone,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function ProfilePage() {
  const { theme, setTheme } = useTheme();
  const { member: authMember, switchMember, forgetDevice } = useAuth();
  const { currentMemberId, flatName } = useFlat();

  const activeMember = authMember || currentMemberId;

  // Switch member modal state
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [targetMember, setTargetMember] = useState<'shashikant' | 'nitesh'>(
    activeMember === 'shashikant' ? 'nitesh' : 'shashikant'
  );
  const [switchPasscode, setSwitchPasscode] = useState('');
  const [switchError, setSwitchError] = useState<string | null>(null);
  const [isSwitching, setIsSwitching] = useState(false);

  // Forget device confirmation modal
  const [showForgetModal, setShowForgetModal] = useState(false);

  const handleSwitchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSwitchError(null);
    setIsSwitching(true);

    const success = await switchMember(targetMember, switchPasscode);
    setIsSwitching(false);

    if (success) {
      setShowSwitchModal(false);
      setSwitchPasscode('');
    } else {
      setSwitchError('Incorrect flat passcode.');
    }
  };

  const handleForgetConfirm = async () => {
    await forgetDevice();
    setShowForgetModal(false);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-lg mx-auto pb-16">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-heading font-extrabold tracking-tight text-white">
          Profile & Security
        </h2>
        <p className="text-xs text-[#737A95] mt-0.5">
          Device pairing, flatmate identity, and app preferences
        </p>
      </div>

      {/* Active Member Identity Card */}
      <Card className="rounded-2xl p-5 space-y-4 bg-[#101120] border-white/[0.08] shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
        <div className="flex items-center space-x-4">
          <div
            className={cn(
              'h-14 w-14 rounded-2xl flex items-center justify-center font-heading font-black text-2xl text-white relative shadow-lg',
              activeMember === 'shashikant'
                ? 'bg-gradient-to-br from-[#25D6B0] to-[#0D9488] shadow-[0_0_20px_rgba(37,214,176,0.35)]'
                : 'bg-gradient-to-br from-[#818CF8] to-[#4F46E5] shadow-[0_0_20px_rgba(129,140,248,0.35)]'
            )}
          >
            {activeMember === 'shashikant' ? 'S' : 'N'}
            <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-[#25D6B0] border-2 border-[#101120] flex items-center justify-center">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
            </span>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-bold text-lg capitalize text-white">
                {activeMember}
              </h3>
              <Badge variant={activeMember === 'shashikant' ? 'teal' : 'plum'}>
                Active Device
              </Badge>
            </div>
            <p className="text-xs text-[#A1A5BC] mt-0.5 flex items-center gap-1.5">
              <Smartphone className="h-3 w-3 text-[#737A95]" />
              {flatName || 'Shashikant & Nitesh Flat'}
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-white/[0.06] flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs min-h-[40px] bg-[#15182B] border-white/[0.08] text-white hover:bg-[#1f233f] hover:border-white/20 transition-all"
            onClick={() => {
              setTargetMember(activeMember === 'shashikant' ? 'nitesh' : 'shashikant');
              setShowSwitchModal(true);
            }}
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5 text-[#477BFF]" />
            Switch Member
          </Button>

          <Button
            variant="destructive"
            size="sm"
            className="text-xs min-h-[40px] bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 transition-all"
            onClick={() => setShowForgetModal(true)}
          >
            <LogOut className="h-3.5 w-3.5 mr-1.5" />
            Forget Device
          </Button>
        </div>
      </Card>

      {/* Theme Preference Card */}
      <Card className="rounded-2xl p-5 space-y-3 bg-[#101120] border-white/[0.08] shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-semibold text-sm text-white">
            Appearance
          </h3>
          <span className="text-[11px] text-[#737A95]">Fintech Dark Engine</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setTheme('light')}
            className={cn(
              'flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all min-h-[72px]',
              theme === 'light'
                ? 'border-[#315BFF] bg-[#315BFF]/15 text-white font-bold shadow-[0_0_15px_rgba(49,91,255,0.25)]'
                : 'border-white/[0.06] bg-[#15182B]/60 hover:bg-[#15182B] text-[#A1A5BC] hover:text-white'
            )}
          >
            <Sun className={cn("h-5 w-5 mb-1", theme === 'light' ? 'text-[#477BFF]' : 'text-[#737A95]')} />
            Light
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={cn(
              'flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all min-h-[72px]',
              theme === 'dark'
                ? 'border-[#315BFF] bg-[#315BFF]/15 text-white font-bold shadow-[0_0_15px_rgba(49,91,255,0.25)]'
                : 'border-white/[0.06] bg-[#15182B]/60 hover:bg-[#15182B] text-[#A1A5BC] hover:text-white'
            )}
          >
            <Moon className={cn("h-5 w-5 mb-1", theme === 'dark' ? 'text-[#477BFF]' : 'text-[#737A95]')} />
            Dark (Pro)
          </button>
          <button
            onClick={() => setTheme('system')}
            className={cn(
              'flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all min-h-[72px]',
              theme === 'system'
                ? 'border-[#315BFF] bg-[#315BFF]/15 text-white font-bold shadow-[0_0_15px_rgba(49,91,255,0.25)]'
                : 'border-white/[0.06] bg-[#15182B]/60 hover:bg-[#15182B] text-[#A1A5BC] hover:text-white'
            )}
          >
            <Laptop className={cn("h-5 w-5 mb-1", theme === 'system' ? 'text-[#477BFF]' : 'text-[#737A95]')} />
            System
          </button>
        </div>
      </Card>

      {/* Security Architecture Info Card */}
      <Card className="rounded-2xl p-5 space-y-3 bg-[#101120] border-white/[0.08] relative overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#315BFF]/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center gap-2 text-[#477BFF] font-semibold text-xs tracking-wide uppercase">
          <Shield className="h-4 w-4" />
          Zero-Trust Passcode Security
        </div>
        <p className="text-xs text-[#A1A5BC] leading-relaxed">
          FlatMate uses Firebase Anonymous Authentication combined with server-side custom claims.
          Your secret flat passcode is the master authorization token. It is verified against a SHA-256
          hash via Cloud Functions with constant-time comparison and brute-force rate limiting (max 5 attempts / 15 min).
        </p>
        <div className="pt-2 flex items-center gap-4 text-[11px] text-[#737A95]">
          <span className="flex items-center gap-1">
            <Lock className="h-3 w-3 text-[#25D6B0]" /> SHA-256 Hashed
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-[#25D6B0]" /> Client Non-Exportable
          </span>
        </div>
      </Card>

      {/* Switch Member Modal */}
      {showSwitchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <Card className="max-w-sm w-full p-6 space-y-4 rounded-2xl bg-[#101120] border border-white/[0.1] shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-lg text-white">Switch Member</h3>
              <button
                onClick={() => setShowSwitchModal(false)}
                className="p-1 rounded-lg text-[#737A95] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSwitchSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#A1A5BC] block">
                  Select Member
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTargetMember('shashikant')}
                    className={cn(
                      'p-3 rounded-xl border text-xs font-bold transition-all',
                      targetMember === 'shashikant'
                        ? 'border-[#25D6B0] bg-[#25D6B0]/15 text-[#25D6B0] shadow-[0_0_15px_rgba(37,214,176,0.2)]'
                        : 'border-white/[0.08] bg-[#15182B] text-[#737A95] hover:text-white'
                    )}
                  >
                    Shashikant
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetMember('nitesh')}
                    className={cn(
                      'p-3 rounded-xl border text-xs font-bold transition-all',
                      targetMember === 'nitesh'
                        ? 'border-[#818CF8] bg-[#818CF8]/15 text-[#818CF8] shadow-[0_0_15px_rgba(129,140,248,0.2)]'
                        : 'border-white/[0.08] bg-[#15182B] text-[#737A95] hover:text-white'
                    )}
                  >
                    Nitesh
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#A1A5BC] block">
                  Re-enter Flat Passcode
                </label>
                <Input
                  type="password"
                  placeholder="Passcode"
                  value={switchPasscode}
                  onChange={(e) => setSwitchPasscode(e.target.value)}
                  className="text-center font-mono bg-[#15182B] border-white/[0.08] text-white focus:border-[#315BFF]"
                  required
                />
              </div>

              {switchError && (
                <p className="text-xs text-red-400 text-center">{switchError}</p>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 bg-[#15182B] border-white/[0.08] text-white hover:bg-[#1f233f]"
                  onClick={() => setShowSwitchModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-[#1745D1] to-[#4169FF] text-white font-bold hover:brightness-110 shadow-[0_0_20px_rgba(49,91,255,0.4)] transition-all min-h-[44px]"
                  disabled={isSwitching || !switchPasscode.trim()}
                >
                  {isSwitching ? 'Verifying...' : 'Confirm'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Forget Device Modal */}
      {showForgetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <Card className="max-w-sm w-full p-6 space-y-4 rounded-2xl bg-[#101120] border border-white/[0.1] shadow-2xl">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center border border-red-500/20">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-heading font-bold text-lg text-white">Forget this device?</h3>
              <p className="text-xs text-[#A1A5BC]">
                This will unpair your device and clear local credentials. You will need to enter the flat
                passcode again to reconnect.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1 bg-[#15182B] border-white/[0.08] text-white hover:bg-[#1f233f]"
                onClick={() => setShowForgetModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1 font-semibold bg-red-500 hover:bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                onClick={handleForgetConfirm}
              >
                Forget
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
