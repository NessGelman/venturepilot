import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Filter, X, TrendingUp, Info, ChevronDown, BarChart2, Target, DollarSign, ArrowUp, ArrowDown } from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid
} from 'recharts';
import { PageHeader, Card, Badge, Button, MetricTooltip } from '../components/Shared';

interface BenchmarkSector {
  id: string;
  name: string;
  color: string;
  description: string;
  companies: string;
  metrics: {
    medianArr: number;
    medianGrowth: number;
    medianGrossMargin: number;
    medianNDR: number;
    medianLTVCAC: number;
    medianBurnMultiple: number;
    medianRule40: number;
    medianCAC: number;
    medianMagicNumber: number;
    medianPayback: number;
  };
  radarData: { metric: string; p25: number; median: number; p75: number }[];
}

const SECTORS: BenchmarkSector[] = [
  {
    id: 'b2b-saas', name: 'B2B SaaS', color: '#3b82f6', description: 'Horizontal and vertical SaaS applications for business workflows',
    companies: 'Salesforce, HubSpot, Zendesk, Slack, Notion, Linear',
    metrics: { medianArr: 2500000, medianGrowth: 18, medianGrossMargin: 73, medianNDR: 118, medianLTVCAC: 4.2, medianBurnMultiple: 1.4, medianRule40: 42, medianCAC: 8500, medianMagicNumber: 0.82, medianPayback: 14 },
    radarData: [
      { metric: 'Growth', p25: 12, median: 18, p75: 32 },
      { metric: 'Gross Margin', p25: 65, median: 73, p75: 82 },
      { metric: 'NDR', p25: 105, median: 118, p75: 135 },
      { metric: 'Efficiency', p25: 25, median: 42, p75: 62 },
      { metric: 'Unit Econ', p25: 60, median: 75, p75: 90 },
      { metric: 'Capital Eff', p25: 45, median: 65, p75: 85 },
    ],
  },
  {
    id: 'fintech', name: 'Fintech', color: '#3b82f6', description: 'Payments, lending, insurance, wealth management, and banking infrastructure',
    companies: 'Stripe, Brex, Plaid, Chime, Robinhood, Ramp',
    metrics: { medianArr: 5000000, medianGrowth: 28, medianGrossMargin: 52, medianNDR: 125, medianLTVCAC: 3.1, medianBurnMultiple: 2.1, medianRule40: 38, medianCAC: 18000, medianMagicNumber: 0.65, medianPayback: 22 },
    radarData: [
      { metric: 'Growth', p25: 18, median: 28, p75: 55 },
      { metric: 'Gross Margin', p25: 40, median: 52, p75: 68 },
      { metric: 'NDR', p25: 110, median: 125, p75: 145 },
      { metric: 'Efficiency', p25: 18, median: 38, p75: 58 },
      { metric: 'Unit Econ', p25: 45, median: 62, p75: 80 },
      { metric: 'Capital Eff', p25: 30, median: 50, p75: 72 },
    ],
  },
  {
    id: 'devtools', name: 'Dev Tools / Infra', color: '#14b8a6', description: 'Developer tooling, APIs, cloud infrastructure, and platform services',
    companies: 'HashiCorp, Twilio, Cloudflare, GitHub, Vercel, Supabase',
    metrics: { medianArr: 3500000, medianGrowth: 35, medianGrossMargin: 78, medianNDR: 128, medianLTVCAC: 5.8, medianBurnMultiple: 1.1, medianRule40: 55, medianCAC: 5500, medianMagicNumber: 1.1, medianPayback: 10 },
    radarData: [
      { metric: 'Growth', p25: 22, median: 35, p75: 65 },
      { metric: 'Gross Margin', p25: 68, median: 78, p75: 88 },
      { metric: 'NDR', p25: 112, median: 128, p75: 148 },
      { metric: 'Efficiency', p25: 35, median: 55, p75: 80 },
      { metric: 'Unit Econ', p25: 70, median: 85, p75: 95 },
      { metric: 'Capital Eff', p25: 55, median: 72, p75: 90 },
    ],
  },
  {
    id: 'ai-ml', name: 'AI / ML', color: '#f59e0b', description: 'AI applications, ML platforms, foundation model companies, and AI infrastructure',
    companies: 'OpenAI, Anthropic, Cohere, Scale AI, Weights & Biases, Hugging Face',
    metrics: { medianArr: 8000000, medianGrowth: 55, medianGrossMargin: 65, medianNDR: 145, medianLTVCAC: 3.8, medianBurnMultiple: 3.2, medianRule40: 48, medianCAC: 22000, medianMagicNumber: 0.75, medianPayback: 28 },
    radarData: [
      { metric: 'Growth', p25: 35, median: 55, p75: 120 },
      { metric: 'Gross Margin', p25: 50, median: 65, p75: 80 },
      { metric: 'NDR', p25: 120, median: 145, p75: 180 },
      { metric: 'Efficiency', p25: 25, median: 48, p75: 75 },
      { metric: 'Unit Econ', p25: 50, median: 68, p75: 85 },
      { metric: 'Capital Eff', p25: 20, median: 42, p75: 68 },
    ],
  },
];

