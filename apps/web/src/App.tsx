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
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
        <div className="h-12 w-12 rounded-2xl bg-saffron text-ink flex items-center justify-center font-heading font-black text-xl animate-pulse shadow-raised mb-4">
          FM
        </div>
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
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
