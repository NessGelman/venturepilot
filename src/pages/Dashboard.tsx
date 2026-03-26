import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Card, PageHeader, StatCard, SectionHeader, Badge, Button, AlertBanner, AIButton, MetricTooltip, CountUp
} from '../components/Shared';
import {
  Activity, Download, Zap, BarChart2, TrendingUp, ShieldCheck, PieChart,
  Target, CalendarDays, AlertTriangle, Layers, Flame
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, BarChart, Bar, ReferenceLine
} from 'recharts';
import type { TimelineMilestone } from '../types/AppContext.types';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg)] p-3 shadow-[var(--shadow-elevated)] font-mono text-xs">
      <p className="text-[var(--text-muted)] mb-2 font-sans font-bold">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="flex justify-between gap-4">
          <span>{p.name}</span>
          <span className="font-bold">${p.value?.toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const app = useApp();
  const [showRaise, setShowRaise] = useState(false);
  const [raiseAmt, setRaiseAmt] = useState(app.targetRaise || 750000);

  // Radar data
  const radarData = useMemo(() => [
    { subject: 'Growth', A: Math.min(app.growth * 5, 100) },
    { subject: 'Margin', A: Math.min(app.grossMargin, 100) },
    { subject: 'Efficiency', A: Math.max(0, 100 - app.derived.burnMultiple * 20) },
    { subject: 'Runway', A: Math.min(app.derived.runwayMonths * 5, 100) },
    { subject: 'Retention', A: Math.min(app.ndr, 150) / 1.5 },
    { subject: 'Pipeline', A: Math.min(app.derived.pipelineCoverage, 300) / 3 },
  ], [app]);

  // Projection data
  const projectionData = useMemo(() => {
    const data = [];
    let cash = app.capital + (showRaise ? raiseAmt : 0);
    let rev = app.revenue;
    for (let m = 0; m <= 18; m++) {
      if (m > 0) { cash -= Math.max(app.burn - rev, 0); rev *= (1 + app.growth / 100); }
      data.push({ month: `M${m}`, cash: Math.max(cash, 0), revenue: Math.round(rev), burn: app.burn });
    }
    return data;
  }, [app, showRaise, raiseAmt]);

  // Monte Carlo
  const { histogram, riskBadge, survivalRate } = useMemo(() => {
    const TRIALS = 2500;
    const results: number[] = [];
    let survived = 0;
    for (let i = 0; i < TRIALS; i++) {
      let cash = app.capital, rev = app.revenue;
      let months = 0;
      while (cash > 0 && months < 36) {
        cash -= Math.max((app.burn * (1 + (Math.random() * 0.2 - 0.1))) - rev, 0);
        rev *= (1 + (app.growth / 100) * (1 + (Math.random() * 0.3 - 0.15)));
        months++;
      }
      results.push(months);
      if (months >= 24) survived++;
    }
    const sr = Math.round((survived / TRIALS) * 100);
    const bins = [0, 0, 0, 0, 0, 0];
    results.forEach(m => {
      if (m < 6) bins[0]++;
      else if (m < 12) bins[1]++;
      else if (m < 18) bins[2]++;
      else if (m < 24) bins[3]++;
      else if (m < 30) bins[4]++;
      else bins[5]++;
    });
    const histogram = [
      { name: '<6m', count: bins[0], fill: '#ef4444' },
      { name: '6-12m', count: bins[1], fill: '#f59e0b' },
      { name: '12-18m', count: bins[2], fill: '#f59e0b' },
      { name: '18-24m', count: bins[3], fill: '#10b981' },
      { name: '24-30m', count: bins[4], fill: '#10b981' },
      { name: '>30m', count: bins[5], fill: '#34d399' },
    ];
    const riskBadge = sr > 75
      ? { label: 'Safe', color: 'var(--green)' }
      : sr > 40
      ? { label: 'Caution', color: 'var(--amber)' }
      : { label: 'High Risk', color: 'var(--red)' };
    return { histogram, riskBadge, survivalRate: sr };
  }, [app]);

  const exportCSV = () => {
    const rows = [
      ['Metric', 'Value', 'Unit'],
      ['Company', app.idea, ''],
      ['Stage', app.stage, ''],
      ['Runway', app.derived.runwayMonths, 'months'],
      ['Cash Remaining', app.capital, 'USD'],
      ['MRR', app.revenue, 'USD'],
      ['ARR', app.derived.arr, 'USD'],
      ['Gross Margin', app.grossMargin, '%'],
      ['NDR', app.ndr, '%'],
      ['Burn Multiple', app.derived.burnMultiple, 'x'],
      ['Rule of 40', app.derived.ruleOf40, '%'],
      ['LTV', app.derived.ltv, 'USD'],
      ['CAC', app.cac, 'USD'],
      ['LTV/CAC', (app.derived.ltv / Math.max(app.cac, 1)).toFixed(2), 'x'],
      ['Implied Valuation', app.derived.impliedValuation, 'USD'],
    ];
    const blob = new Blob([rows.map(r => r.join(',')).join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `venturepilot-${app.idea.split(' ')[0] || 'metrics'}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const sendToAI = (prompt: string) => window.dispatchEvent(new CustomEvent('open-ai-panel', { detail: { prompt } }));

  const { runwayMonths, burnMultiple, ruleOf40, readinessScore } = app.derived;

  return (
    <div className="max-w-[1400px] mx-auto pb-20">
      <PageHeader
        icon={Activity}
        title="Dashboard"
        subtitle={`${app.idea || 'Your Startup'} · ${app.stage} · ${app.industry}`}
        badge={app.stage ? <Badge color="var(--accent-light)">{app.stage}</Badge> : undefined}
        actions={
          <>
            <AIButton onClick={() => sendToAI('Analyze my current dashboard KPIs and give me the top 3 priority actions for the next 30 days.')} />
            <Button icon={Download} onClick={exportCSV} variant="primary" size="sm">Export CSV</Button>
          </>
        }
      />

      {/* Alert: low runway */}
      {runwayMonths < 6 && runwayMonths < 999 && (
        <AlertBanner
          type="error"
          icon={AlertTriangle}
          title={`Critical: ${runwayMonths} months runway remaining`}
          description="Initiate fundraise immediately. Consider emergency burn reduction scenarios in Strategy."
        />
      )}
      {runwayMonths >= 6 && runwayMonths < 9 && runwayMonths < 999 && (
        <AlertBanner
          type="warning"
          icon={AlertTriangle}
          title={`Warning: ${runwayMonths} months runway — begin fundraise process now`}
          description="Rule of thumb: start raising 6 months before runway ends."
        />
      )}

      {/* Top KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={TrendingUp}
          label={<MetricTooltip term="Rule of 40">Rule of 40</MetricTooltip>}
          value={<CountUp value={ruleOf40} suffix="%" decimals={1} />}
          sub={ruleOf40 >= 40 ? '✓ Investable threshold' : `Need ${(40 - ruleOf40).toFixed(0)} more points`}
          color={ruleOf40 >= 40 ? 'var(--green)' : ruleOf40 >= 20 ? 'var(--amber)' : 'var(--red)'}
          trend={ruleOf40 >= 40 ? 'up' : 'down'}
          trendValue={`${ruleOf40 >= 40 ? '+' : '-'}${Math.abs(ruleOf40 - 40).toFixed(0)}pts`}
          className={`border-l-4 ${ruleOf40 >= 40 ? 'border-l-[var(--green)]' : ruleOf40 >= 20 ? 'border-l-[var(--amber)]' : 'border-l-[var(--red)]'}`}
        />
        <StatCard
          icon={Zap}
          label={<MetricTooltip term="Burn Multiple">Burn Multiple</MetricTooltip>}
          value={<CountUp value={burnMultiple} suffix="×" decimals={2} />}
          sub={burnMultiple <= 1.5 ? '✓ Excellent efficiency' : burnMultiple <= 2.5 ? 'Acceptable' : 'Reduce urgently'}
          color={burnMultiple <= 1.5 ? 'var(--green)' : burnMultiple <= 2.5 ? 'var(--amber)' : 'var(--red)'}
          className={`border-l-4 ${burnMultiple <= 1.5 ? 'border-l-[var(--green)]' : burnMultiple <= 2.5 ? 'border-l-[var(--amber)]' : 'border-l-[var(--red)]'}`}
        />
        <StatCard
          icon={PieChart}
          label={<MetricTooltip term="NDR">Net Dollar Retention</MetricTooltip>}
          value={<CountUp value={app.ndr} suffix="%" />}
          sub={app.ndr >= 110 ? '✓ World-class NDR' : app.ndr >= 100 ? 'Good — aim for 110%+' : 'Below breakeven — urgent'}
          color={app.ndr >= 110 ? 'var(--green)' : app.ndr >= 100 ? 'var(--teal)' : 'var(--red)'}
          className={`border-l-4 ${app.ndr >= 110 ? 'border-l-[var(--green)]' : app.ndr >= 100 ? 'border-l-[var(--teal)]' : 'border-l-[var(--red)]'}`}
        />
        <StatCard
          icon={ShieldCheck}
          label="Readiness Score"
          value={<CountUp value={readinessScore} suffix="/100" />}
          sub={readinessScore >= 70 ? '✓ Ready to pitch' : readinessScore >= 50 ? 'Getting there' : 'Needs work'}
          color={readinessScore >= 70 ? 'var(--green)' : readinessScore >= 50 ? 'var(--amber)' : 'var(--red)'}
          className={`border-l-4 ${readinessScore >= 70 ? 'border-l-[var(--green)]' : readinessScore >= 50 ? 'border-l-[var(--amber)]' : 'border-l-[var(--red)]'}`}
        />
      </div>

      {/* Main charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Runway trajectory */}
        <div className="lg:col-span-8">
          <Card className="h-full flex flex-col" glow="rgba(59,130,246,0.06)">
            <div className="flex items-center justify-between mb-4">
              <SectionHeader icon={BarChart2} title="18-Month Runway Trajectory" className="mb-0" />
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Raise Scenario</span>
                <button
                  onClick={() => setShowRaise(r => !r)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${showRaise ? 'bg-[var(--accent)]' : 'bg-[rgba(255,255,255,0.1)]'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${showRaise ? 'left-5' : 'left-0.5'}`} />
                </button>
              </div>
            </div>

            {showRaise && (
              <div className="flex items-center gap-3 mb-4 px-4 py-2.5 rounded-[var(--radius-lg)] bg-[var(--accent-dim)] border border-[var(--border-accent)]">
                <span className="text-xs font-bold text-[var(--accent-light)]">Raise Injection:</span>
                <input
                  type="range" min={100000} max={5000000} step={100000} value={raiseAmt}
                  onChange={e => setRaiseAmt(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm font-mono font-black text-[var(--accent-light)] w-20 text-right">
                  ${(raiseAmt / 1000000).toFixed(2)}M
                </span>
              </div>
            )}

            <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={projectionData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gCash" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={0} stroke="rgba(239,68,68,0.3)" strokeDasharray="4 4" />
                  <Area type="monotone" dataKey="burn" stroke="#ef4444" strokeWidth={1.5} strokeDasharray="4 4" fillOpacity={0} name="Burn Rate" />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#gRev)" name="Revenue" />
                  <Area type="monotone" dataKey="cash" stroke="#93c5fd" strokeWidth={2.5} fillOpacity={1} fill="url(#gCash)" name="Cash Remaining" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Chart legend */}
            <div className="flex items-center gap-5 mt-3 pt-3 border-t border-[var(--border-subtle)]">
              {[
                { color: '#93c5fd', label: 'Cash Remaining', style: 'solid' },
                { color: '#10b981', label: 'Revenue', style: 'solid' },
                { color: '#ef4444', label: 'Burn Rate', style: 'dashed' },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-2">
                  <div className="w-6 h-0.5" style={{ background: l.color, borderStyle: l.style === 'dashed' ? 'dashed' : 'solid', borderBottomWidth: 2, borderColor: l.color, backgroundColor: 'transparent' }} />
                  <span className="text-[11px] text-[var(--text-muted)] font-medium">{l.label}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right column: radar + monte carlo */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <Card padding="1.25rem">
            <SectionHeader icon={Layers} title="Health Radar" />
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.06)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 700 }} />
                  <Radar name="Score" dataKey="A" stroke="var(--accent-light)" fill="var(--accent)" fillOpacity={0.25} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card padding="1.25rem" className="flex-1">
            <div className="flex items-start justify-between mb-3">
              <SectionHeader icon={Flame} title="Monte Carlo" subtitle="2,500 simulations" className="mb-0" />
              <Badge color={riskBadge.color} dot>{riskBadge.label}</Badge>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="metric-value text-[var(--text-primary)]">{survivalRate}%</span>
            </div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-4">chance of surviving 24 months</p>
            <div className="h-[100px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={histogram} barSize={24}>
                  <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', borderRadius: 8, fontSize: 11 }}
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  />
                  {histogram.map((entry, idx) => (
                    <Bar key={idx} dataKey="count" fill={entry.fill} radius={[3, 3, 0, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      {/* Key metrics row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <MetricTile label="ARR" value={`$${(app.derived.arr / 1000).toFixed(0)}k`} sub={`MRR: $${app.revenue.toLocaleString()}`} color="var(--accent-light)" />
        <MetricTile label="LTV / CAC" value={`${(app.derived.ltv / Math.max(app.cac, 1)).toFixed(1)}×`} sub={`LTV $${app.derived.ltv.toLocaleString()} · CAC $${app.cac.toLocaleString()}`} color="var(--teal)" />
        <MetricTile label="Implied Valuation" value={`$${(app.derived.impliedValuation / 1000000).toFixed(1)}M`} sub="8× ARR multiple" color="var(--green)" />
        <MetricTile
          label="Days of Runway"
          value={app.derived.runwayMonths >= 999 ? '∞' : app.derived.daysOfRunway}
          sub={app.derived.runwayMonths >= 999 ? 'Profitable — infinite runway' : `${app.derived.runwayMonths} months`}
          color="var(--green)"
        />
      </div>

      {/* Fundraising Timeline */}
      <Card>
        <div className="flex items-center justify-between mb-5">
          <SectionHeader icon={CalendarDays} title="Fundraising Timeline" className="mb-0" />
          <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
            ~{app.timeline.reduce((a: number, t: TimelineMilestone) => a + t.durationDays, 0)} days to close
          </span>
        </div>

        <div className="overflow-x-auto custom-scrollbar pb-2">
          <div className="flex gap-3 min-w-max">
            {app.timeline.map((item: TimelineMilestone, idx: number) => {
              const cumulativeDays = app.timeline.slice(0, idx).reduce((a: number, t: TimelineMilestone) => a + t.durationDays, 0);
              return (
                <div
                  key={item.id}
                  className={`w-[200px] shrink-0 border rounded-[var(--radius-xl)] p-4 relative transition-colors ${
                    item.done
                      ? 'bg-[var(--green-dim)] border-[rgba(16,185,129,0.25)]'
                      : 'bg-[rgba(255,255,255,0.01)] border-[var(--border)]'
                  }`}
                >
                  {item.done && (
                    <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[var(--green-dim)] border border-[var(--green)] flex items-center justify-center">
                      <ShieldCheck size={11} className="text-[var(--green)]" />
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="checkbox" checked={item.done}
                      onChange={e => {
                        const t = [...app.timeline]; t[idx].done = e.target.checked;
                        app.dispatch({ type: 'BULK_SET', payload: { timeline: t } });
                      }}
                      className="cursor-pointer"
                    />
                    <h4 className={`text-sm font-bold ${item.done ? 'text-[var(--green)]' : 'text-[var(--text-primary)]'}`}>{item.label}</h4>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase">Duration</span>
                      <div className="flex items-center gap-1 group">
                        <input
                          type="number" value={item.durationDays}
                          onChange={e => {
                            const t = [...app.timeline]; t[idx].durationDays = Number(e.target.value);
                            app.dispatch({ type: 'BULK_SET', payload: { timeline: t } });
                          }}
                          className="bg-transparent w-8 text-center text-xs font-mono font-bold text-[var(--text-primary)] border-b border-transparent group-hover:border-[var(--border)] focus:border-[var(--accent)] outline-none"
                        />
                        <span className="text-[10px] text-[var(--text-muted)]">days</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-[var(--text-muted)]">T+{cumulativeDays}d</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
}

function MetricTile({ label, value, sub, color }: { label: string; value: any; sub?: string; color: string }) {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-xl)] p-4">
      <p className="metric-label mb-2">{label}</p>
      <p className="text-xl font-black font-mono leading-none" style={{ color }}>{value}</p>
      {sub && <p className="text-[11px] text-[var(--text-muted)] font-medium mt-1.5">{sub}</p>}
    </div>
  );
}