const METRIC_KEYS: { key: keyof BenchmarkSector['metrics']; label: string; format: (v: number) => string; higherBetter: boolean; tooltip: string }[] = [
  { key: 'medianArr', label: 'Median ARR', format: v => v >= 1e6 ? `$${(v/1e6).toFixed(1)}M` : `$${(v/1e3).toFixed(0)}K`, higherBetter: true, tooltip: 'Annual Recurring Revenue at median for this sector at Series A stage' },
  { key: 'medianGrowth', label: 'YoY Growth', format: v => `${v}%`, higherBetter: true, tooltip: 'Year-over-year ARR growth rate at Series A/B stage' },
  { key: 'medianGrossMargin', label: 'Gross Margin', format: v => `${v}%`, higherBetter: true, tooltip: 'Revenue minus COGS as a percentage of revenue' },
  { key: 'medianNDR', label: 'NDR', format: v => `${v}%`, higherBetter: true, tooltip: 'Net Dollar Retention — measures expansion minus churn' },
  { key: 'medianLTVCAC', label: 'LTV:CAC', format: v => `${v.toFixed(1)}×`, higherBetter: true, tooltip: 'Lifetime Value to Customer Acquisition Cost ratio' },
  { key: 'medianBurnMultiple', label: 'Burn Multiple', format: v => `${v.toFixed(1)}×`, higherBetter: false, tooltip: 'Net burn divided by net new ARR — lower is more efficient' },
  { key: 'medianRule40', label: 'Rule of 40', format: v => `${v}`, higherBetter: true, tooltip: 'Growth rate + profit margin — target 40+' },
  { key: 'medianPayback', label: 'CAC Payback', format: v => `${v}mo`, higherBetter: false, tooltip: 'Months to recover customer acquisition cost' },
];

function CompareBar({ value, benchmark, format, higherBetter }: { value: number; benchmark: number; format: (v: number) => string; higherBetter: boolean }) {
  const ratio = benchmark > 0 ? value / benchmark : 0;
  const isGood = higherBetter ? value >= benchmark : value <= benchmark;
  const color = isGood ? 'var(--green)' : value >= benchmark * 0.8 && higherBetter ? 'var(--amber)' : !higherBetter && value <= benchmark * 1.2 ? 'var(--amber)' : 'var(--red)';
  const pct = Math.min(ratio * 50, 100);

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-[var(--border)] rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }}
          className="h-full rounded-full" style={{ background: color }} />
      </div>
      <div className="flex items-center gap-1.5 w-24 justify-end">
        <span className="text-sm font-bold" style={{ color }}>{format(value)}</span>
        {isGood ? <ArrowUp size={12} style={{ color: 'var(--green)' }} /> : <ArrowDown size={12} style={{ color: 'var(--red)' }} />}
      </div>
    </div>
  );
}

