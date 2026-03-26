import React, { useState, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target, TrendingUp, CheckCircle2, Plus, Trash2, GripVertical,
  ChevronDown, ChevronRight, Zap, Shield, Rocket, DollarSign,
  Users, BarChart2, ArrowRight, BookOpen, Lightbulb
} from 'lucide-react';
import { PageHeader, Card, Badge, Button, AlertBanner } from '../components/Shared';

interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
  category: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

interface Scenario {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  multiplier: number;
  growthMultiplier: number;
  raiseAmount?: number;
  raiseMonth?: number;
}

const SCENARIOS: Scenario[] = [
  { id: 'default', label: 'Current Pace', description: 'Maintain existing burn rate and growth trajectory.', icon: <BarChart2 size={16} />, color: '#3b82f6', multiplier: 1, growthMultiplier: 1 },
  { id: 'aggressive', label: 'Aggressive Growth', description: 'Double headcount, 3× marketing. Max velocity to capture market.', icon: <Rocket size={16} />, color: '#3b82f6', multiplier: 2.2, growthMultiplier: 2.5, raiseAmount: 5000000, raiseMonth: 3 },
  { id: 'conservative', label: 'Capital Efficient', description: 'Reduce burn 30%. Extend runway to 24+ months, reach profitability.', icon: <Shield size={16} />, color: '#10b981', multiplier: 0.7, growthMultiplier: 0.8 },
  { id: 'raise', label: 'Raise & Scale', description: 'Close Series A in 90 days. Deploy capital into GTM and product.', icon: <DollarSign size={16} />, color: '#f59e0b', multiplier: 1.8, growthMultiplier: 3, raiseAmount: 8000000, raiseMonth: 3 },
  { id: 'pivot', label: 'Strategic Pivot', description: 'Shift ICP to enterprise. Longer sales cycles, higher ACV.', icon: <Zap size={16} />, color: '#f43f5e', multiplier: 1.1, growthMultiplier: 1.5 },
];

const PRIORITY_CONFIG = {
  critical: { label: 'Critical', color: 'var(--red)', bg: 'var(--red-dim)' },
  high: { label: 'High', color: 'var(--amber)', bg: 'var(--amber-dim)' },
  medium: { label: 'Medium', color: 'var(--blue)', bg: 'rgba(59,130,246,0.12)' },
  low: { label: 'Low', color: 'var(--text-muted)', bg: 'rgba(255,255,255,0.04)' },
};

