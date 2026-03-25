import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Download, ChevronDown, ChevronRight, Target,
  DollarSign, Users, Rocket, BarChart2, Shield, Globe,
  TrendingUp, Building2, Lightbulb, BookOpen
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { PageHeader, Card, Button, Badge, AlertBanner } from '../components/Shared';

const fmt = (n: number, prefix = '$') => {
  if (n >= 1e9) return `${prefix}${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${prefix}${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${prefix}${(n / 1e3).toFixed(0)}K`;
  return `${prefix}${Math.round(n)}`;
};

interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
}

const SECTIONS: Section[] = [
  { id: 'executive', title: 'Executive Summary', icon: <BookOpen size={15} />, color: '#3b82f6' },
  { id: 'market', title: 'Market Analysis', icon: <Globe size={15} />, color: '#14b8a6' },
  { id: 'product', title: 'Product & Technology', icon: <Lightbulb size={15} />, color: '#3b82f6' },
  { id: 'gtm', title: 'Go-to-Market Strategy', icon: <Rocket size={15} />, color: '#f59e0b' },
  { id: 'financials', title: 'Financial Projections', icon: <BarChart2 size={15} />, color: '#10b981' },
  { id: 'team', title: 'Team & Organization', icon: <Users size={15} />, color: '#ec4899' },
];

