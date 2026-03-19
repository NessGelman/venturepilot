import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Target, Presentation, FileText, Database, Users, Sparkles, TerminalSquare, AlertCircle, CheckCircle, Info, Menu } from 'lucide-react';
import InputSidebar from './InputSidebar';
import AIPanel from './AIPanel';
import CommandPalette from './CommandPalette';
import Onboarding from './Onboarding';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [cmdOpen, setCmdOpen] = useState(false);
  const { isDark, toasts, ai, derived, investors } = useApp() as any;

  // Let's create removeToast if it wasn't on AppContext, or just rely on toasts auto-dismissing.
  // Actually, AppContext addToast does auto dismiss, but no manual dismiss. I will handle auto dismiss there and manual here if needed, 
  // wait we need progress bar for toast. Let's build a custom Toast container here instead of relying solely on Context, or just render Context toasts.

  const activeInvestors = investors?.filter((i: any) => i.contact === 'Active').length || 0;
  const runwayAlert = derived.runwayMonths < 6;

  const nav = [
    { to: '/', icon: Activity, label: 'Dashboard', shortcut: '⌘ 1' },
    { to: '/strategy', icon: Target, label: 'Strategy Planner', shortcut: '⌘ 2', dot: runwayAlert },
    { to: '/pitch', icon: Presentation, label: 'Pitch Deck Generator', shortcut: '⌘ 3' },
    { to: '/plan', icon: FileText, label: 'Business Plan', shortcut: '⌘ 4' },
    { to: '/bench', icon: Database, label: 'Market Benchmarks', shortcut: '⌘ 5' },
    { to: '/investors', icon: Users, label: 'Investor CRM', shortcut: '⌘ 6', badge: activeInvestors },
  ];

  const getToastIcon = (type: string) => {
    switch(type) {
      case 'success': return <CheckCircle size={16} className="text-emerald-500" />;
      case 'error': return <AlertCircle size={16} className="text-red-500" />;
      case 'warning': return <AlertCircle size={16} className="text-amber-500" />;
      default: return <Info size={16} className="text-blue-500" />;
    }
  };

  return (
    <div className={`min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] font-sans antialiased overflow-hidden flex ${isDark ? 'dark' : ''}`}>
      {/* Onboarding */}
      <Onboarding />
      
      {/* Global Modals */}
      <CommandPalette isOpen={cmdOpen} setIsOpen={setCmdOpen} />

      {/* Sidebar - Settings */}
      <InputSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content Area */}
      <div 
        className="flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{ marginLeft: sidebarOpen ? 340 : 0 }}
      >
        {/* Top Navigation Bar */}
        <header className="h-[72px] bg-[var(--bg-card)] border-b border-[rgba(255,255,255,0.08)] flex items-center px-6 justify-between gap-6 shrink-0 z-40 backdrop-blur-md sticky top-0 shadow-sm relative">
          <div className="flex items-center gap-6">
            <h1 className="text-lg font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-cyan-400 tracking-tight flex items-center gap-2">
              <Sparkles size={18} className="text-indigo-400" />
              VenturePilot
            </h1>

            <nav className="flex gap-2 relative">
              {nav.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  className={({ isActive }) => `
                    relative px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-sm transition-all overflow-hidden group
                    ${isActive ? 'bg-[rgba(99,102,241,0.1)] text-[var(--accent)] shadow-inner' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.03)]'}
                  `}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--accent)] shadow-glow rounded-r" />}
                      <n.icon size={16} className={`${isActive ? 'text-[var(--accent)]' : 'opacity-70 group-hover:opacity-100'} transition-opacity`} />
                      <span className="relative">{n.label}</span>
                      {n.badge > 0 && (
                        <span className="ml-1.5 px-2 py-0.5 rounded-full bg-[var(--accent)] text-white text-[10px] font-black pointer-events-none shadow-glow">
                          {n.badge}
                        </span>
                      )}
                      {n.dot && (
                        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse" />
                      )}
                      
                      {/* Keyboard shortcut hint */}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap font-mono">
                        {n.shortcut}
                      </div>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* AI Status Indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] cursor-default">
              <span className={`w-2 h-2 rounded-full ${ai?.status.ready ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' : ai?.status.loading ? 'bg-amber-400 animate-pulse' : 'bg-[var(--text-muted)]'}`} />
              <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                {ai?.status.backend === 'chrome' ? 'Chrome AI • ON' : ai?.status.backend === 'webllm' ? 'WebLLM • ON' : 'AI • Offline'}
              </span>
            </div>

            <button
              onClick={() => setCmdOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-md)] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.05)] transition-all card-hover"
            >
              <TerminalSquare size={16} />
              <div className="flex items-center gap-1 font-mono text-[10px] font-bold">
                <kbd className="px-1.5 py-0.5 rounded bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.1)]">⌘</kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.1)]">K</kbd>
              </div>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-8 custom-scrollbar relative bg-[var(--bg-base)]">
          <AnimatePresence mode="wait">
            {children}
          </AnimatePresence>
        </main>
      </div>
      
      {/* AI Panel */}
      <AIPanel />

      {/* Toast Notifications */}
      <div className="fixed bottom-6 right-6 z-[1000] flex flex-col gap-3 min-w-[320px] pointer-events-none">
        <AnimatePresence>
          {[...(toasts || [])].reverse().map((t: any) => (
            <motion.div
              layout
              key={t.id}
              initial={{ opacity: 0, scale: 0.9, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`pointer-events-auto bg-[var(--bg-card)] border border-[rgba(255,255,255,0.08)] rounded-[var(--radius-lg)] p-4 shadow-elevated flex flex-col gap-2 relative overflow-hidden`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {getToastIcon(t.type || 'info')}
                </div>
                <p className="text-sm font-medium text-[var(--text-primary)] flex-1">{t.message}</p>
                <button 
                  onClick={() => {
                     // Since we don't have removeToast in context, we could just hide it locally, but it's simpler to just let it auto dismiss 
                     // unless I implement full ToastProvider. I'll just use css visually.
                     const el = document.getElementById(`toast-${t.id}`);
                     if (el) el.style.display = 'none';
                  }} 
                  className="text-[var(--text-muted)] hover:bg-[rgba(255,255,255,0.1)] rounded p-0.5 transition-colors absolute top-3 right-3"
                >
                  <Menu size={14} className="opacity-0" /> {/* Transparent so just for spacing */}
                </button>
              </div>
              
              {/* Progress bar line */}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-[rgba(255,255,255,0.05)]">
                 <motion.div 
                    initial={{ width: '100%' }}
                    animate={{ width: 0 }}
                    transition={{ duration: 3, ease: 'linear' }}
                    className={`h-full ${t.type === 'success' ? 'bg-emerald-500' : t.type === 'error' ? 'bg-red-500' : t.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}`}
                 />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}
