import React, { useState, useEffect, useCallback } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Target, Presentation, FileText, Database, Users,
  Sparkles, CheckCircle, AlertCircle, Info,
  Command, Moon, Sun, TrendingUp, Calculator
} from 'lucide-react';
import InputSidebar from './InputSidebar';
import AIPanel from './AIPanel';
import CommandPalette from './CommandPalette';

const nav = [
  { to: '/', icon: Activity, label: 'Dashboard', shortcut: '1' },
  { to: '/strategy', icon: Target, label: 'Strategy', shortcut: '2' },
  { to: '/pitch', icon: Presentation, label: 'Pitch Deck', shortcut: '3' },
  { to: '/plan', icon: FileText, label: 'Business Plan', shortcut: '4' },
  { to: '/bench', icon: Database, label: 'Benchmarks', shortcut: '5' },
  { to: '/investors', icon: Users, label: 'Investors', shortcut: '6' },
  { to: '/valuation', icon: Calculator, label: 'Valuation', shortcut: '7' },
  { to: '/update', icon: TrendingUp, label: 'Investor Update', shortcut: '8' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [cmdOpen, setCmdOpen] = useState(false);
  // Only push content on sm+ screens; on mobile the sidebar overlays
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  );
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    setIsMobile(mq.matches);
    return () => mq.removeEventListener('change', handler);
  }, []);
  const { isDark, toggleTheme, toasts, ai, investors, runwayMonths } = useApp();
  const location = useLocation();

  const activeInvestors = investors?.filter((i) => i.contact === 'Active' || i.contact === 'Interested').length || 0;
  const runwayAlert = runwayMonths < 6;
  const isGoodRunway = runwayMonths >= 12;

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setCmdOpen(o => !o);
    }
    if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
      e.preventDefault();
      setSidebarOpen(o => !o);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const toastIcons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertCircle,
    info: Info,
  };
  const toastColors = {
    success: 'var(--green)',
    error: 'var(--red)',
    warning: 'var(--amber)',
    info: 'var(--blue)',
  };

  return (
    <div className={`min-h-screen flex bg-[var(--bg-base)] text-[var(--text-primary)] font-sans antialiased overflow-hidden ${isDark ? 'dark' : ''}`}>
      {/* Sidebar */}
      <InputSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Command Palette */}
      <CommandPalette isOpen={cmdOpen} setIsOpen={setCmdOpen} />

      {/* Mobile backdrop — only shown below sm when sidebar is open */}
      {sidebarOpen && (
        <div
          className="sm:hidden fixed inset-0 z-[199] bg-black/50 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main content area — only push on sm+; mobile sidebar overlays */}
      <div
        className="flex-1 flex flex-col h-screen overflow-hidden"
        style={{
          marginLeft: (!isMobile && sidebarOpen) ? 'var(--sidebar-width)' : '0',
          transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Top bar */}
        <header className="h-[60px] bg-[var(--bg-card)] border-b border-[var(--border)] flex items-center px-5 gap-4 shrink-0 z-40 sticky top-0">
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-[var(--radius-md)] bg-[var(--accent)] flex items-center justify-center shadow-[var(--shadow-glow-sm)]">
              <Sparkles size={14} className="text-white" />
            </div>
            <span className="font-black text-sm tracking-tight gradient-text-blue">VenturePilot</span>
          </div>

          <div className="w-px h-5 bg-[var(--border)] mx-1" />

          {/* Nav */}
          <nav className="flex items-center gap-0.5 flex-1 overflow-x-auto custom-scrollbar">
            {nav.map(n => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  `nav-link shrink-0 ${isActive ? 'active' : ''}`
                }
              >
                {() => (
                  <>
                    <n.icon size={13} />
                    {n.label}
                    {n.to === '/investors' && activeInvestors > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[var(--accent)] text-white text-[9px] font-black">
                        {activeInvestors}
                      </span>
                    )}
                    {n.to === '/strategy' && runwayAlert && (
                      <span className="ml-1 w-2 h-2 rounded-full bg-[var(--red)] animate-pulse" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Runway pill */}
            <div
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold"
              style={{
                background: runwayAlert ? 'var(--red-dim)' : isGoodRunway ? 'var(--green-dim)' : 'var(--amber-dim)',
                color: runwayAlert ? 'var(--red)' : isGoodRunway ? 'var(--green)' : 'var(--amber)',
                border: `1px solid ${runwayAlert ? 'rgba(239,68,68,0.25)' : isGoodRunway ? 'rgba(16,185,129,0.25)' : 'rgba(245,158,11,0.25)'}`,
              }}
            >
              <span className="status-dot" style={{ background: 'currentColor', width: 6, height: 6 }} />
              {runwayMonths}mo runway
            </div>

            {/* AI status */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[rgba(255,255,255,0.03)] border border-[var(--border)] text-[10px] font-bold text-[var(--text-muted)]">
              <span
                className="status-dot"
                style={{
                  background: ai?.status.ready ? 'var(--green)' : ai?.status.loading ? 'var(--amber)' : 'rgba(255,255,255,0.2)',
                  boxShadow: ai?.status.ready ? '0 0 6px rgba(16,185,129,0.6)' : ai?.status.loading ? '0 0 6px rgba(245,158,11,0.6) ' : 'none',
                }}
              />
              {ai?.status.ready
                ? (ai.status.backend === 'chrome' ? 'Chrome AI' : 'WebLLM')
                : ai?.status.loading ? `${ai.status.progress}%` : 'AI Offline'}
            </div>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-md)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.05)] transition-colors"
              title="Toggle theme"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* Command palette */}
            <button
              onClick={() => setCmdOpen(true)}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-[var(--radius-md)] bg-[rgba(255,255,255,0.03)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.06)] transition-colors text-xs font-medium"
              title="Command palette (⌘K)"
              aria-label="Open command palette"
              aria-keyshortcuts="Control+k Meta+k"
            >
              <Command size={12} aria-hidden="true" />
              <span className="text-[10px] font-mono">⌘K</span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 lg:p-8 custom-scrollbar relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* AI Panel */}
      <AIPanel />

      {/* Toast container — aria-live so screen readers announce new messages */}
      <div
        role="region"
        aria-live="polite"
        aria-label="Notifications"
        className="fixed bottom-5 right-5 z-[1000] flex flex-col gap-2 w-80 pointer-events-none"
      >
        <AnimatePresence>
          {[...(toasts || [])].reverse().map((t) => {
            const Icon = toastIcons[t.type as keyof typeof toastIcons] || Info;
            const color = toastColors[t.type as keyof typeof toastColors] || 'var(--blue)';
            return (
              <motion.div
                key={t.id}
                role="alert"
                initial={{ opacity: 0, x: 24, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 24, scale: 0.95 }}
                transition={{ type: 'spring', damping: 28, stiffness: 350 }}
                className="pointer-events-auto bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg)] px-4 py-3 shadow-[var(--shadow-elevated)] flex items-start gap-3 relative overflow-hidden"
              >
                <Icon size={15} style={{ color, flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
                <p className="text-sm font-medium text-[var(--text-primary)] flex-1 leading-snug">{t.message}</p>
                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--border-subtle)]">
                  <motion.div
                    initial={{ width: '100%' }}
                    animate={{ width: 0 }}
                    transition={{ duration: 3, ease: 'linear' }}
                    style={{ height: '100%', background: color, borderRadius: 99 }}
                  />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