const PRESET_TEMPLATES = [
  {
    name: 'Series A Readiness', description: '18 investor-grade milestones', tag: 'Fundraising', icon: <DollarSign size={14} />,
    checklist: [
      { text: 'Hit $1M ARR or clear path within 6 months', done: false, category: 'Revenue', priority: 'critical' as const },
      { text: 'MoM growth ≥ 10% for 3 consecutive months', done: false, category: 'Growth', priority: 'critical' as const },
      { text: 'NDR > 100% (negative churn)', done: false, category: 'Retention', priority: 'critical' as const },
      { text: 'LTV:CAC ratio ≥ 3×', done: false, category: 'Unit Economics', priority: 'high' as const },
      { text: 'CAC payback period < 18 months', done: false, category: 'Unit Economics', priority: 'high' as const },
      { text: 'Gross margin ≥ 65%', done: false, category: 'Financials', priority: 'high' as const },
      { text: 'Build data room (financials, cap table, contracts)', done: false, category: 'Admin', priority: 'high' as const },
      { text: 'Identify 30 target Series A investors', done: false, category: 'Fundraising', priority: 'high' as const },
      { text: 'Warm intros to 10 top-tier VCs', done: false, category: 'Fundraising', priority: 'high' as const },
      { text: 'Finalize pitch deck (12 slides)', done: false, category: 'Fundraising', priority: 'high' as const },
      { text: 'Prepare 3-year financial model', done: false, category: 'Financials', priority: 'medium' as const },
      { text: 'Legal: clean cap table, no major issues', done: false, category: 'Legal', priority: 'medium' as const },
      { text: 'Reference customers ready for VC calls', done: false, category: 'Sales', priority: 'medium' as const },
      { text: 'Hire / identify key exec roles (COO, CRO)', done: false, category: 'Team', priority: 'medium' as const },
      { text: 'IP / patents filed or in progress', done: false, category: 'Legal', priority: 'low' as const },
      { text: 'SOC 2 or security audit underway', done: false, category: 'Compliance', priority: 'low' as const },
      { text: 'Board / advisory board assembled', done: false, category: 'Governance', priority: 'low' as const },
      { text: 'PR strategy ready for post-round announcement', done: false, category: 'Marketing', priority: 'low' as const },
    ],
  },
  {
    name: 'PMF Sprint', description: 'Validate product-market fit in 90 days', tag: 'Product', icon: <Target size={14} />,
    checklist: [
      { text: 'Define ICP with 3 firmographic attributes', done: false, category: 'Strategy', priority: 'critical' as const },
      { text: 'Run 20 discovery calls with target personas', done: false, category: 'Research', priority: 'critical' as const },
      { text: 'Build and ship MVP in ≤ 6 weeks', done: false, category: 'Product', priority: 'critical' as const },
      { text: 'Sign 10 pilot customers (paid or LOI)', done: false, category: 'Sales', priority: 'critical' as const },
      { text: 'Achieve > 40% "very disappointed" on PMF survey', done: false, category: 'Product', priority: 'high' as const },
      { text: 'NPS > 50 from first cohort', done: false, category: 'Product', priority: 'high' as const },
      { text: '60% of users return after 30 days', done: false, category: 'Retention', priority: 'high' as const },
      { text: 'Document 3 core use cases as case studies', done: false, category: 'Marketing', priority: 'medium' as const },
      { text: 'Kill features with < 10% adoption', done: false, category: 'Product', priority: 'medium' as const },
      { text: 'Weekly product-market fit review cadence', done: false, category: 'Process', priority: 'low' as const },
    ],
  },
  {
    name: 'GTM Launch', description: 'Go-to-market execution playbook', tag: 'Growth', icon: <Rocket size={14} />,
    checklist: [
      { text: 'Define pricing tiers (Freemium / Pro / Enterprise)', done: false, category: 'Pricing', priority: 'critical' as const },
      { text: 'Build outbound sequence (5-touch cadence)', done: false, category: 'Sales', priority: 'critical' as const },
      { text: 'Launch Product Hunt campaign', done: false, category: 'Marketing', priority: 'high' as const },
      { text: 'Set up CRM and sales pipeline tracking', done: false, category: 'Operations', priority: 'high' as const },
      { text: 'Create SEO content cluster (10 articles)', done: false, category: 'Marketing', priority: 'high' as const },
      { text: 'Activate 3 channel partnerships', done: false, category: 'Partnerships', priority: 'high' as const },
      { text: 'Build referral / PLG viral loop', done: false, category: 'Growth', priority: 'medium' as const },
      { text: 'Run first paid acquisition test (< $5K)', done: false, category: 'Marketing', priority: 'medium' as const },
      { text: 'Establish CAC tracking by channel', done: false, category: 'Analytics', priority: 'medium' as const },
      { text: 'Launch affiliate / reseller program', done: false, category: 'Partnerships', priority: 'low' as const },
    ],
  },
];

