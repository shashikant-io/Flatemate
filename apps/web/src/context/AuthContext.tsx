import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInAnonymously, signOut } from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { auth, functions } from '@/lib/firebase';

interface AuthResult {
  success: boolean;
  flatId: string;
  memberId: string;
  memberName: string;
  flatName: string;
}

interface AuthContextType {
  user: User | null;
  member: string | null;
  memberName: string | null;
  flatId: string | null;
  isJoined: boolean;
  loading: boolean;
  error: string | null;
  joinFlat: (flatId: string, password: string, name: string) => Promise<boolean>;
  createFlat: (password: string, name: string) => Promise<boolean>;
  updateMemberName: (name: string) => Promise<boolean>;
  switchMember: (flatId: string, password: string, name: string) => Promise<boolean>;
  forgetDevice: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [member, setMember] = useState<string | null>(() => localStorage.getItem('flatmate-member'));
  const [memberName, setMemberName] = useState<string | null>(() => localStorage.getItem('flatmate-member-name'));
  const [flatId, setFlatId] = useState<string | null>(() => localStorage.getItem('flatmate-flatId'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        try {
          await signInAnonymously(auth);
        } catch {
          if (active) {
            setError('Unable to connect to Firebase. Check your internet connection.');
            setLoading(false);
          }
        }
        return;
      }
      if (!active) return;
      setUser(currentUser);
      try {
        const claims = (await currentUser.getIdTokenResult()).claims as {
          flatId?: string;
          member?: string;
        };
        if (claims.flatId && claims.member) {
          setFlatId(claims.flatId);
          setMember(claims.member);
          localStorage.setItem('flatmate-flatId', claims.flatId);
          localStorage.setItem('flatmate-member', claims.member);
        }
      } finally {
        if (active) setLoading(false);
      }
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const applyResult = (result: AuthResult) => {
    setFlatId(result.flatId);
    setMember(result.memberId);
    setMemberName(result.memberName);
    localStorage.setItem('flatmate-flatId', result.flatId);
    localStorage.setItem('flatmate-member', result.memberId);
    localStorage.setItem('flatmate-member-name', result.memberName);
  };

  const callAuth = async (
    callableName: 'joinFlat' | 'createFlat',
    data: Record<string, string>
  ): Promise<boolean> => {
    setError(null);
    try {
      const callable = httpsCallable<Record<string, string>, AuthResult>(functions, callableName);
      const result = await callable(data);
      if (!result.data.success) throw new Error('Authentication failed.');
      await auth.currentUser?.getIdToken(true);
      applyResult(result.data);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to authenticate with this flat.');
      return false;
    }
  };

  const joinFlat = (flat: string, password: string, name: string) =>
    callAuth('joinFlat', { flatId: flat, password, name });
  const createFlat = (password: string, name: string) =>
    callAuth('createFlat', { password, name });

  const updateMemberName = async (name: string) => {
    setError(null);
    try {
      const callable = httpsCallable<{ name: string }, { success: boolean; memberName: string }>(
        functions,
        'updateMemberName'
      );
      const result = await callable({ name });
      setMemberName(result.data.memberName);
      localStorage.setItem('flatmate-member-name', result.data.memberName);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update your name.');
      return false;
    }
  };

  const forgetDevice = async () => {
    localStorage.removeItem('flatmate-flatId');
    localStorage.removeItem('flatmate-member');
    localStorage.removeItem('flatmate-member-name');
    setFlatId(null);
    setMember(null);
    setMemberName(null);
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        member,
        memberName,
        flatId,
        isJoined: Boolean(flatId && member),
        loading,
        error,
        joinFlat,
        createFlat,
        updateMemberName,
        switchMember: joinFlat,
        forgetDevice,
        clearError: () => setError(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
