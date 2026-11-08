import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { FlatProvider } from '@/context/FlatContext';
import { AppShell } from '@/components/layout/AppShell';
import { WhoAreYouScreen } from '@/components/auth/WhoAreYouScreen';
import { HomePage } from '@/pages/HomePage';
import { HistoryPage } from '@/pages/HistoryPage';
import { AddExpensePage } from '@/pages/AddExpensePage';
import { SettleUpPage } from '@/pages/SettleUpPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { ProfilePage } from '@/pages/ProfilePage';

function AppContent() {
  const { isJoined, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#080914]">
        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#1745D1] to-[#4169FF] text-white flex items-center justify-center font-heading font-black text-2xl animate-pulse shadow-[0_0_25px_rgba(49,91,255,0.45)] border border-white/20 mb-4">
          FM
        </div>
        <p className="text-xs font-semibold text-[#A1A5BC] tracking-wide animate-pulse">
          Opening FlatMate...
        </p>
      </div>
    );
  }

  if (!isJoined) {
    return <WhoAreYouScreen />;
  }

  return (
    <Routes>
      <Route path="/" element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="add" element={<AddExpensePage />} />
        <Route path="settle" element={<SettleUpPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FlatProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </FlatProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