function ScenarioCard({ scenario, selected, onClick, burnRate, mrr, monthlyGrowth }: {
  scenario: Scenario; selected: boolean; onClick: () => void;
  burnRate: number; mrr: number; monthlyGrowth: number;
}) {
  const adjBurn = burnRate * scenario.multiplier;
  const adjGrowth = monthlyGrowth * scenario.growthMultiplier;
  let cash = (burnRate || 10000) * 12;
  let m = mrr;
  let runway = 0;
  for (let i = 0; i < 60; i++) {
    if (scenario.raiseAmount && i === (scenario.raiseMonth || 3)) cash += scenario.raiseAmount;
    cash = cash - adjBurn + m;
    m = m * (1 + adjGrowth / 100);
    runway = i + 1;
    if (cash <= 0) break;
    if (i >= 59) runway = 60;
  }

  return (
    <motion.button onClick={onClick} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}
      className="w-full text-left rounded-[var(--radius-lg)] p-4 border transition-all relative overflow-hidden"
      style={{ background: selected ? `${scenario.color}18` : 'var(--bg-card)', borderColor: selected ? scenario.color : 'var(--border)', boxShadow: selected ? `0 0 20px ${scenario.color}22` : 'none' }}
    >
      {selected && <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: scenario.color }} />}
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-[var(--radius-md)] flex items-center justify-center shrink-0" style={{ background: `${scenario.color}20`, color: scenario.color }}>
          {scenario.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-sm text-[var(--text-primary)]">{scenario.label}</span>
            {selected && <CheckCircle2 size={14} style={{ color: scenario.color }} />}
          </div>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-3">{scenario.description}</p>
          <div className="grid grid-cols-3 gap-2">
            {[['Burn/mo', `$${(adjBurn / 1000).toFixed(0)}K`], ['Growth', `${adjGrowth.toFixed(1)}%`], ['Runway', `${runway >= 60 ? '60+' : runway}mo`]].map(([k, v]) => (
              <div key={k}>
                <div className="text-[9px] text-[var(--text-muted)] uppercase tracking-wide mb-0.5">{k}</div>
                <div className="text-xs font-bold" style={{ color: scenario.color }}>{v}</div>
              </div>
            ))}
          </div>
          {scenario.raiseAmount && (
            <div className="mt-2 text-[10px] rounded-full px-2 py-0.5 inline-flex items-center gap-1" style={{ background: `${scenario.color}15`, color: scenario.color }}>
              <DollarSign size={9} />Raise ${(scenario.raiseAmount / 1e6).toFixed(1)}M in mo {scenario.raiseMonth}
            </div>
          )}
        </div>
      </div>
    </motion.button>
  );
}

function ChecklistRow({ item, onToggle, onDelete, onEdit }: {
  item: ChecklistItem; onToggle: () => void; onDelete: () => void; onEdit: (t: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(item.text);
  const prio = PRIORITY_CONFIG[item.priority];

  const commit = () => { if (val.trim()) onEdit(val.trim()); setEditing(false); };

  return (
    <motion.div layout initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}
      className="flex items-center gap-3 p-3 rounded-[var(--radius-md)] border border-transparent hover:border-[var(--border)] hover:bg-[rgba(255,255,255,0.02)] group transition-all"
    >
      <div className="text-[var(--text-muted)] opacity-0 group-hover:opacity-60 transition-opacity shrink-0 cursor-grab"><GripVertical size={14} /></div>
      <button onClick={onToggle}
        className="w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all"
        style={{ borderColor: item.done ? 'var(--green)' : 'var(--border)', background: item.done ? 'var(--green-dim)' : 'transparent' }}
      >
        {item.done && <CheckCircle2 size={12} style={{ color: 'var(--green)' }} />}
      </button>
      <div className="flex-1 min-w-0">
        {editing ? (
          <input autoFocus value={val} onChange={e => setVal(e.target.value)}
            onBlur={commit} onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false); }}
            className="w-full bg-transparent text-sm text-[var(--text-primary)] outline-none border-b border-[var(--accent)]"
          />
        ) : (
          <span onClick={() => setEditing(true)} className="text-sm cursor-text transition-colors"
            style={{ color: item.done ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: item.done ? 'line-through' : 'none' }}>
            {item.text}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full hidden sm:block" style={{ background: prio.bg, color: prio.color }}>{prio.label}</span>
        <span className="text-[9px] text-[var(--text-muted)] hidden md:block">{item.category}</span>
        <button onClick={onDelete} className="opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-[var(--red)] transition-all p-0.5"><Trash2 size={13} /></button>
      </div>
    </motion.div>
  );
}

