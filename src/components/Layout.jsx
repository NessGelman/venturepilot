import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Rocket, LayoutDashboard, Target, Zap, BarChart3, Users, FileText, Sun, Moon } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import InputSidebar from './InputSidebar';
import { useApp } from '../context/AppContext';

export default function Layout({ children }) {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
const { toasts, undo, redo, isDark, toggleTheme } = useApp();

  useEffect(() => {
    const handler = (e) => {
      const isUndo = (e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === 'z';
      const isRedo =
        ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'z') ||
        ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y');
      if (isUndo) {
        e.preventDefault();
        undo?.();
      }
      if (isRedo) {
        e.preventDefault();
        redo?.();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo]);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Strategy', path: '/strategy', icon: Target },
    { name: 'Slide Deck', path: '/pitch', icon: Zap },
    { name: 'Business Plan', path: '/business-plan', icon: FileText },
    { name: 'Market Bench', path: '/market', icon: BarChart3 },
    { name: 'Investor CRM', path: '/investors', icon: Users },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="dark min-h-screen bg-[var(--bg-base)] [background-image:radial-gradient(ellipse_60%_50%_at_10%_0%,rgba(30,64,175,0.08)_0%,transparent_60%),radial-gradient(ellipse_40%_30%_at_90%_80%,rgba(5,150,105,0.06)_0%,transparent_60%),radial-gradient(ellipse_25%_20%_at_50%_30%,rgba(16,185,129,0.04)_0%,transparent_70%)] text-[var(--text-primary)] relative overflow-hidden">
      <InputSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className={`transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] min-h-screen flex flex-col lg:ml-[290px]`}>
        <nav className="sticky top-0 z-[100] h-[72px] border-b border-[rgba(255,255,255,0.08)] bg-[var(--bg-glass)] backdrop-blur-sm flex items-center px-7">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
            <Link
              to="/"
              className="no-underline flex items-center gap-2.5 flex-shrink-0 hover:glow-hover"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--accent)] to-green flex items-center justify-center shadow-[0_4px_12px_rgba(30,64,175,0.35)] glow-hover">
                <Rocket size={18} color="#fff" />
              </div>
              <span className="font-black text-lg leading-none [-letter-spacing:-0.02em]">
                VenturePilot{' '}
                <span className="text-[var(--text-muted)] font-medium text-xs">v2.0.0</span>
              </span>
            </Link>

            {/* Mobile hamburger */}
            <button 
              className="lg:hidden p-2.5 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.08)] hover:glow-hover"
              onClick={() => setIsSidebarOpen(true)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Desktop nav */}
            <div className="hidden lg:flex gap-1 flex-wrap -mr-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl no-underline text-xs font-semibold transition-all duration-150 ease-in-out flex-shrink-0 ${
                    isActive(item.path)
                      ? 'text-[var(--text-primary)] bg-[rgba(30,64,175,0.15)] border border-[rgba(30,64,175,0.4)] shadow-glow'
                      : 'text-[var(--text-secondary)] border border-transparent hover:bg-[var(--bg-nav-hover)] hover:text-[var(--text-primary)] hover:border-[var(--border-accent)] hover:shadow-glow'
                  }`}
                >
                  <item.icon size={13} />
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2.5 flex-shrink-0">
              <button 
                onClick={toggleTheme}
                className="p-2.25 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.08)] hover:glow-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(30,64,175,0.3)] transition-all"
                title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
                aria-label={`Toggle ${isDark ? 'light' : 'dark'} theme`}
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </div>
        </nav>

        <main className="max-w-[1400px] mx-auto px-[28px] pb-[80px] pt-9 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        <footer className="border-t border-[rgba(255,255,255,0.05)] px-7 pb-7 pt-8 bg-[rgba(0,0,0,0.2)]">
          <div className="max-w-7xl mx-auto flex justify-between items-center flex-wrap gap-3">
            <p className="text-xs text-[var(--text-muted)] m-0 leading-relaxed">
              © 2026 VenturePilot. Built for the next generation of founders.
            </p>
          </div>
        </footer>
      </div>

      {/* Toast notifications */}
      <div className="fixed top-5 right-5 flex flex-col gap-2 z-[400] pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              className="px-4 py-2.5 rounded-2xl bg-[rgba(30,64,175,0.95)] text-white font-black shadow-[0_8px_24px_rgba(0,0,0,0.3)] text-xs backdrop-blur-sm"
            >
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
