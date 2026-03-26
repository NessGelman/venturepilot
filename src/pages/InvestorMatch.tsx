import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Plus, Search, Star, Edit2, Trash2, Download,
  LayoutGrid, List, ExternalLink,
  ChevronDown, ArrowUpDown
} from 'lucide-react';
import { PageHeader, Card, Badge, Button } from '../components/Shared';

interface Investor {
  id: string;
  name: string;
  firm: string;
  tier: 'Tier 1' | 'Tier 2' | 'Tier 3' | 'Angel';
  focus: string[];
  checkSize: string;
  contact: 'Not Contacted' | 'Contacted' | 'Active' | 'Interested' | 'Passed' | 'Committed';
  matchScore: number;
  notes: string;
  email?: string;
  linkedin?: string;
  lastContact?: string;
  portfolio?: string;
}

const DEFAULT_INVESTORS: Investor[] = [
  { id: 'i1', name: 'Marc Andreessen', firm: 'a16z', tier: 'Tier 1', focus: ['SaaS', 'AI/ML', 'Crypto', 'Consumer'], checkSize: '$5M–$50M', contact: 'Not Contacted', matchScore: 88, notes: 'Strong SaaS thesis. Look for viral distribution and network effects.', portfolio: 'GitHub, Lyft, Airbnb', linkedin: 'https://www.linkedin.com/in/pmarca' },
  { id: 'i2', name: 'Roelof Botha', firm: 'Sequoia', tier: 'Tier 1', focus: ['Fintech', 'SaaS', 'Healthcare', 'Enterprise'], checkSize: '$5M–$100M', contact: 'Active', matchScore: 92, notes: 'Deep fintech expertise. Portfolio includes Stripe, Square. Board seat expected.', portfolio: 'Stripe, YouTube, MongoDB', linkedin: 'https://www.linkedin.com/in/roelofbotha' },
  { id: 'i3', name: 'Reid Hoffman', firm: 'Greylock', tier: 'Tier 1', focus: ['Network Effects', 'B2B SaaS', 'AI', 'Marketplace'], checkSize: '$3M–$30M', contact: 'Interested', matchScore: 85, notes: 'Pioneer of network effect investing. LinkedIn founder — deep GTM and growth expertise.', portfolio: 'LinkedIn, Airbnb, Palo Alto Networks' },
  { id: 'i4', name: 'John Lilly', firm: 'Greylock', tier: 'Tier 1', focus: ['Developer Tools', 'Infrastructure', 'Open Source'], checkSize: '$2M–$25M', contact: 'Not Contacted', matchScore: 79, notes: 'Former Mozilla CEO. Deep devtools domain expertise.', portfolio: 'Dropbox, Tumblr' },
  { id: 'i5', name: 'Aileen Lee', firm: 'Cowboy Ventures', tier: 'Tier 2', focus: ['Consumer', 'B2B SaaS', 'Future of Work'], checkSize: '$1M–$10M', contact: 'Contacted', matchScore: 74, notes: 'Coined the term "unicorn." Strong consumer and SaaS operator background.', portfolio: 'Dollar Shave Club, Rent the Runway' },
  { id: 'i6', name: 'Keith Rabois', firm: 'Founders Fund', tier: 'Tier 1', focus: ['Fintech', 'Real Estate', 'Commerce', 'Enterprise'], checkSize: '$3M–$50M', contact: 'Passed', matchScore: 62, notes: 'PayPal mafia. Very hands-on. Look for monopolistic markets.', portfolio: 'PayPal, LinkedIn, Square, Yelp' },
  { id: 'i7', name: 'Sarah Tavel', firm: 'Benchmark', tier: 'Tier 1', focus: ['Consumer', 'Marketplace', 'SaaS', 'Network Effects'], checkSize: '$3M–$25M', contact: 'Not Contacted', matchScore: 71, notes: 'Expertise in engagement metrics and viral loops. Pinterest background.', portfolio: 'Yelp, Pinterest, Chainalysis' },
  { id: 'i8', name: 'Elad Gil', firm: 'Elad Gil / Angel', tier: 'Angel', focus: ['AI/ML', 'SaaS', 'Infrastructure', 'Biotech'], checkSize: '$500K–$5M', contact: 'Active', matchScore: 90, notes: 'High-growth handbook author. Incredible operator experience. Fast decision-maker.', portfolio: 'Airbnb, Coinbase, Stripe, Instacart' },
];