export default function Strategy() {
  const { state } = useApp() as any;
  const { burn: burnRate = 0, revenue: mrr = 0, growth: monthlyGrowth = 5, capital: cashOnHand = 0 } = state || {};

  const [activeScenario, setActiveScenario] = useState('default');
  const [checklist, setChecklist] = useState<ChecklistItem[]>(() => {
    try { return JSON.parse(localStorage.getItem('vp_checklist') || 'null') || []; } catch { return []; }
  });
  const [newItemText, setNewItemText] = useState('');
  const [newItemPriority, setNewItemPriority] = useState<ChecklistItem['priority']>('medium');
  const [newItemCategory, setNewItemCategory] = useState('General');
  const [filter, setFilter] = useState<'all' | 'pending' | 'done'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | ChecklistItem['priority']>('all');
  const [showPresets, setShowPresets] = useState(false);
  const [expandInsights, setExpandInsights] = useState(true);

  const saveChecklist = useCallback((items: ChecklistItem[]) => {
    setChecklist(items);
    localStorage.setItem('vp_checklist', JSON.stringify(items));
  }, []);

  const addItem = () => {
    if (!newItemText.trim()) return;
    saveChecklist([...checklist, { id: `item-${Date.now()}`, text: newItemText.trim(), done: false, category: newItemCategory || 'General', priority: newItemPriority }]);
    setNewItemText('');
  };

  const filteredChecklist = checklist.filter(item => {
    if (filter === 'pending' && item.done) return false;
    if (filter === 'done' && !item.done) return false;
    if (filterPriority !== 'all' && item.priority !== filterPriority) return false;
    return true;
  });

  const completionPct = checklist.length > 0 ? Math.round((checklist.filter(i => i.done).length / checklist.length) * 100) : 0;
  const criticalPending = checklist.filter(i => i.priority === 'critical' && !i.done).length;
  const scenario = SCENARIOS.find(s => s.id === activeScenario)!;

  const projData = (() => {
    const data: { month: string; cash: number }[] = [];
    let cash = cashOnHand || (burnRate * 12);
    let rev = mrr;
    for (let i = 0; i <= 12; i++) {
      if (scenario.raiseAmount && i === scenario.raiseMonth) cash += scenario.raiseAmount;
      data.push({ month: i === 0 ? 'Now' : `M${i}`, cash: Math.max(0, cash / 1000) });
      cash = cash - burnRate * scenario.multiplier + rev;
      rev = rev * (1 + (monthlyGrowth * scenario.growthMultiplier) / 100);
    }
    return data;
  })();

  const maxCash = Math.max(...projData.map(d => d.cash), 1);

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <PageHeader
        icon={Target}
        title="Strategy"
        subtitle="Model scenarios. Track milestones."
        badge={<span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${completionPct >= 75 ? 'bg-[var(--green-dim)] text-[var(--green)]' : completionPct >= 40 ? 'bg-[var(--amber-dim)] text-[var(--amber)]' : 'bg-[rgba(255,255,255,0.06)] text-[var(--text-muted)]'}`}>{completionPct}% Complete</span>}
        actions={<Button variant="secondary" size="sm" icon={BookOpen} onClick={() => setShowPresets(true)}>Templates</Button>}
      />

      {criticalPending > 0 && (
        <AlertBanner type="warning" title={`${criticalPending} critical milestone${criticalPending > 1 ? 's' : ''} pending`}
          description="Address critical items before your next investor conversation." />
      )}

      {/* Scenario Selection */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Target size={15} style={{ color: 'var(--accent)' }} />
          <span className="font-bold text-sm">Scenario Modeling</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--accent-dim)] text-[var(--accent-light)] font-bold ml-1">{scenario.label}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 mb-5">
          {SCENARIOS.map(s => (
            <ScenarioCard key={s.id} scenario={s} selected={activeScenario === s.id} onClick={() => setActiveScenario(s.id)} burnRate={burnRate} mrr={mrr} monthlyGrowth={monthlyGrowth} />
          ))}
        </div>

        {/* Cash bar chart */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={13} style={{ color: scenario.color }} />
            <span className="text-xs font-bold text-[var(--text-muted)]">{scenario.label} — 12-Month Cash Projection</span>
          </div>
          <div className="flex gap-0.5 items-end" style={{ height: 80 }}>
            {projData.map((d, i) => {
              const barH = Math.max(4, (d.cash / maxCash) * 76);
              const isRaise = scenario.raiseAmount && i === scenario.raiseMonth;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group" title={`${d.month}: $${d.cash.toFixed(0)}K`}>
                  <motion.div initial={{ height: 0 }} animate={{ height: barH }} transition={{ delay: i * 0.04, duration: 0.4 }}
                    className="w-full rounded-t-sm"
                    style={{ background: d.cash <= 0 ? 'var(--red)' : isRaise ? scenario.color : `${scenario.color}bb` }}
                  />
                  <div className="text-[8px] text-[var(--text-muted)]">{d.month}</div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Strategic Insights */}
      <Card>
        <button onClick={() => setExpandInsights(v => !v)} className="w-full flex items-center justify-between mb-0">
          <div className="flex items-center gap-2">
            <Lightbulb size={15} style={{ color: 'var(--amber)' }} />
            <span className="font-bold text-sm">Strategic Insights</span>
          </div>
          {expandInsights ? <ChevronDown size={14} className="text-[var(--text-muted)]" /> : <ChevronRight size={14} className="text-[var(--text-muted)]" />}
        </button>
        <AnimatePresence>
          {expandInsights && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                {[
                  { icon: <DollarSign size={16} />, title: 'Revenue Momentum', color: 'var(--green)',
                    insight: mrr >= 50000 ? `Strong at $${(mrr/1000).toFixed(0)}K MRR. Focus on NDR and expansion revenue to hit Series A metrics.` : mrr >= 10000 ? `$${(mrr/1000).toFixed(0)}K MRR shows traction. Accelerate PLG and outbound to reach $100K MRR.` : `Pre-revenue or early stage. Focus 100% on finding 10 paying customers who love the product.`,
                    action: mrr >= 50000 ? 'Optimize LTV' : mrr >= 10000 ? 'Accelerate GTM' : 'Find PMF' },
                  { icon: <Shield size={16} />, title: 'Burn Efficiency', color: burnRate > mrr * 3 ? 'var(--red)' : burnRate > mrr * 1.5 ? 'var(--amber)' : 'var(--green)',
                    insight: burnRate > mrr * 3 ? `Burn Multiple is high. Every $1 of new ARR costs $${(burnRate / Math.max(mrr * 0.1, 1)).toFixed(1)} to acquire. Reduce headcount or increase prices.` : burnRate > mrr * 1.5 ? `Burn Multiple is reasonable. Keep CAC payback < 18 months and watch gross margins.` : `Excellent burn efficiency. You're building a capital-efficient machine — VCs love this.`,
                    action: burnRate > mrr * 3 ? 'Cut Burn 20%' : burnRate > mrr * 1.5 ? 'Monitor Weekly' : 'Maintain Discipline' },
                  { icon: <Users size={16} />, title: 'Fundraising Timing', color: 'var(--blue)',
                    insight: (cashOnHand / Math.max(burnRate, 1)) >= 12 ? `12+ months runway — ideal negotiating position. Start outreach now from a position of strength.` : (cashOnHand / Math.max(burnRate, 1)) >= 6 ? `6-12 months runway. Begin fundraising immediately — typical close timeline is 4-6 months.` : `< 6 months runway is dangerous. Either cut burn or start emergency fundraising today.`,
                    action: (cashOnHand / Math.max(burnRate, 1)) >= 12 ? 'Start Outreach' : (cashOnHand / Math.max(burnRate, 1)) >= 6 ? 'Fundraise Now' : 'Bridge or Cut' },
                ].map((card, i) => (
                  <div key={i} className="p-4 rounded-[var(--radius-lg)] border border-[var(--border)] space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-[var(--radius-md)] flex items-center justify-center" style={{ background: `${card.color}18`, color: card.color }}>{card.icon}</div>
                      <span className="font-bold text-sm">{card.title}</span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{card.insight}</p>
                    <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: card.color }}><ArrowRight size={11} />{card.action}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Milestone Checklist */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={15} style={{ color: 'var(--green)' }} />
            <span className="font-bold text-sm">Milestone Tracker</span>
            <span className="text-xs text-[var(--text-muted)]">{checklist.filter(i => i.done).length}/{checklist.length}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-24 h-1.5 rounded-full bg-[var(--border)]">
                <motion.div className="h-full rounded-full" style={{ background: completionPct >= 75 ? 'var(--green)' : completionPct >= 40 ? 'var(--amber)' : 'var(--accent)' }} animate={{ width: `${completionPct}%` }} transition={{ duration: 0.6 }} />
              </div>
              <span className="text-[11px] font-bold text-[var(--text-muted)]">{completionPct}%</span>
            </div>
            <Button variant="ghost" size="sm" icon={<BookOpen size={13} />} onClick={() => setShowPresets(true)}>Templates</Button>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {(['all', 'pending', 'done'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="text-xs px-3 py-1 rounded-full border transition-all capitalize"
              style={{ background: filter === f ? 'var(--accent)' : 'transparent', borderColor: filter === f ? 'var(--accent)' : 'var(--border)', color: filter === f ? 'white' : 'var(--text-muted)' }}>
              {f}
            </button>
          ))}
          <div className="w-px h-4 bg-[var(--border)] mx-1" />
          {(['all', 'critical', 'high', 'medium', 'low'] as const).map(p => {
            const cfg = p !== 'all' ? PRIORITY_CONFIG[p] : null;
            return (
              <button key={p} onClick={() => setFilterPriority(p)}
                className="text-xs px-3 py-1 rounded-full border transition-all capitalize"
                style={{ background: filterPriority === p ? (cfg?.color || 'var(--accent)') : 'transparent', borderColor: filterPriority === p ? (cfg?.color || 'var(--accent)') : 'var(--border)', color: filterPriority === p ? 'white' : 'var(--text-muted)' }}>
                {p}
              </button>
            );
          })}
        </div>

        <div className="space-y-1 min-h-[80px]">
          <AnimatePresence>
            {filteredChecklist.length === 0 ? (
              <div className="py-10 text-center">
                <CheckCircle2 size={28} className="mx-auto mb-2 opacity-20" />
                <p className="text-sm text-[var(--text-muted)]">{checklist.length === 0 ? 'No milestones yet. Load a template or add items below.' : 'No items match your filters.'}</p>
                {checklist.length === 0 && <Button variant="secondary" size="sm" className="mt-3" onClick={() => setShowPresets(true)}>Load Template</Button>}
              </div>
            ) : filteredChecklist.map(item => (
              <ChecklistRow key={item.id} item={item}
                onToggle={() => saveChecklist(checklist.map(i => i.id === item.id ? { ...i, done: !i.done } : i))}
                onDelete={() => saveChecklist(checklist.filter(i => i.id !== item.id))}
                onEdit={(text) => saveChecklist(checklist.map(i => i.id === item.id ? { ...i, text } : i))}
              />
            ))}
          </AnimatePresence>
        </div>

        <div className="pt-3 border-t border-[var(--border-subtle)] flex flex-wrap gap-2 items-center mt-2">
          <input type="text" value={newItemText} onChange={e => setNewItemText(e.target.value)} onKeyDown={e => e.key === 'Enter' && addItem()}
            placeholder="Add milestone…"
            className="flex-1 min-w-[180px] bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
          />
          <input type="text" value={newItemCategory} onChange={e => setNewItemCategory(e.target.value)} placeholder="Category"
            className="w-24 bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
          />
          <select value={newItemPriority} onChange={e => setNewItemPriority(e.target.value as any)}
            className="bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]">
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={addItem}>Add</Button>
        </div>
      </Card>

      {/* Template Modal */}
      <AnimatePresence>
        {showPresets && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}
            onClick={() => setShowPresets(false)}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-xl)] p-6 w-full max-w-lg shadow-[var(--shadow-elevated)]"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-black text-base">Milestone Templates</h3>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">Load a preset to instantly populate your checklist</p>
                </div>
                <button onClick={() => setShowPresets(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-lg leading-none">✕</button>
              </div>
              <div className="space-y-3">
                {PRESET_TEMPLATES.map((preset, i) => (
                  <button key={i} onClick={() => {
                    saveChecklist(preset.checklist.map((c, idx) => ({ ...c, id: `preset-${Date.now()}-${idx}` })));
                    setShowPresets(false);
                  }}
                    className="w-full text-left p-4 rounded-[var(--radius-lg)] border border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--accent-dim)] transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-[var(--radius-md)] bg-[var(--accent-dim)] text-[var(--accent)] flex items-center justify-center">{preset.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">{preset.name}</span>
                          <Badge variant="default" size="sm">{preset.tag}</Badge>
                        </div>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5">{preset.description} — {preset.checklist.length} items</p>
                      </div>
                      <ArrowRight size={14} className="text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-[var(--text-muted)] mt-4 text-center">⚠️ Loading replaces your current checklist</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
