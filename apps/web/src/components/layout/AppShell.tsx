import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  Home,
  Receipt,
  Plus,
  BarChart3,
  User,
  Sun,
  Moon,
  Sparkles,
  ArrowRightLeft,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';
import { OfflineBanner } from '@/components/common/OfflineBanner';

export function AppShell() {
  const { resolvedTheme, toggleTheme } = useTheme();
  const location = useLocation();

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'History', path: '/history', icon: Receipt },
    { label: 'Add', path: '/add', icon: Plus, isAdd: true },
    { label: 'Reports', path: '/reports', icon: BarChart3 },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground md:flex-row">
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:border-border md:bg-card/70 md:p-6 md:backdrop-blur-md">
        <div className="flex items-center space-x-3 mb-8">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-[#051F20] via-[#0B2B26] to-[#163832] flex items-center justify-center text-amber-300 font-heading font-black text-xl shadow-[0_0_18px_rgba(245,158,11,0.35)] border border-amber-400/40">
            FM
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-xl tracking-tight text-foreground">FlatMate</h1>
            <p className="text-xs text-muted-foreground font-medium">Shashikant & Nitesh</p>
          </div>
        </div>

        <nav className="space-y-2 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            if (item.isAdd) {
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center space-x-3 px-4 py-3.5 rounded-2xl font-heading font-black text-sm transition-all my-4 shadow-josh',
                    'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-slate-950 hover:brightness-105 active:scale-[0.98]'
                  )}
                >
                  <Plus className="h-5 w-5 stroke-[3]" />
                  <span>Add Expense</span>
                </NavLink>
              );
            }

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition-all',
                  isActive
                    ? 'bg-forest-800 text-white dark:bg-forest-700 font-bold shadow-sm border border-forest-600/30'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className={cn("h-5 w-5", isActive && "text-amber-400 stroke-[2.5]")} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          <NavLink
            to="/settle"
            className={cn(
              'flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition-all text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <ArrowRightLeft className="h-5 w-5" />
            <span>Settle Up</span>
          </NavLink>
        </nav>

        {/* Sidebar Footer */}
        <div className="pt-6 border-t border-border flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs text-muted-foreground">Live Synced</span>
          </div>
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-xl border border-border hover:bg-muted transition-colors"
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-slate-700" />
            )}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        <OfflineBanner />
        {/* Mobile Header (hidden on desktop) */}
        <header className="sticky top-0 z-30 flex md:hidden items-center justify-between px-5 py-3.5 bg-background/90 backdrop-blur-md border-b border-border/80">
          <div className="flex items-center space-x-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#051F20] via-[#0B2B26] to-[#163832] flex items-center justify-center text-amber-300 font-heading font-black text-sm shadow-[0_0_14px_rgba(245,158,11,0.35)] border border-amber-400/35">
              FM
            </div>
            <div>
              <span className="font-heading font-extrabold text-lg tracking-tight text-foreground block leading-tight">FlatMate</span>
              <span className="text-[10px] text-muted-foreground font-medium">Shashikant & Nitesh</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mr-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Live</span>
            </div>
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-xl border border-border/80 bg-card/60 backdrop-blur-sm text-foreground active:scale-95 transition-transform min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="h-4 w-4 text-amber-300" />
              ) : (
                <Moon className="h-4 w-4 text-forest-900" />
              )}
            </button>
          </div>
        </header>

        {/* Page Container */}
        <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-5 md:px-8 md:py-8 pb-28 md:pb-12">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-card/95 backdrop-blur-lg border-t border-border/80 px-2 pt-1 pb-safe shadow-lg">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto relative">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            if (item.isAdd) {
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  aria-label="Add expense"
                  className={cn(
                    'relative -top-5 flex flex-col items-center justify-center',
                    'h-14 w-14 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 text-slate-950 shadow-josh border-4 border-background',
                    'active:scale-90 transition-all duration-150 focus-visible:ring-2 focus-visible:ring-amber-500 hover:brightness-105'
                  )}
                >
                  <Plus className="h-7 w-7 stroke-[3]" />
                </NavLink>
              );
            }

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  'flex flex-col items-center justify-center flex-1 h-full py-1 text-xs font-medium transition-colors min-h-[44px]',
                  isActive
                    ? 'text-amber-600 dark:text-amber-400 font-extrabold'
                    : 'text-muted-foreground hover:text-foreground active:scale-95'
                )}
              >
                <Icon className={cn('h-5 w-5 mb-0.5', isActive && 'stroke-[2.5]')} />
                <span className="text-[11px] leading-tight">{item.label}</span>
                {isActive && <span className="h-1 w-1 rounded-full bg-amber-500 mt-0.5 animate-fade-in" />}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

