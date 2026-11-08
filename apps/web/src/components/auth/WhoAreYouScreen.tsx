import React, { useState } from 'react';
import { AlertCircle, Eye, EyeOff, KeyRound, Lock, Plus, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';

export function WhoAreYouScreen() {
  const { joinFlat, createFlat, error, clearError } = useAuth();
  const [mode, setMode] = useState<'join' | 'create'>('join');
  const [flatId, setFlatId] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    if (mode === 'create') {
      await createFlat(password, name);
    } else {
      await joinFlat(flatId, password, name);
    }
    setSubmitting(false);
  };

  const fieldClass =
    'bg-[#15182B] border-white/[0.08] text-white placeholder:text-[#737A95] focus:border-[#315BFF]';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#080914]">
      <Card className="w-full max-w-md rounded-3xl border border-white/[0.08] bg-[#101120] shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
        <CardHeader className="text-center pt-8">
          <div className="mx-auto h-16 w-16 rounded-3xl bg-gradient-to-br from-[#1745D1] to-[#4169FF] flex items-center justify-center text-white font-black text-2xl">
            FM
          </div>
          <CardTitle className="text-2xl text-white mt-3">Welcome to FlatMate</CardTitle>
          <CardDescription className="text-[#A1A5BC]">
            One shared workspace for everyone in your flat.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#15182B]">
            <button type="button" onClick={() => { setMode('join'); clearError(); }} className={`rounded-lg py-2 text-sm ${mode === 'join' ? 'bg-[#315BFF] text-white font-bold' : 'text-[#A1A5BC]'}`}>
              Join a flat
            </button>
            <button type="button" onClick={() => { setMode('create'); clearError(); }} className={`rounded-lg py-2 text-sm ${mode === 'create' ? 'bg-[#315BFF] text-white font-bold' : 'text-[#A1A5BC]'}`}>
              Create a flat
            </button>
          </div>
          <form onSubmit={submit} className="space-y-4">
            {mode === 'join' && (
              <div>
                <label htmlFor="flat-id" className="text-xs font-semibold text-[#A1A5BC]">Flat ID</label>
                <Input id="flat-id" value={flatId} onChange={(e) => setFlatId(e.target.value)} placeholder="e.g. flat_a1b2c3d4e5" className={fieldClass} autoComplete="username" />
              </div>
            )}
            <div>
              <label htmlFor="member-name" className="text-xs font-semibold text-[#A1A5BC]">Your name</label>
              <Input id="member-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Shashikant, Nitesh..." className={fieldClass} autoComplete="name" />
            </div>
            <div>
              <label htmlFor="flat-password" className="text-xs font-semibold text-[#A1A5BC] flex items-center gap-1">
                <KeyRound className="h-3.5 w-3.5 text-[#477BFF]" /> Flat password
              </label>
              <div className="relative">
                <Input id="flat-password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" className={`${fieldClass} pr-12`} autoComplete="current-password" />
                <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737A95]">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {error && <div className="flex gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
            <Button type="submit" disabled={submitting || !name.trim() || password.length < 8 || (mode === 'join' && !flatId.trim())} className="w-full h-12 bg-gradient-to-r from-[#1745D1] to-[#4169FF] text-white font-bold">
              {submitting ? 'Authenticating...' : mode === 'create' ? <><Plus className="h-4 w-4 mr-2" />Create shared flat</> : 'Access shared flat'}
            </Button>
          </form>
          <p className="text-[11px] text-[#737A95] text-center flex justify-center gap-1"><Lock className="h-3 w-3 text-[#25D6B0]" /> Password verified server-side and never stored in the browser.</p>
        </CardContent>
      </Card>
      <div className="fixed bottom-4 text-xs text-[#737A95] flex items-center gap-2"><Shield className="h-3.5 w-3.5 text-[#25D6B0]" /> Firebase authenticated shared workspace</div>
    </div>
  );
}
