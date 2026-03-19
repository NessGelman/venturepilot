import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Terminal, Settings2, Target, Presentation, FileText, Database, Users, SunMoon, Activity } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function CommandPalette({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (b: boolean) => void }) {
  const [query, setQuery] = useState('');
  const app = useApp();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [isOpen, setIsOpen]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const actions = [
    { title: 'Dashboard', type: 'Page', icon: Activity, onSelect: () => navigate('/') },
    { title: 'Strategy Planner', type: 'Page', icon: Target, onSelect: () => navigate('/strategy') },
    { title: 'Pitch Deck Generator', type: 'Page', icon: Presentation, onSelect: () => navigate('/pitch') },
    { title: 'Business Plan', type: 'Page', icon: FileText, onSelect: () => navigate('/plan') },
    { title: 'Market Benchmarks', type: 'Page', icon: Database, onSelect: () => navigate('/bench') },
    { title: 'Investor CRM', type: 'Page', icon: Users, onSelect: () => navigate('/investors') },
    { title: 'Toggle Theme', type: 'Action', icon: SunMoon, onSelect: () => app.toggleTheme() },
    { title: 'Reset Defaults', type: 'Action', icon: Settings2, onSelect: () => app.resetDefaults() },
    ...app.presets.map(p => ({
      title: `Load Preset: ${p.name}`,
      type: 'Preset',
      icon: Settings2,
      onSelect: () => app.loadPreset(p.name)
    })),
    ...app.investors.map(i => ({
      title: `View Investor: ${i.name}`,
      type: 'Investor',
      icon: Users,
      onSelect: () => navigate('/investors')
    }))
  ];

  const filtered = actions.filter(a => a.title.toLowerCase().includes(query.toLowerCase()));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] bg-black/50 backdrop-blur-sm flex items-start justify-center pt-[15vh]">
      {/* Click outside to close wrapper */}
      <div className="absolute inset-0" onClick={() => setIsOpen(false)} />
      
      <div className="bg-[var(--bg-surface)] border border-[var(--border)] w-full max-w-xl rounded-[var(--radius-xl)] shadow-2xl relative overflow-hidden flex flex-col max-h-[60vh]">
        <div className="p-4 border-b border-[var(--border)] flex items-center gap-3 bg-[rgba(255,255,255,0.02)]">
          <Terminal size={18} className="text-[var(--accent-light)]" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setIsOpen(false);
              // In a real app we'd add arrow key navigation here
              if (e.key === 'Enter' && filtered.length > 0) {
                filtered[0].onSelect();
                setIsOpen(false);
              }
            }}
            className="bg-transparent border-none flex-1 outline-none text-[var(--text-primary)] placeholder-[var(--text-muted)] font-mono text-sm"
            placeholder="Type a command or search..."
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 font-mono text-[10px] text-[var(--text-muted)] px-1.5 py-0.5 rounded border border-[var(--border)]">
             ESC
          </kbd>
        </div>

        <div className="overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-[var(--text-muted)] text-sm font-medium">
               No results found.
            </div>
          ) : (
            filtered.map((action, i) => (
              <button
                key={i}
                onClick={() => { action.onSelect(); setIsOpen(false); }}
                className={`w-full text-left px-4 py-3 flex items-center gap-3 rounded-[var(--radius-md)] hover:bg-[rgba(255,255,255,0.05)] text-[var(--text-primary)] transition-colors group ${i === 0 && query ? 'bg-[rgba(255,255,255,0.03)]' : ''}`}
              >
                <action.icon size={16} className="text-[var(--text-muted)] group-hover:text-[var(--accent-light)]" />
                <span className="flex-1 font-medium text-sm">{action.title}</span>
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] tracking-wider">
                  {action.type}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
