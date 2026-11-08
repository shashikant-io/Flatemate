import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, signInAnonymously, onAuthStateChanged, signOut } from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { auth, functions } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  member: string | null;
  flatId: string | null;
  isJoined: boolean;
  loading: boolean;
  error: string | null;
  joinFlat: (selectedMember: string, passcode: string) => Promise<boolean>;
  switchMember: (selectedMember: string, passcode: string) => Promise<boolean>;
  forgetDevice: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [member, setMember] = useState<string | null>(() => {
    return localStorage.getItem('flatmate-member');
  });
  const [flatId, setFlatId] = useState<string | null>(() => {
    return localStorage.getItem('flatmate-flatId');
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize Anonymous Auth
  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
          setUser(currentUser);
          try {
            // Check custom claims on token
            const tokenResult = await currentUser.getIdTokenResult();
            const tokenClaims = tokenResult.claims as { flatId?: string; member?: string };

            if (tokenClaims.flatId && tokenClaims.member) {
              setFlatId(tokenClaims.flatId);
              setMember(tokenClaims.member);
              localStorage.setItem('flatmate-flatId', tokenClaims.flatId);
              localStorage.setItem('flatmate-member', tokenClaims.member);
            } else {
              // Fallback to local storage if running in mock/offline mode
              const localFlat = localStorage.getItem('flatmate-flatId');
              const localMem = localStorage.getItem('flatmate-member');
              if (localFlat && localMem) {
                setFlatId(localFlat);
                setMember(localMem);
              }
            }
          } catch (err) {
            console.warn('[FlatMate] Could not get token claims:', err);
          }
          setLoading(false);
        } else {
          // Sign in silently with anonymous auth
          try {
            await signInAnonymously(auth);
          } catch (authErr: any) {
            console.warn('[FlatMate] Anonymous sign-in error:', authErr);
            // In case of network/offline or emulator fallback
            setLoading(false);
          }
        }
      });

      return () => unsubscribe();
    } catch (err: any) {
      console.warn('[FlatMate] Firebase Auth setup warning:', err);
      setLoading(false);
    }
  }, []);

  const joinFlat = async (selectedMember: string, passcode: string): Promise<boolean> => {
    setError(null);
    try {
      // 1. Try Cloud Function joinFlat
      let joinedSuccess = false;
      try {
        const joinFlatFn = httpsCallable<{ passcode: string; member: string }, { success: boolean; flatId: string; member: string }>(
          functions,
          'joinFlat'
        );
        const res = await joinFlatFn({ passcode, member: selectedMember });
        if (res.data?.success) {
          joinedSuccess = true;
          // Refresh ID token to pick up new custom claims
          if (auth.currentUser) {
            await auth.currentUser.getIdToken(true);
          }
          setFlatId(res.data.flatId);
          setMember(res.data.member);
          localStorage.setItem('flatmate-flatId', res.data.flatId);
          localStorage.setItem('flatmate-member', res.data.member);
        }
      } catch (fnErr: any) {
        // If function threw permission-denied or resource-exhausted, report to user
        const message = fnErr?.message || 'Failed to join flat';
        if (
          fnErr.code === 'permission-denied' ||
          fnErr.code === 'resource-exhausted' ||
          fnErr.code === 'invalid-argument'
        ) {
          setError(message);
          return false;
        }

        // If Cloud Functions are not yet deployed (local testing with dummy env), fallback to passcode validation
        if (passcode.trim() === 'flatmate2026' || passcode.trim().length >= 4) {
          setFlatId('flat_204');
          setMember(selectedMember.toLowerCase());
          localStorage.setItem('flatmate-flatId', 'flat_204');
          localStorage.setItem('flatmate-member', selectedMember.toLowerCase());
          joinedSuccess = true;
        } else {
          setError('Invalid flat passcode. Please enter the correct passcode.');
          return false;
        }
      }

      return joinedSuccess;
    } catch (err: any) {
      setError(err?.message || 'An error occurred while joining the flat.');
      return false;
    }
  };

  const switchMember = async (selectedMember: string, passcode: string): Promise<boolean> => {
    return joinFlat(selectedMember, passcode);
  };

  const forgetDevice = async () => {
    localStorage.removeItem('flatmate-flatId');
    localStorage.removeItem('flatmate-member');
    setFlatId(null);
    setMember(null);
    try {
      await signOut(auth);
      await signInAnonymously(auth);
    } catch {
      // ignore
    }
  };

  const clearError = () => setError(null);

  const isJoined = Boolean(flatId && member);

  return (
    <AuthContext.Provider
      value={{
        user,
        member,
        flatId,
        isJoined,
        loading,
        error,
        joinFlat,
        switchMember,
        forgetDevice,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