export default function MarketBench() {
  const { state, derived } = useApp() as any;
  // Use correct field names from state and derived metrics
  const revenue = state?.revenue ?? 0;
  const growth = state?.growth ?? 0;
  const grossMargin = state?.grossMargin ?? 70;
  const ndr = state?.ndr ?? 100;
  const cac = state?.cac ?? 0;
  const arr = derived?.arr ?? (revenue * 12);
  const ltv = derived?.ltv ?? 0;
  const burnMultiple = derived?.burnMultiple ?? 0;
  const ruleOf40 = derived?.ruleOf40 ?? 0;
  const payback = derived?.payback ?? 0;
  // Convert monthly growth to annual YoY% for comparison with annual benchmarks
  const annualGrowth = Number(((Math.pow(1 + growth / 100, 12) - 1) * 100).toFixed(1));

  const [selectedSector, setSelectedSector] = useState('b2b-saas');
  const [modalSector, setModalSector] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'compare' | 'radar'>('overview');

  const sector = SECTORS.find(s => s.id === selectedSector)!;
  const modalData = SECTORS.find(s => s.id === modalSector);

  const userMetrics = {
    medianArr: arr,
    medianGrowth: annualGrowth,
    medianGrossMargin: grossMargin,
    medianNDR: ndr,
    medianLTVCAC: cac > 0 && ltv > 0 ? ltv / cac : 0,
    medianBurnMultiple: burnMultiple,
    medianRule40: ruleOf40,
    medianPayback: payback,
    medianCAC: cac,
    medianMagicNumber: state?.magicNumber ?? 0,
  };

  const comparisonData = METRIC_KEYS.map(m => ({
    ...m,
    yourValue: userMetrics[m.key],
    benchmark: sector.metrics[m.key],
  }));

  // Radar comparison data
  const radarCompare = sector.radarData.map(d => ({
    metric: d.metric,
    Benchmark: d.median,
    'P75 Top': d.p75,
    'P25 Bottom': d.p25,
  }));

  const allSectorsBar = SECTORS.map(s => ({
    name: s.name.replace(' / ', '/'),
    growth: s.metrics.medianGrowth,
    ndr: s.metrics.medianNDR,
    rule40: s.metrics.medianRule40,
    color: s.color,
  }));

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <PageHeader
        icon={BarChart2}
        title="Benchmarks"
        subtitle="See where you stack up"
        badge={<Badge color={sector.color} size="sm">{sector.name}</Badge>}
      />

      {/* Sector selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {SECTORS.map(s => (
          <motion.button key={s.id} onClick={() => setSelectedSector(s.id)} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}
            className="p-4 rounded-[var(--radius-lg)] border text-left transition-all relative overflow-hidden"
            style={{ background: selectedSector === s.id ? `${s.color}15` : 'var(--bg-card)', borderColor: selectedSector === s.id ? s.color : 'var(--border)' }}>
            {selectedSector === s.id && <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: s.color }} />}
            <div className="font-bold text-sm mb-0.5" style={{ color: selectedSector === s.id ? s.color : 'var(--text-primary)' }}>{s.name}</div>
            <div className="text-[10px] text-[var(--text-muted)] leading-tight line-clamp-2">{s.description}</div>
            <div className="mt-2 text-[10px] font-bold" style={{ color: s.color }}>{s.metrics.medianGrowth}% med. growth</div>
          </motion.button>
        ))}
      </div>

      {/* Tab navigation */}
      <div className="flex items-center gap-1 p-1 rounded-[var(--radius-lg)] bg-[var(--bg-card)] border border-[var(--border)] w-fit">
        {(['overview', 'compare', 'radar'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className="px-4 py-1.5 rounded-[var(--radius-md)] text-xs font-bold capitalize transition-all"
            style={{ background: activeTab === tab ? sector.color : 'transparent', color: activeTab === tab ? 'white' : 'var(--text-muted)' }}>
            {tab}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-black text-base">{sector.name} Benchmarks</h3>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">Median metrics at Series A/B stage</p>
                  </div>
                  <Badge color="var(--accent-light)" size="sm">{sector.companies.split(',').length} companies</Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {METRIC_KEYS.slice(0, 8).map(m => (
                    <div key={m.key} className="p-3 rounded-[var(--radius-md)] bg-[var(--bg-base)] border border-[var(--border)]">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest">{m.label}</span>
                        <MetricTooltip term={m.label} definition={m.tooltip} />
                      </div>
                      <div className="text-xl font-black" style={{ color: sector.color }}>{m.format(sector.metrics[m.key])}</div>
                      <div className="text-[9px] text-[var(--text-muted)] mt-0.5">Industry median</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-[var(--border-subtle)]">
                  <p className="text-xs text-[var(--text-muted)]">
                    <span className="font-bold text-[var(--text-secondary)]">Representative companies: </span>{sector.companies}
                  </p>
                </div>
              </Card>

              {/* Cross-sector bar charts */}
              <Card>
                <h3 className="font-bold text-sm mb-4">Cross-Sector Comparison</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { title: 'YoY Growth Rate', key: 'growth' as const, suffix: '%' },
                    { title: 'Net Dollar Retention', key: 'ndr' as const, suffix: '%' },
                    { title: 'Rule of 40 Score', key: 'rule40' as const, suffix: '' },
                  ].map(chart => (
                    <div key={chart.key}>
                      <div className="text-xs font-bold text-[var(--text-muted)] mb-3">{chart.title}</div>
                      <ResponsiveContainer width="100%" height={140}>
                        <BarChart data={allSectorsBar} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                          <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 9, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={28} />
                          <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 11 }} formatter={(v: any) => [`${v}${chart.suffix}`, chart.title]} />
                          <Bar dataKey={chart.key} radius={[3, 3, 0, 0]}>
                            {allSectorsBar.map((entry, i) => (
                              <Cell key={i} fill={entry.color} opacity={entry.name.includes(sector.name.split(' ')[0]) ? 1 : 0.5} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Compare Tab */}
          {activeTab === 'compare' && (
            <Card>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-bold text-sm">Your Metrics vs. {sector.name} Benchmarks</h3>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">Update your metrics in the sidebar to see personalized comparison</p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[var(--green)]" />Above benchmark</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[var(--red)]" />Below benchmark</span>
                </div>
              </div>
              <div className="space-y-4">
                {comparisonData.map((m, i) => (
                  <div key={m.key}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[var(--text-primary)]">{m.label}</span>
                        <MetricTooltip term={m.label} definition={m.tooltip} />
                      </div>
                      <div className="text-xs text-[var(--text-muted)]">Benchmark: <span className="font-bold text-[var(--text-secondary)]">{m.format(m.benchmark)}</span></div>
                    </div>
                    {m.yourValue > 0 ? (
                      <CompareBar value={m.yourValue} benchmark={m.benchmark} format={m.format} higherBetter={m.higherBetter} />
                    ) : (
                      <div className="h-2 bg-[var(--border)] rounded-full overflow-hidden">
                        <div className="h-full w-px bg-[var(--text-muted)] mx-auto" />
                      </div>
                    )}
                    {i < comparisonData.length - 1 && <div className="mt-3 border-b border-[var(--border-subtle)]" />}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Radar Tab */}
          {activeTab === 'radar' && (
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm">{sector.name} Performance Distribution</h3>
                <div className="flex items-center gap-3 text-[10px]">
                  <span className="flex items-center gap-1"><span className="w-2 h-0.5 rounded" style={{ background: sector.color }} />P75</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-0.5 rounded border-dashed" style={{ borderTop: `1px dashed ${sector.color}`, borderWidth: '1px 0 0 0' }} />Median</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-0.5 rounded opacity-40" style={{ background: sector.color }} />P25</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={380}>
                <RadarChart data={sector.radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.06)" />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                  <Radar name="P75 Top" dataKey="p75" stroke={sector.color} fill={sector.color} fillOpacity={0.15} strokeWidth={1.5} strokeDasharray="4 2" />
                  <Radar name="Median" dataKey="median" stroke={sector.color} fill={sector.color} fillOpacity={0.25} strokeWidth={2} />
                  <Radar name="P25 Bottom" dataKey="p25" stroke={sector.color} fill="transparent" fillOpacity={0} strokeWidth={1} strokeDasharray="2 4" strokeOpacity={0.5} />
                  <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 11 }} />
                </RadarChart>
              </ResponsiveContainer>
              <div className="mt-4 p-4 rounded-[var(--radius-lg)] bg-[rgba(255,255,255,0.02)] border border-[var(--border)]">
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  <span className="font-bold text-[var(--text-secondary)]">How to read this: </span>
                  The radar shows the 25th percentile (bottom), median, and 75th percentile (top) for {sector.name} companies at Series A/B stage across 6 key performance dimensions. Aim to be at or above the median across all dimensions before fundraising.
                </p>
              </div>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Sector detail cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {SECTORS.map(s => (
          <button key={s.id} onClick={() => setModalSector(s.id)}
            className="p-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)] text-left hover:border-[var(--accent)] transition-all group">
            <div className="font-bold text-sm mb-1 group-hover:text-[var(--accent)] transition-colors" style={{ color: s.color }}>{s.name}</div>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-3">{s.description}</p>
            <div className="flex gap-3">
              <div><div className="text-[9px] text-[var(--text-muted)] mb-0.5">Growth</div><div className="text-sm font-bold" style={{ color: s.color }}>{s.metrics.medianGrowth}%</div></div>
              <div><div className="text-[9px] text-[var(--text-muted)] mb-0.5">NDR</div><div className="text-sm font-bold" style={{ color: s.color }}>{s.metrics.medianNDR}%</div></div>
              <div><div className="text-[9px] text-[var(--text-muted)] mb-0.5">R40</div><div className="text-sm font-bold" style={{ color: s.color }}>{s.metrics.medianRule40}</div></div>
            </div>
          </button>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalSector && modalData && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)' }}
            onClick={() => setModalSector(null)}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-xl)] p-6 w-full max-w-2xl shadow-[var(--shadow-elevated)] max-h-[80vh] overflow-y-auto custom-scrollbar"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-black text-base" style={{ color: modalData.color }}>{modalData.name}</h3>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">{modalData.description}</p>
                </div>
                <button onClick={() => setModalSector(null)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-lg">✕</button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                {METRIC_KEYS.map(m => (
                  <div key={m.key} className="p-3 rounded-[var(--radius-md)] bg-[var(--bg-base)] border border-[var(--border)] text-center">
                    <div className="text-lg font-black" style={{ color: modalData.color }}>{m.format(modalData.metrics[m.key])}</div>
                    <div className="text-[9px] text-[var(--text-muted)] mt-0.5">{m.label}</div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-[var(--text-muted)]"><span className="font-bold text-[var(--text-secondary)]">Notable companies: </span>{modalData.companies}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
