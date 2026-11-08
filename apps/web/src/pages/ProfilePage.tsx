import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function ProfilePage() {
  const { theme, setTheme } = useTheme();
  const { member: authMember, switchMember, forgetDevice, error: authError } = useAuth();
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
    <div className="space-y-6 animate-fade-in max-w-lg mx-auto pb-12">
      <div>
        <h2 className="text-2xl font-heading font-extrabold tracking-tight">
          Profile & Settings
        </h2>
        <p className="text-xs text-muted-foreground">
          Device pairing, flatmate identity, and app preferences
        </p>
      </div>

      {/* Active Member Identity Card */}
      <Card className="rounded-card p-5 space-y-4 shadow-card">
        <div className="flex items-center space-x-4">
          <div
            className={cn(
              'h-14 w-14 rounded-2xl flex items-center justify-center font-heading font-black text-2xl shadow-sm text-white',
              activeMember === 'shashikant'
                ? 'bg-gradient-to-br from-teal-500 to-emerald-400 shadow-teal-glow'
                : 'bg-gradient-to-br from-indigo-500 to-violet-500 shadow-plum-glow'
            )}
          >
            {activeMember === 'shashikant' ? 'S' : 'N'}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-bold text-lg capitalize text-foreground">
                {activeMember}
              </h3>
              <Badge variant={activeMember === 'shashikant' ? 'teal' : 'plum'}>
                Active Device
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{flatName}</p>
          </div>
        </div>

        <div className="pt-2 border-t border-border flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs min-h-[40px]"
            onClick={() => {
              setTargetMember(activeMember === 'shashikant' ? 'nitesh' : 'shashikant');
              setShowSwitchModal(true);
            }}
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Switch Member
          </Button>

          <Button
            variant="destructive"
            size="sm"
            className="text-xs min-h-[40px]"
            onClick={() => setShowForgetModal(true)}
          >
            <LogOut className="h-3.5 w-3.5 mr-1.5" />
            Forget Device
          </Button>
        </div>
      </Card>

      {/* Theme Preference Card */}
      <Card className="rounded-card p-5 space-y-3 shadow-card">
        <h3 className="font-heading font-semibold text-sm text-foreground">
          Theme Preference
        </h3>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setTheme('light')}
            className={cn(
              'flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all min-h-[70px]',
              theme === 'light'
                ? 'border-amber-500 bg-amber-500/15 text-amber-900 dark:text-amber-300 font-bold shadow-sm'
                : 'border-border hover:bg-muted text-muted-foreground'
            )}
          >
            <Sun className="h-5 w-5 mb-1" />
            Light
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={cn(
              'flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all min-h-[70px]',
              theme === 'dark'
                ? 'border-amber-500 bg-amber-500/15 text-amber-900 dark:text-amber-300 font-bold shadow-sm'
                : 'border-border hover:bg-muted text-muted-foreground'
            )}
          >
            <Moon className="h-5 w-5 mb-1" />
            Dark
          </button>
          <button
            onClick={() => setTheme('system')}
            className={cn(
              'flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all min-h-[70px]',
              theme === 'system'
                ? 'border-amber-500 bg-amber-500/15 text-amber-900 dark:text-amber-300 font-bold shadow-sm'
                : 'border-border hover:bg-muted text-muted-foreground'
            )}
          >
            <Laptop className="h-5 w-5 mb-1" />
            System
          </button>
        </div>
      </Card>

      {/* Security Info Card */}
      <Card className="rounded-card p-5 space-y-2 border-amber-500/20 bg-amber-500/5">
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold text-xs">
          <Shield className="h-4 w-4" />
          Passcode Security Model
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          FlatMate uses Firebase Anonymous Authentication combined with server-side custom claims.
          Your secret flat passcode is the master key granting read/write authorization. It is hashed
          with SHA-256 and verified with constant-time equality and brute-force rate limiting.
        </p>
      </Card>

      {/* Switch Member Modal */}
      {showSwitchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <Card className="max-w-sm w-full p-6 space-y-4 rounded-hero shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-lg">Switch Member</h3>
              <button
                onClick={() => setShowSwitchModal(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSwitchSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground block">
                  Select Member
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTargetMember('shashikant')}
                    className={cn(
                      'p-2.5 rounded-xl border text-xs font-bold transition-all',
                      targetMember === 'shashikant'
                        ? 'border-shashikant bg-shashikant/15 text-shashikant'
                        : 'border-border text-muted-foreground'
                    )}
                  >
                    Shashikant
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetMember('nitesh')}
                    className={cn(
                      'p-2.5 rounded-xl border text-xs font-bold transition-all',
                      targetMember === 'nitesh'
                        ? 'border-nitesh bg-nitesh/15 text-nitesh'
                        : 'border-border text-muted-foreground'
                    )}
                  >
                    Nitesh
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground block">
                  Re-enter Flat Passcode
                </label>
                <Input
                  type="password"
                  placeholder="Passcode"
                  value={switchPasscode}
                  onChange={(e) => setSwitchPasscode(e.target.value)}
                  className="text-center font-mono"
                  required
                />
              </div>

              {switchError && (
                <p className="text-xs text-destructive text-center">{switchError}</p>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowSwitchModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="saffron"
                  className="flex-1 font-black shadow-josh"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <Card className="max-w-sm w-full p-6 space-y-4 rounded-hero shadow-2xl">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-heading font-bold text-lg">Forget this device?</h3>
              <p className="text-xs text-muted-foreground">
                This will unpair your device and clear local data. You will need to enter the flat
                passcode again to reconnect.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowForgetModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1 font-semibold"
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
