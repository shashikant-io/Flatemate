import React from 'react';
import { NavLink, Outlet, useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  Plus,
  BarChart3,
  User,
  Sun,
  Moon,
  Sparkles,
  ArrowRightLeft,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useFlat } from '@/context/FlatContext';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { OfflineBanner } from '@/components/common/OfflineBanner';

export function AppShell() {
  const { resolvedTheme, toggleTheme } = useTheme();
  const { currentMemberId, flatName, members } = useFlat();
  const { member: authMember, memberName } = useAuth();
  const location = useLocation();

  const activeUser = authMember || currentMemberId;
  const displayName =
    memberName || members.find((member) => member.id === activeUser)?.name || activeUser;

  const todayStr = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Transactions', path: '/history', icon: Receipt },
    { label: 'Settle Up', path: '/settle', icon: ArrowRightLeft },
    { label: 'Reports', path: '/reports', icon: BarChart3 },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  const mobileNavItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'History', path: '/history', icon: Receipt },
    { label: 'Add', path: '/add', icon: Plus, isAdd: true },
    { label: 'Reports', path: '/reports', icon: BarChart3 },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-[#080914] text-white md:flex-row antialiased selection:bg-[#315BFF] selection:text-white">
      {/* Desktop Sidebar (Inspired by Reference Images 2 & 3) */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:border-white/[0.08] md:bg-[#0B0C19] md:p-5 md:shrink-0">
        {/* Brand Logo Header */}
        <div className="flex items-center space-x-3 mb-6 px-1">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-[#1745D1] to-[#4169FF] flex items-center justify-center text-white font-heading font-black text-lg shadow-[0_0_20px_rgba(49,91,255,0.45)] border border-blue-400/30">
            FM
          </div>
          <div>
            <h1 className="font-heading font-bold text-lg tracking-tight text-white leading-tight">
              FlatMate
            </h1>
            <p className="text-[11px] text-[#737A95] font-medium">Shared Finance</p>
          </div>
        </div>

        {/* User Welcome Card (NeuroBank Style) */}
        <div className="p-3.5 rounded-2xl bg-[#101120] border border-white/[0.08] mb-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'h-8 w-8 rounded-xl flex items-center justify-center font-heading font-black text-xs text-white shadow-sm',
                  members.findIndex((member) => member.id === activeUser) % 2 === 0
                    ? 'bg-gradient-to-br from-teal-500 to-emerald-500'
                    : 'bg-gradient-to-br from-indigo-500 to-violet-500'
                )}
              >
                {displayName[0]}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#737A95]">
                {displayName}
              </span>
            </div>
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-1.5 rounded-lg border border-white/[0.08] bg-[#15182B] text-[#A1A5BC] hover:text-white transition-colors"
            >
              {resolvedTheme === 'dark' ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
            </button>
          </div>
          <p className="text-[10px] uppercase font-semibold text-[#737A95] tracking-wider leading-none">
            {todayStr}
          </p>
          <h2 className="text-sm font-bold text-white mt-1 leading-snug">
            Welcome back, {displayName}!
          </h2>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-[#15182B] text-white font-semibold border border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.3)]'
                    : 'text-[#A1A5BC] hover:bg-[#15182B]/60 hover:text-white'
                )}
              >
                <Icon
                  className={cn(
                    'h-4 w-4',
                    isActive ? 'text-[#477BFF] stroke-[2.2]' : 'text-[#737A95]'
                  )}
                />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer Callout Card (Reference Image 2 Activate FlatMate Pro Style) */}
        <div className="pt-4 mt-auto">
          <Link
            to="/add"
            className="flex items-center space-x-3 px-4 py-3 rounded-2xl font-heading font-bold text-sm transition-all shadow-[0_8px_25px_-4px_rgba(49,91,255,0.5)] bg-gradient-to-r from-[#1745D1] to-[#4169FF] text-white hover:brightness-110 active:scale-[0.98] border border-blue-400/30 mb-3"
          >
            <Plus className="h-4 w-4 stroke-[2.75]" />
            <span>Add Expense</span>
          </Link>

          <div className="p-3 rounded-xl bg-[#101120] border border-white/[0.08] flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-[#25D6B0] shadow-[0_0_8px_#25D6B0] animate-pulse"></span>
              <span className="text-[11px] font-medium text-[#A1A5BC]">Live Synced</span>
            </div>
            <span className="text-[10px] text-[#737A95] font-mono">v2.0</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen bg-[#080914] overflow-x-hidden">
        <OfflineBanner />

        {/* Desktop Top Header Bar (With + Add Expense and Quick Links) */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 border-b border-white/[0.08] bg-[#080914]/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-[#737A95]">
              Household Workspace
            </span>
            <span className="text-xs text-[#737A95]">•</span>
            <span className="text-xs font-semibold text-white px-2.5 py-0.5 rounded-full bg-[#15182B] border border-white/[0.08]">
              {flatName || 'Shashikant & Nitesh Flat'}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <Link to="/settle">
              <button className="px-3.5 py-2 rounded-xl text-xs font-medium text-[#A1A5BC] hover:text-white bg-[#15182B] hover:bg-[#1A1E35] border border-white/[0.08] transition-all flex items-center gap-1.5">
                <ArrowRightLeft className="h-3.5 w-3.5 text-[#477BFF]" />
                <span>Settle Up</span>
              </button>
            </Link>

            <Link to="/add">
              <button className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#1745D1] to-[#4169FF] hover:brightness-110 shadow-[0_6px_20px_-3px_rgba(49,91,255,0.45)] border border-blue-400/25 transition-all flex items-center gap-1.5 active:scale-95">
                <Plus className="h-4 w-4 stroke-[2.75]" />
                <span>+ Add Expense</span>
              </button>
            </Link>
          </div>
        </header>

        {/* Mobile Header (hidden on desktop) */}
        <header className="sticky top-0 z-30 flex md:hidden items-center justify-between px-4 py-3 bg-[#080914]/90 backdrop-blur-xl border-b border-white/[0.08]">
          <div className="flex items-center space-x-2.5">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#1745D1] to-[#4169FF] flex items-center justify-center text-white font-heading font-black text-xs shadow-[0_0_14px_rgba(49,91,255,0.4)] border border-blue-400/30">
              FM
            </div>
            <div>
              <span className="font-heading font-bold text-base tracking-tight text-white block leading-tight">
                FlatMate
              </span>
              <span className="text-[10px] text-[#737A95] font-medium">
                {displayName} active
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#25D6B0]/10 border border-[#25D6B0]/20">
              <span className="h-1.5 w-1.5 rounded-full bg-[#25D6B0] animate-pulse"></span>
              <span className="text-[10px] font-semibold text-[#25D6B0]">Live</span>
            </div>

            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-xl border border-white/[0.08] bg-[#101120] text-[#A1A5BC] hover:text-white active:scale-95 transition-transform min-h-[40px] min-w-[40px] flex items-center justify-center"
            >
              {resolvedTheme === 'dark' ? <Moon className="h-4 w-4 text-[#477BFF]" /> : <Sun className="h-4 w-4 text-[#FFBD59]" />}
            </button>
          </div>
        </header>

        {/* Page Container */}
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6 md:px-8 md:py-8 pb-28 md:pb-12">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-[#0B0C19]/95 backdrop-blur-xl border-t border-white/[0.08] px-2 pt-1 pb-safe shadow-2xl">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto relative">
          {mobileNavItems.map((item) => {
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
                    'h-14 w-14 rounded-full bg-gradient-to-tr from-[#1745D1] to-[#4169FF] text-white shadow-[0_10px_30px_rgba(49,91,255,0.6)] border-4 border-[#080914]',
                    'active:scale-90 transition-all duration-150 focus-visible:ring-2 focus-visible:ring-[#315BFF] hover:brightness-110'
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
                    ? 'text-[#477BFF] font-bold'
                    : 'text-[#737A95] hover:text-[#A1A5BC] active:scale-95'
                )}
              >
                <Icon className={cn('h-5 w-5 mb-0.5', isActive && 'stroke-[2.4]')} />
                <span className="text-[11px] leading-tight">{item.label}</span>
                {isActive && (
                  <span className="h-1 w-1 rounded-full bg-[#477BFF] mt-0.5 animate-fade-in shadow-[0_0_6px_#477BFF]" />
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