export default function BusinessPlan() {
  const { state } = useApp() as any;
  const {
    idea: ideaName = 'Your Startup',
    stage = 'Seed',
    revenue: mrr = 0,
    burn: burnRate = 0,
    capital: cashOnHand = 0,
    targetRaise = 0,
    cac = 0,
    ndr = 100,
    grossMargin = 70,
    growth: monthlyGrowth = 0,
    teamSize = 3,
    tam = 0,
    sam = 0,
    som = 0,
    founder: founderNames = '',
    founderBios = '',
    problem: problemStatement = '',
    solutionStatement = '',
    uniqueInsight = '',
    revenueModel = 'SaaS',
  } = state || {};

  const arr = mrr * 12;
  const ltv = state?.arpu ? Math.round(state.arpu / Math.max((state.churn || 1) / 100, 0.01)) : 0;
  const runwayMonths = cashOnHand ? Math.round(cashOnHand / Math.max(burnRate - mrr, 1)) : 0;
  const burnMultiple = arr > 0 ? Number(((burnRate * 12) / arr).toFixed(2)) : 0;
  const rule40 = Number((monthlyGrowth + (mrr > 0 ? ((mrr - burnRate) / mrr) * 100 : 0)).toFixed(0));

  const [openSection, setOpenSection] = useState<string>('executive');
  const contentRef = useRef<HTMLDivElement>(null);

  const exportHTML = () => {
    const html = document.getElementById('business-plan-content')?.innerHTML || '';
    const full = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>${ideaName} Business Plan</title>
<style>*{box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:900px;margin:0 auto;padding:40px;color:#1e293b;line-height:1.7}h1{font-size:2.4em;font-weight:900;margin-bottom:.2em}h2{font-size:1.4em;font-weight:700;margin:2em 0 .5em;border-bottom:2px solid #3b82f6;padding-bottom:.3em;color:#3b82f6}h3{font-size:1em;font-weight:700;margin:1.5em 0 .4em;color:#374151}p{margin:.5em 0}ul{padding-left:1.5em}li{margin:.3em 0}.metric{display:inline-flex;align-items:center;gap:.5em;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:.4em .8em;margin:.3em;font-size:.85em;font-weight:600}.highlight{background:linear-gradient(135deg,#3b82f615,#06b6d415);border:1px solid #3b82f640;border-radius:12px;padding:1.5em;margin:1.5em 0}table{width:100%;border-collapse:collapse}th,td{padding:.6em 1em;border-bottom:1px solid #e2e8f0;text-align:left}th{background:#f8fafc;font-weight:700}@media print{body{padding:20px}}</style></head>
<body>${html}</body></html>`;
    const blob = new Blob([full], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${ideaName.replace(/\s+/g, '-')}-business-plan.html`; a.click();
    URL.revokeObjectURL(url);
  };

  const useOfFundsData = [
    { name: 'Engineering & Product', value: 45, color: '#3b82f6' },
    { name: 'Sales & Marketing', value: 30, color: '#60a5fa' },
    { name: 'Operations & G&A', value: 15, color: '#14b8a6' },
    { name: 'R&D / Innovation', value: 10, color: '#f59e0b' },
  ];

  const projectedArr = [
    { year: 'Y1', arr: arr || mrr * 12 },
    { year: 'Y2', arr: (arr || mrr * 12) * (1 + monthlyGrowth / 100) ** 12 },
    { year: 'Y3', arr: (arr || mrr * 12) * (1 + monthlyGrowth / 100) ** 24 },
  ];

  const sectionContent: Record<string, React.ReactNode> = {
    executive: (
      <div className="space-y-5">
        <div className="p-5 rounded-[var(--radius-lg)] border border-[var(--accent)] border-opacity-30 bg-[var(--accent-dim)]">
          <h3 className="font-black text-base mb-2">Company Overview</h3>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            {ideaName} is a {stage}-stage {revenueModel} company{problemStatement ? ` solving ${problemStatement}` : ' tackling a significant market problem'}. {solutionStatement || 'Our product delivers clear, measurable value to customers.'}
          </p>
          {uniqueInsight && (
            <div className="mt-3 flex items-start gap-2">
              <Lightbulb size={14} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2 }} />
              <p className="text-sm text-[var(--text-secondary)] italic">{uniqueInsight}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Current ARR', value: fmt(arr || mrr * 12), color: 'var(--green)' },
            { label: 'MoM Growth', value: `${monthlyGrowth.toFixed(1)}%`, color: 'var(--blue)' },
            { label: 'Runway', value: `${runwayMonths}mo`, color: runwayMonths < 6 ? 'var(--red)' : 'var(--amber)' },
            { label: 'Target Raise', value: fmt(targetRaise), color: 'var(--accent)' },
          ].map(m => (
            <div key={m.label} className="p-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)] text-center">
              <div className="text-xl font-black" style={{ color: m.color }}>{m.value}</div>
              <div className="text-[10px] text-[var(--text-muted)] mt-1 uppercase tracking-wide">{m.label}</div>
            </div>
          ))}
        </div>

        <div>
          <h3 className="font-bold text-sm mb-3">Mission Statement</h3>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            Help {ideaName.toLowerCase().includes('pilot') ? 'founders and operators' : 'teams at ' + ideaName} make confident, data-driven decisions — and move fast without losing clarity on what actually matters.
          </p>
        </div>

        <div>
          <h3 className="font-bold text-sm mb-3">Key Investment Highlights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              `${revenueModel} recurring revenue with ${fmtPct(grossMargin)} gross margins`,
              `${monthlyGrowth.toFixed(1)}% MoM growth — T2D3 trajectory`,
              `LTV:CAC ratio of ${ltv > 0 && cac > 0 ? (ltv / cac).toFixed(1) : '3.0'}× — above industry average`,
              `${teamSize}-person team with deep domain expertise`,
              `${fmt(tam)} TAM across ${Math.ceil(tam / Math.max(sam, 1))} addressable verticals`,
              `${runwayMonths >= 18 ? 'Well-funded with 18+ months runway' : `Raise extends runway to 24+ months`}`,
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                <span className="text-[var(--green)] mt-0.5">✓</span> {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    market: (
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'TAM', sublabel: 'Total Addressable Market', value: fmt(tam || 5e9), desc: 'The full global demand for the category of solution you\'re building.', color: '#3b82f6' },
            { label: 'SAM', sublabel: 'Serviceable Addressable Market', value: fmt(sam || (tam * 0.15) || 750e6), desc: 'The portion of TAM you can realistically reach with your current model.', color: '#60a5fa' },
            { label: 'SOM', sublabel: 'Serviceable Obtainable Market', value: fmt(som || (sam * 0.1) || 75e6), desc: 'Realistic 3-5 year market capture given GTM and competitive dynamics.', color: '#10b981' },
          ].map(m => (
            <div key={m.label} className="p-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)] space-y-2">
              <div className="font-black text-2xl" style={{ color: m.color }}>{m.value}</div>
              <div>
                <div className="font-bold text-sm">{m.label}</div>
                <div className="text-[10px] text-[var(--text-muted)]">{m.sublabel}</div>
              </div>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>

        <div>
          <h3 className="font-bold text-sm mb-3">Market Drivers</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { title: 'Digital Transformation', desc: 'Enterprises accelerating SaaS adoption post-pandemic, replacing legacy tools with modern cloud-native alternatives.' },
              { title: 'AI & Automation Wave', desc: 'LLMs and foundation models unlocking new capabilities at dramatically lower costs, enabling products previously impossible.' },
              { title: 'Data-Driven Decision Making', desc: 'Operators demanding real-time analytics and predictive insights rather than backward-looking reporting.' },
              { title: 'Regulatory Tailwinds', desc: 'Compliance requirements driving mandatory investment in modern tooling across regulated industries.' },
            ].map((d, i) => (
              <div key={i} className="p-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[rgba(255,255,255,0.02)]">
                <div className="font-bold text-xs mb-1" style={{ color: 'var(--accent)' }}>{d.title}</div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">{d.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-bold text-sm mb-3">Competitive Positioning</h3>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
            The competitive landscape is fragmented between legacy point solutions and expensive enterprise suites. {ideaName} occupies the intersection of ease-of-use and enterprise depth — a position that neither incumbents nor early-stage startups can easily replicate.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'vs. Legacy Vendors', advantage: '10× faster deployment, modern UI/UX, no implementation fees' },
              { label: 'vs. Point Solutions', advantage: 'End-to-end workflow vs. siloed tools, unified data model' },
            ].map((c, i) => (
              <div key={i} className="p-3 rounded-[var(--radius-md)] bg-[var(--green-dim)] border border-[rgba(16,185,129,0.2)]">
                <div className="text-xs font-bold text-[var(--green)] mb-1">{c.label}</div>
                <p className="text-xs text-[var(--text-muted)]">{c.advantage}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    product: (
      <div className="space-y-5">
        <div className="p-5 rounded-[var(--radius-lg)] bg-[var(--accent-dim)] border border-[rgba(59,130,246,0.25)]">
          <h3 className="font-bold text-sm mb-2">Core Value Proposition</h3>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            {solutionStatement || `${ideaName} gives teams a single place to track what matters, model scenarios, and communicate clearly with investors — without the spreadsheet chaos most early-stage companies live in.`}
          </p>
        </div>

        <div>
          <h3 className="font-bold text-sm mb-3">Product Architecture</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { title: 'Core Platform', items: ['Real-time data ingestion', 'ML-powered analytics engine', 'API-first architecture', 'Multi-tenant SaaS infrastructure'] },
              { title: 'User Experience', items: ['Zero-configuration onboarding', 'Contextual AI assistance', 'Mobile-responsive dashboard', 'Keyboard-first power user mode'] },
              { title: 'Integrations', items: ['Native CRM connectors', 'Webhook & REST API', 'Zapier / Make automation', 'SSO & enterprise auth'] },
            ].map((p, i) => (
              <div key={i} className="p-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)]">
                <div className="font-bold text-sm mb-3" style={{ color: 'var(--accent)' }}>{p.title}</div>
                <ul className="space-y-1.5">
                  {p.items.map((item, j) => (
                    <li key={j} className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shrink-0" />{item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-bold text-sm mb-3">Defensibility & Moat</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: '🔒', title: 'Data Network Effects', desc: 'Platform improves with more usage — benchmarks and AI accuracy increase with scale' },
              { icon: '⚡', title: 'Switching Costs', desc: 'Deep workflow integration creates high switching friction after 90-day adoption' },
              { icon: '🧠', title: 'Proprietary AI', desc: 'Models trained on domain-specific data unavailable to competitors' },
              { icon: '🤝', title: 'Distribution', desc: 'Community-led growth and viral loops embedded in core product design' },
            ].map((m, i) => (
              <div key={i} className="p-3 rounded-[var(--radius-md)] border border-[var(--border)] text-center">
                <div className="text-2xl mb-2">{m.icon}</div>
                <div className="font-bold text-xs mb-1">{m.title}</div>
                <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    gtm: (
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { phase: 'Phase 1', title: 'Product-Led Growth', timeline: '0-6 months', focus: 'Free tier virality, community building, developer advocates', kpi: '1K MAU' },
            { phase: 'Phase 2', title: 'Sales-Assisted Growth', timeline: '6-18 months', focus: 'SDR team, content marketing, partnership channels', kpi: '$1M ARR' },
            { phase: 'Phase 3', title: 'Enterprise Expansion', timeline: '18+ months', focus: 'Enterprise sales, strategic partnerships, international', kpi: '$10M ARR' },
          ].map((p, i) => (
            <div key={i} className="p-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)]">
              <div className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-widest mb-1">{p.phase}</div>
              <div className="font-bold text-sm mb-0.5">{p.title}</div>
              <div className="text-[10px] text-[var(--text-muted)] mb-2">{p.timeline}</div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-3">{p.focus}</p>
              <div className="px-2 py-1 rounded-full text-[10px] font-bold inline-block bg-[var(--green-dim)] text-[var(--green)]">Target: {p.kpi}</div>
            </div>
          ))}
        </div>

        <div>
          <h3 className="font-bold text-sm mb-3">Pricing Strategy</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { tier: 'Free', price: '$0/mo', features: ['Core features', 'Up to 5 users', 'Community support', 'Public benchmarks'], color: 'var(--text-muted)', tag: 'Viral Distribution' },
              { tier: 'Pro', price: '$49/mo', features: ['All Free features', 'Unlimited users', 'Priority support', 'Advanced analytics', 'API access'], color: 'var(--accent)', tag: 'Most Popular' },
              { tier: 'Enterprise', price: 'Custom', features: ['All Pro features', 'SSO & SAML', 'SLA & uptime', 'Custom integrations', 'Dedicated CSM'], color: 'var(--amber)', tag: 'White-Label' },
            ].map((p, i) => (
              <div key={i} className="p-4 rounded-[var(--radius-lg)] border bg-[var(--bg-card)] relative" style={{ borderColor: i === 1 ? 'var(--accent)' : 'var(--border)' }}>
                {i === 1 && <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-black px-2 py-0.5 rounded-full bg-[var(--accent)] text-white">{p.tag}</div>}
                <div className="font-black text-base mb-0.5" style={{ color: p.color }}>{p.tier}</div>
                <div className="text-xl font-black mb-3">{p.price}</div>
                <ul className="space-y-1.5">
                  {p.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                      <span className="text-[var(--green)]">✓</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    financials: (
      <div className="space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Current ARR', value: fmt(arr || mrr * 12), color: 'var(--green)', sub: 'Annual Recurring Revenue' },
            { label: 'Gross Margin', value: `${grossMargin.toFixed(0)}%`, color: grossMargin >= 65 ? 'var(--green)' : 'var(--amber)', sub: 'Target: 65%+' },
            { label: 'Burn Multiple', value: `${burnMultiple.toFixed(1)}×`, color: burnMultiple <= 1.5 ? 'var(--green)' : burnMultiple <= 2.5 ? 'var(--amber)' : 'var(--red)', sub: 'Target: < 1.5×' },
            { label: 'Rule of 40', value: `${rule40.toFixed(0)}`, color: rule40 >= 40 ? 'var(--green)' : rule40 >= 20 ? 'var(--amber)' : 'var(--red)', sub: 'Target: 40+' },
          ].map(m => (
            <div key={m.label} className="p-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)] text-center">
              <div className="text-xl font-black" style={{ color: m.color }}>{m.value}</div>
              <div className="text-xs font-bold text-[var(--text-primary)] mt-1">{m.label}</div>
              <div className="text-[9px] text-[var(--text-muted)] mt-0.5">{m.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Revenue projections */}
          <div className="p-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)]">
            <div className="font-bold text-sm mb-4">Revenue Projections</div>
            <div className="flex items-end gap-3" style={{ height: 120 }}>
              {projectedArr.map((d, i) => {
                const maxVal = Math.max(...projectedArr.map(p => p.arr), 1);
                const barH = Math.max(8, (d.arr / maxVal) * 100);
                const colors = ['#3b82f6', '#60a5fa', '#10b981'];
                return (
                  <div key={d.year} className="flex-1 flex flex-col items-center gap-1">
                    <div className="text-xs font-bold" style={{ color: colors[i] }}>{fmt(d.arr)}</div>
                    <div className="w-full rounded-t-sm transition-all" style={{ height: barH, background: colors[i] }} />
                    <div className="text-[10px] text-[var(--text-muted)] font-bold">{d.year}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Use of funds */}
          {targetRaise > 0 && (
            <div className="p-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)]">
              <div className="font-bold text-sm mb-2">Use of Funds — {fmt(targetRaise)}</div>
              <div className="flex items-center gap-4">
                <ResponsiveContainer width={120} height={120}>
                  <PieChart>
                    <Pie data={useOfFundsData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" strokeWidth={0}>
                      {useOfFundsData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-1.5">
                  {useOfFundsData.map((d, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                        <span className="text-xs text-[var(--text-muted)]">{d.name}</span>
                      </div>
                      <span className="text-xs font-bold" style={{ color: d.color }}>{d.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div>
          <h3 className="font-bold text-sm mb-3">Path to Profitability</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { milestone: 'Break-even', timeline: '$500K MRR', desc: 'Fixed cost coverage at current burn, assuming gross margin expansion to 72%' },
              { milestone: 'Free Cash Flow+', timeline: '$1M MRR', desc: 'Positive FCF enables self-funded growth and eliminates dilution pressure' },
              { milestone: 'IPO-Ready', timeline: '$50M ARR', desc: 'Rule of 40 ≥ 40, sustainable growth at scale with institutional-grade financials' },
            ].map((m, i) => (
              <div key={i} className="p-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-card)]">
                <div className="font-bold text-xs mb-0.5" style={{ color: 'var(--accent)' }}>{m.milestone}</div>
                <div className="text-sm font-black mb-1">{m.timeline}</div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    team: (
      <div className="space-y-5">
        {founderNames && (
          <div className="p-5 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)]">
            <h3 className="font-bold text-sm mb-3">Leadership Team</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {founderNames.split(',').map((name: string, i: number) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--accent-dim)] flex items-center justify-center text-[var(--accent)] font-black text-sm shrink-0">
                    {name.trim()[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <div className="font-bold text-sm">{name.trim()}</div>
                    <div className="text-xs text-[var(--text-muted)] mt-0.5">{founderBios?.split(',')[i]?.trim() || 'Co-Founder'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="font-bold text-sm mb-3">Hiring Plan</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { phase: 'Now → Series A', roles: ['Senior Full-Stack Engineer', 'Head of Sales', 'Product Designer', 'Data Scientist'], headcount: teamSize },
              { phase: 'Post-Series A (6mo)', roles: ['VP Engineering', 'VP Marketing', 'Customer Success Lead', 'Finance/Ops Manager'], headcount: teamSize + 8 },
              { phase: 'Scale (12-18mo)', roles: ['CRO / Revenue Lead', 'Enterprise AEs (×3)', 'SDR team (×4)', 'ML Engineer (×2)'], headcount: teamSize + 20 },
            ].map((p, i) => (
              <div key={i} className="p-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)]">
                <div className="font-bold text-xs mb-1" style={{ color: 'var(--accent)' }}>{p.phase}</div>
                <div className="text-sm font-black mb-3">{p.headcount} people</div>
                <ul className="space-y-1">
                  {p.roles.map((r, j) => (
                    <li key={j} className="text-xs text-[var(--text-muted)] flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-light)] shrink-0" />{r}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-bold text-sm mb-3">Advisory Board</h3>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            We are actively building an advisory board with expertise in {revenueModel}, enterprise sales, and the target vertical. Advisors provide strategic guidance, customer introductions, and help validate product direction — typically compensated with 0.1–0.5% advisory equity on a 2-year vest.
          </p>
        </div>
      </div>
    ),
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <PageHeader
        title="Business Plan"
        subtitle={`${ideaName} · ${stage} · ${new Date().getFullYear()}`}
        badge={{ label: revenueModel, variant: 'default' }}
        action={<Button variant="secondary" size="sm" icon={<Download size={14} />} onClick={exportHTML}>Export HTML</Button>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
        {/* Navigation sidebar */}
        <div className="space-y-1">
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => setOpenSection(s.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] border text-left transition-all"
              style={{
                background: openSection === s.id ? `${s.color}15` : 'transparent',
                borderColor: openSection === s.id ? s.color : 'transparent',
                color: openSection === s.id ? 'var(--text-primary)' : 'var(--text-muted)',
              }}>
              <span style={{ color: openSection === s.id ? s.color : 'inherit' }}>{s.icon}</span>
              <span className="text-sm font-medium">{s.title}</span>
              {openSection === s.id && <ChevronRight size={12} className="ml-auto" style={{ color: s.color }} />}
            </button>
          ))}
        </div>

        {/* Content */}
        <div id="business-plan-content" ref={contentRef}>
          <AnimatePresence mode="wait">
            <motion.div key={openSection} initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <Card>
                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[var(--border)]">
                  <div className="w-9 h-9 rounded-[var(--radius-lg)] flex items-center justify-center"
                    style={{ background: `${SECTIONS.find(s => s.id === openSection)?.color}20`, color: SECTIONS.find(s => s.id === openSection)?.color }}>
                    {SECTIONS.find(s => s.id === openSection)?.icon}
                  </div>
                  <div>
                    <h2 className="font-black text-base">{SECTIONS.find(s => s.id === openSection)?.title}</h2>
                    <p className="text-xs text-[var(--text-muted)]">{ideaName} — {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>
                {sectionContent[openSection]}
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function fmtPct(n: number) { return `${n.toFixed(1)}%`; }