const CONTACT_CONFIG: Record<Investor['contact'], { color: string; bg: string; label: string }> = {
  'Not Contacted': { color: 'var(--text-muted)', bg: 'rgba(255,255,255,0.04)', label: 'Not Contacted' },
  'Contacted': { color: 'var(--blue)', bg: 'rgba(59,130,246,0.12)', label: 'Contacted' },
  'Active': { color: 'var(--amber)', bg: 'var(--amber-dim)', label: 'Active' },
  'Interested': { color: 'var(--green)', bg: 'var(--green-dim)', label: 'Interested' },
  'Passed': { color: 'var(--red)', bg: 'var(--red-dim)', label: 'Passed' },
  'Committed': { color: '#3b82f6', bg: 'rgba(59,130,246,0.15)', label: 'Committed' },
};

const TIER_COLORS: Record<string, string> = {
  'Tier 1': '#f59e0b', 'Tier 2': '#3b82f6', 'Tier 3': '#6b7280', 'Angel': '#10b981',
};

const CONTACT_STAGES: Investor['contact'][] = ['Not Contacted', 'Contacted', 'Active', 'Interested', 'Passed', 'Committed'];

function InvestorCard({ investor, onEdit, onDelete, onStatusChange, compact }: {
  investor: Investor; onEdit: () => void; onDelete: () => void;
  onStatusChange: (status: Investor['contact']) => void; compact?: boolean;
}) {
  const cfg = CONTACT_CONFIG[investor.contact];
  const [showStages, setShowStages] = useState(false);

  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg)] p-4 hover:border-[var(--accent)] transition-all group relative"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shrink-0"
            style={{ background: `${TIER_COLORS[investor.tier]}20`, color: TIER_COLORS[investor.tier] }}>
            {investor.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <div className="font-bold text-sm leading-tight">{investor.name}</div>
            <div className="text-xs text-[var(--text-muted)]">{investor.firm}</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="text-xs font-black px-2 py-0.5 rounded-full"
            style={{ background: `${TIER_COLORS[investor.tier]}20`, color: TIER_COLORS[investor.tier] }}>
            {investor.tier}
          </div>
          <div className="flex items-center gap-0.5">
            <Star size={11} className="fill-[var(--amber)]" style={{ color: 'var(--amber)' }} />
            <span className="text-[11px] font-bold text-[var(--amber)]">{investor.matchScore}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        {investor.focus.slice(0, 3).map(f => (
          <span key={f} className="text-[9px] px-1.5 py-0.5 rounded-full bg-[rgba(255,255,255,0.05)] text-[var(--text-muted)] border border-[var(--border)]">{f}</span>
        ))}
        {investor.focus.length > 3 && <span className="text-[9px] text-[var(--text-muted)]">+{investor.focus.length - 3}</span>}
      </div>

      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] text-[var(--text-muted)]">Check: <span className="font-bold text-[var(--text-secondary)]">{investor.checkSize}</span></span>
      </div>

      {!compact && investor.notes && (
        <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-3 line-clamp-2">{investor.notes}</p>
      )}

      <div className="flex items-center justify-between">
        <div className="relative">
          <button onClick={() => setShowStages(v => !v)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all"
            style={{ background: cfg.bg, color: cfg.color, borderColor: 'transparent' }}>
            {cfg.label} <ChevronDown size={10} />
          </button>
          <AnimatePresence>
            {showStages && (
              <motion.div initial={{ opacity: 0, y: 4, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }}
                className="absolute bottom-full left-0 mb-1 bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg)] p-1.5 z-20 shadow-[var(--shadow-elevated)] w-36">
                {CONTACT_STAGES.map(stage => (
                  <button key={stage} onClick={() => { onStatusChange(stage); setShowStages(false); }}
                    className="w-full text-left px-3 py-1.5 rounded-md text-xs font-bold transition-colors hover:bg-[rgba(255,255,255,0.05)]"
                    style={{ color: CONTACT_CONFIG[stage].color }}>
                    {stage}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {investor.linkedin && (
            <a href={investor.linkedin} target="_blank" rel="noopener noreferrer"
              className="w-7 h-7 flex items-center justify-center rounded-md text-[var(--text-muted)] hover:text-[var(--blue)] hover:bg-[rgba(59,130,246,0.1)] transition-colors">
              <ExternalLink size={12} />
            </a>
          )}
          <button onClick={onEdit} className="w-7 h-7 flex items-center justify-center rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.05)] transition-colors"><Edit2 size={12} /></button>
          <button onClick={onDelete} className="w-7 h-7 flex items-center justify-center rounded-md text-[var(--text-muted)] hover:text-[var(--red)] hover:bg-[var(--red-dim)] transition-colors"><Trash2 size={12} /></button>
        </div>
      </div>
    </motion.div>
  );
}

const EMPTY_FORM = { name: '', firm: '', tier: 'Tier 2' as Investor['tier'], focus: '', checkSize: '', contact: 'Not Contacted' as Investor['contact'], matchScore: 70, notes: '', email: '', linkedin: '' };

export default function InvestorMatch() {
  useApp(); // context used for state persistence

  const [investors, setInvestors] = useState<Investor[]>(() => {
    try { return JSON.parse(localStorage.getItem('vp_investors') || 'null') || DEFAULT_INVESTORS; } catch { return DEFAULT_INVESTORS; }
  });

  const save = (inv: Investor[]) => {
    setInvestors(inv);
    localStorage.setItem('vp_investors', JSON.stringify(inv));
  };

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<Investor['contact'] | 'all'>('all');
  const [filterTier, setFilterTier] = useState<Investor['tier'] | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'kanban'>('grid');
  const [sortKey, setSortKey] = useState<'matchScore' | 'name' | 'tier'>('matchScore');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const filtered = useMemo(() => {
    let list = investors;
    if (search) list = list.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.firm.toLowerCase().includes(search.toLowerCase()));
    if (filterStatus !== 'all') list = list.filter(i => i.contact === filterStatus);
    if (filterTier !== 'all') list = list.filter(i => i.tier === filterTier);
    return [...list].sort((a, b) => {
      if (sortKey === 'matchScore') return b.matchScore - a.matchScore;
      if (sortKey === 'name') return a.name.localeCompare(b.name);
      if (sortKey === 'tier') return a.tier.localeCompare(b.tier);
      return 0;
    });
  }, [investors, search, filterStatus, filterTier, sortKey]);

  const stats = useMemo(() => ({
    total: investors.length,
    active: investors.filter(i => i.contact === 'Active' || i.contact === 'Interested').length,
    committed: investors.filter(i => i.contact === 'Committed').length,
    avgScore: investors.length > 0 ? Math.round(investors.reduce((s, i) => s + i.matchScore, 0) / investors.length) : 0,
  }), [investors]);

  const openAdd = () => { setForm(EMPTY_FORM); setEditingId(null); setShowModal(true); };
  const openEdit = (inv: Investor) => {
    setForm({ name: inv.name, firm: inv.firm, tier: inv.tier, focus: inv.focus.join(', '), checkSize: inv.checkSize, contact: inv.contact, matchScore: inv.matchScore, notes: inv.notes, email: inv.email || '', linkedin: inv.linkedin || '' });
    setEditingId(inv.id);
    setShowModal(true);
  };

  const submitForm = () => {
    if (!form.name.trim() || !form.firm.trim()) return;
    const investor: Investor = {
      id: editingId || `inv-${Date.now()}`,
      name: form.name.trim(), firm: form.firm.trim(), tier: form.tier,
      focus: form.focus.split(',').map(f => f.trim()).filter(Boolean),
      checkSize: form.checkSize, contact: form.contact, matchScore: form.matchScore,
      notes: form.notes, email: form.email, linkedin: form.linkedin,
    };
    save(editingId ? investors.map(i => i.id === editingId ? investor : i) : [...investors, investor]);
    setShowModal(false);
  };

  const exportCSV = () => {
    const header = 'Name,Firm,Tier,Focus,Check Size,Status,Match Score,Notes';
    const rows = investors.map(i => `"${i.name}","${i.firm}","${i.tier}","${i.focus.join('; ')}","${i.checkSize}","${i.contact}","${i.matchScore}","${i.notes}"`);
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'investors.csv'; a.click();
  };

  const kanbanColumns = CONTACT_STAGES.map(stage => ({
    stage, investors: filtered.filter(i => i.contact === stage),
    cfg: CONTACT_CONFIG[stage],
  }));

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <PageHeader
        icon={Users}
        title="Investor CRM"
        subtitle="Your fundraise pipeline. Move deals forward."
        badge={<Badge color={stats.active > 0 ? 'var(--amber)' : 'var(--text-muted)'} size="sm">{stats.active} active</Badge>}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" icon={Download} onClick={exportCSV}>Export</Button>
            <Button variant="primary" size="sm" icon={Plus} onClick={openAdd}>Add Investor</Button>
          </div>
        }
      />

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Tracked', value: stats.total, color: 'var(--text-primary)' },
          { label: 'Active Pipeline', value: stats.active, color: 'var(--amber)' },
          { label: 'Committed', value: stats.committed, color: 'var(--green)' },
          { label: 'Avg Match Score', value: `${stats.avgScore}/100`, color: 'var(--accent)' },
        ].map(s => (
          <div key={s.label} className="p-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)] text-center">
            <div className="text-xl font-black" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[10px] text-[var(--text-muted)] mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters + view toggle */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search investors…"
            className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md)] pl-8 pr-4 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)}
          className="bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]">
          <option value="all">All Status</option>
          {CONTACT_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterTier} onChange={e => setFilterTier(e.target.value as any)}
          className="bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]">
          <option value="all">All Tiers</option>
          {['Tier 1', 'Tier 2', 'Tier 3', 'Angel'].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={sortKey} onChange={e => setSortKey(e.target.value as any)}
          className="bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]">
          <option value="matchScore">Sort: Match Score</option>
          <option value="name">Sort: Name</option>
          <option value="tier">Sort: Tier</option>
        </select>
        <div className="flex items-center gap-1 p-1 rounded-[var(--radius-md)] bg-[var(--bg-card)] border border-[var(--border)]">
          {([['grid', <LayoutGrid size={14} />], ['list', <List size={14} />], ['kanban', <ArrowUpDown size={14} />]] as const).map(([mode, icon]) => (
            <button key={mode} onClick={() => setViewMode(mode as any)}
              className="w-8 h-7 flex items-center justify-center rounded transition-all"
              style={{ background: viewMode === mode ? 'var(--accent)' : 'transparent', color: viewMode === mode ? 'white' : 'var(--text-muted)' }}>
              {icon}
            </button>
          ))}
        </div>
      </div>

      {/* Grid view */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence>
            {filtered.map(inv => (
              <InvestorCard key={inv.id} investor={inv} onEdit={() => openEdit(inv)}
                onDelete={() => save(investors.filter(i => i.id !== inv.id))}
                onStatusChange={status => save(investors.map(i => i.id === inv.id ? { ...i, contact: status } : i))}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* List view */}
      {viewMode === 'list' && (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-[var(--border)]">
                {['Name / Firm', 'Tier', 'Focus', 'Check Size', 'Status', 'Match', ''].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map(inv => {
                  const cfg = CONTACT_CONFIG[inv.contact];
                  return (
                    <motion.tr key={inv.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="border-b border-[var(--border-subtle)] hover:bg-[rgba(255,255,255,0.02)] transition-colors group">
                      <td className="py-3 px-3">
                        <div className="font-bold text-sm">{inv.name}</div>
                        <div className="text-xs text-[var(--text-muted)]">{inv.firm}</div>
                      </td>
                      <td className="py-3 px-3"><span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${TIER_COLORS[inv.tier]}20`, color: TIER_COLORS[inv.tier] }}>{inv.tier}</span></td>
                      <td className="py-3 px-3"><div className="flex flex-wrap gap-1">{inv.focus.slice(0, 2).map(f => <span key={f} className="text-[9px] px-1.5 py-0.5 rounded-full bg-[rgba(255,255,255,0.05)] text-[var(--text-muted)]">{f}</span>)}</div></td>
                      <td className="py-3 px-3 text-xs text-[var(--text-muted)]">{inv.checkSize}</td>
                      <td className="py-3 px-3"><span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span></td>
                      <td className="py-3 px-3"><div className="flex items-center gap-1"><Star size={10} style={{ color: 'var(--amber)', fill: 'var(--amber)' }} /><span className="text-xs font-bold text-[var(--amber)]">{inv.matchScore}</span></div></td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(inv)} className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"><Edit2 size={13} /></button>
                          <button onClick={() => save(investors.filter(i => i.id !== inv.id))} className="p-1 text-[var(--text-muted)] hover:text-[var(--red)]"><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </Card>
      )}

      {/* Kanban view */}
      {viewMode === 'kanban' && (
        <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar">
          {kanbanColumns.filter(c => c.stage !== 'Not Contacted' || c.investors.length > 0).map(col => (
            <div key={col.stage} className="flex-shrink-0 w-64">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold" style={{ color: col.cfg.color }}>{col.stage}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: col.cfg.bg, color: col.cfg.color }}>{col.investors.length}</span>
                </div>
              </div>
              <div className="space-y-2 min-h-[60px]">
                {col.investors.map(inv => (
                  <InvestorCard key={inv.id} investor={inv} compact onEdit={() => openEdit(inv)}
                    onDelete={() => save(investors.filter(i => i.id !== inv.id))}
                    onStatusChange={status => save(investors.map(i => i.id === inv.id ? { ...i, contact: status } : i))}
                  />
                ))}
                {col.investors.length === 0 && (
                  <div className="h-16 rounded-[var(--radius-lg)] border border-dashed border-[var(--border)] flex items-center justify-center">
                    <span className="text-xs text-[var(--text-muted)]">Drop here</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)' }}
            onClick={() => setShowModal(false)}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
              className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-xl)] p-6 w-full max-w-md shadow-[var(--shadow-elevated)] max-h-[90vh] overflow-y-auto custom-scrollbar"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-black text-base">{editingId ? 'Edit Investor' : 'Add Investor'}</h3>
                <button onClick={() => setShowModal(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-lg leading-none">✕</button>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Name *', key: 'name', type: 'text', placeholder: 'John Smith' },
                  { label: 'Firm *', key: 'firm', type: 'text', placeholder: 'Sequoia Capital' },
                  { label: 'Check Size', key: 'checkSize', type: 'text', placeholder: '$1M–$5M' },
                  { label: 'Focus Areas', key: 'focus', type: 'text', placeholder: 'SaaS, AI/ML, Fintech' },
                  { label: 'Email', key: 'email', type: 'email', placeholder: 'partner@vc.com' },
                  { label: 'LinkedIn URL', key: 'linkedin', type: 'url', placeholder: 'https://linkedin.com/in/...' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide mb-1.5 block">{f.label}</label>
                    <input type={f.type} value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]" />
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide mb-1.5 block">Tier</label>
                    <select value={form.tier} onChange={e => setForm(p => ({ ...p, tier: e.target.value as any }))}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]">
                      {['Tier 1', 'Tier 2', 'Tier 3', 'Angel'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide mb-1.5 block">Status</label>
                    <select value={form.contact} onChange={e => setForm(p => ({ ...p, contact: e.target.value as any }))}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]">
                      {CONTACT_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide mb-1.5 block">Match Score: {form.matchScore}</label>
                  <input type="range" min="0" max="100" value={form.matchScore} onChange={e => setForm(p => ({ ...p, matchScore: +e.target.value }))}
                    className="w-full accent-[var(--accent)]" />
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide mb-1.5 block">Notes</label>
                  <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={3} placeholder="Investment thesis, preferences, intro source…"
                    className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] resize-none" />
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <Button variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button variant="primary" className="flex-1" onClick={submitForm}>{editingId ? 'Save Changes' : 'Add Investor'}</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
