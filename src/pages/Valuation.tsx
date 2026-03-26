import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { Calculator, DollarSign } from 'lucide-react';
import { PageHeader, Card, Badge, Button } from '../components/Shared';

const fmt = (n: number) => {
  if (!isFinite(n) || n === 0) return '$0';
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
};

const fmtX = (n: number) => `${n.toFixed(1)}×`;

interface SAFENote {
  id: string;
  amount: number;
  valuationCap: number;
  discount: number; // percent
  type: 'SAFE' | 'Convertible Note';
  interestRate?: number;
  maturityMonths?: number;
}

interface CapTableRow {
  name: string;
  shares: number;
  type: 'Common' | 'Preferred' | 'Options' | 'SAFE';
  color: string;
}

const VALUATION_METHODS = [
  { id: 'arr', label: 'ARR Multiple', desc: 'Most common SaaS method. ARR × revenue multiple based on growth rate.', tooltip: 'ARR multiple valuation is the dominant method for SaaS companies. High-growth companies command 10-30× ARR multiples.' },
  { id: 'dcf', label: 'DCF', desc: 'Discounted cash flow analysis. Best for mature, predictable businesses.', tooltip: 'Discounted Cash Flow projects future free cash flows and discounts them back to present value. Less common for early-stage startups.' },
  { id: 'comparable', label: 'Comparable Cos.', desc: 'Benchmarks against recent comparable company transactions.', tooltip: 'Comparable company analysis looks at public market multiples and recent M&A/VC transactions for similar companies.' },
  { id: 'vc', label: 'VC Method', desc: 'Backward-calculation from expected exit valuation.', tooltip: 'The VC method works backward from an expected exit: Exit Value ÷ Target MOIC = Today\'s Pre-Money Valuation.' },
];

export default function Valuation() {
  const { state, derived } = useApp() as any;
  // Correct field names from AppState / derived
  const revenue      = state?.revenue      ?? 0;   // MRR
  const arrDerived   = derived?.arr        ?? revenue * 12;
  const growth       = state?.growth       ?? 10;  // MoM %
  const grossMargin  = state?.grossMargin  ?? 70;
  const ndr          = state?.ndr          ?? 100;
  const burnMultiple = derived?.burnMultiple ?? 0;
  const ruleOf40     = derived?.ruleOf40   ?? 0;
  const stage        = state?.stage        ?? 'Seed';

  const [method, setMethod] = useState('arr');
  const [targetRaise, setTargetRaise] = useState(2000000);
  const [exitMultiple, setExitMultiple] = useState(8);
  const [exitYears, setExitYears] = useState(5);
  const [targetMOIC, setTargetMOIC] = useState(10);
  const [arrMultipleOverride, setArrMultipleOverride] = useState<number | null>(null);
  const [dilution, setDilution] = useState(20);
  const [optionPool, setOptionPool] = useState(10);

  const [safes, setSafes] = useState<SAFENote[]>([
    { id: 's1', amount: 500000, valuationCap: 8000000, discount: 20, type: 'SAFE' },
  ]);

  // Compute ARR multiple based on growth
  const impliedArrMultiple = useMemo(() => {
    const g = growth * 12; // YoY growth approx
    if (g >= 100) return 25;
    if (g >= 80) return 20;
    if (g >= 60) return 16;
    if (g >= 40) return 12;
    if (g >= 20) return 8;
    if (g >= 10) return 5;
    return 3;
  }, [growth]);

  const arrMultiple = arrMultipleOverride ?? impliedArrMultiple;
  const currentArr = arrDerived || revenue * 12;

  const valuations = useMemo(() => {
    const arrVal = currentArr * arrMultiple;

    // DCF simplified — compound annually (not monthly^12 which overstates growth)
    let dcfVal = 0;
    let rev = currentArr;
    const annualGrowthRate = (1 + growth / 100) ** 12 - 1; // convert monthly to annual
    const discountRate = 0.4; // 40% discount rate for early stage
    for (let i = 1; i <= 5; i++) {
      rev = rev * (1 + annualGrowthRate);
      const fcf = rev * (grossMargin / 100) * 0.25; // simplified FCF
      dcfVal += fcf / (1 + discountRate) ** i;
    }
    const terminalValue = (rev * arrMultiple * 0.5) / (1 + discountRate) ** 5;
    dcfVal += terminalValue;

    // Comparable
    const comparableVal = currentArr * (arrMultiple * 0.9); // slight discount to pure ARR method

    // VC Method
    const projectedArr = currentArr * (1 + growth / 100) ** (exitYears * 12);
    const exitValuation = projectedArr * exitMultiple;
    const vcVal = exitValuation / targetMOIC;

    return {
      arr: arrVal,
      dcf: dcfVal,
      comparable: comparableVal,
      vc: vcVal,
    };
  }, [currentArr, arrMultiple, growth, grossMargin, exitMultiple, exitYears, targetMOIC]);

  const preMoneyVal = valuations[method as keyof typeof valuations] || valuations.arr;
  const postMoneyVal = preMoneyVal + targetRaise;
  const founderDilution = (targetRaise / postMoneyVal) * 100;

  // SAFE dilution
  const totalSafeAmount = safes.reduce((s, n) => s + n.amount, 0);
  const safeShares = safes.map(safe => {
    // cap price = preMoneyVal / valuationCap (simplified)
    const capPrice = preMoneyVal > 0 && safe.valuationCap > 0 ? preMoneyVal / safe.valuationCap : 0;
    const discountedPrice = preMoneyVal > 0 ? (preMoneyVal / (preMoneyVal + targetRaise)) * (1 - safe.discount / 100) : 0;
    // ownership: min of cap-based and discount-based; clamp at 20%
    const capOwnership = safe.valuationCap > 0 ? (safe.amount / safe.valuationCap) * 100 : 20;
    const discountOwnership = discountedPrice > 0 ? (safe.amount / Math.max(preMoneyVal * discountedPrice, 1)) * 100 : capOwnership;
    const conversionOwnership = Math.min(capOwnership, discountOwnership);
    return { ...safe, conversionPrice: capPrice, estimatedShares: Math.min(conversionOwnership, 20) };
  });

  const capTableData: CapTableRow[] = ([
    { name: 'Founders', shares: 70 - dilution - optionPool, type: 'Common' as const, color: '#3b82f6' },
    { name: 'New Investors', shares: dilution, type: 'Preferred' as const, color: '#3b82f6' },
    { name: 'Option Pool (ESOP)', shares: optionPool, type: 'Options' as const, color: '#10b981' },
    { name: 'SAFE Holders', shares: preMoneyVal > 0 ? Math.min(totalSafeAmount / preMoneyVal * 100, 15) : 0, type: 'SAFE' as const, color: '#f59e0b' },
  ] as CapTableRow[]).filter(r => r.shares > 0);

  const totalShares = capTableData.reduce((s, r) => s + r.shares, 0);

  const addSafe = () => setSafes(s => [...s, { id: `s${Date.now()}`, amount: 500000, valuationCap: preMoneyVal, discount: 20, type: 'SAFE' }]);
  const removeSafe = (id: string) => setSafes(s => s.filter(n => n.id !== id));
  const updateSafe = (id: string, key: keyof SAFENote, value: any) => setSafes(s => s.map(n => n.id === id ? { ...n, [key]: value } : n));

  const healthColor = (v: number, good: number, bad: number, higher = true) => {
    if (higher) return v >= good ? 'var(--green)' : v >= bad ? 'var(--amber)' : 'var(--red)';
    return v <= good ? 'var(--green)' : v <= bad ? 'var(--amber)' : 'var(--red)';
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <PageHeader
        icon={Calculator}
        title="Valuation"
        subtitle="Run the numbers on your raise"
        badge={<Badge color="var(--green)" size="sm">{fmt(preMoneyVal)} pre-money</Badge>}
      />

      {/* Valuation method selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {VALUATION_METHODS.map(m => (
          <motion.button key={m.id} onClick={() => setMethod(m.id)} whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}
            className="p-4 rounded-[var(--radius-lg)] border text-left transition-all relative overflow-hidden"
            style={{ background: method === m.id ? 'rgba(59,130,246,0.15)' : 'var(--bg-card)', borderColor: method === m.id ? '#3b82f6' : 'var(--border)' }}>
            {method === m.id && <div className="absolute top-0 left-0 right-0 h-0.5 bg-[var(--accent)]" />}
            <div className="font-bold text-sm mb-1" style={{ color: method === m.id ? 'var(--accent)' : 'var(--text-primary)' }}>{m.label}</div>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">{m.desc}</p>
          </motion.button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Controls */}
        <div className="space-y-4">
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Calculator size={15} style={{ color: 'var(--accent)' }} />
              <span className="font-bold text-sm">Valuation Inputs</span>
              <Badge color="var(--accent-light)" size="sm">{VALUATION_METHODS.find(m2 => m2.id === method)?.label}</Badge>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide">Current ARR</label>
                  <span className="text-sm font-bold text-[var(--text-primary)]">{fmt(currentArr)}</span>
                </div>
                <div className="text-xs text-[var(--text-muted)]">Auto-calculated from your MRR ({fmt(revenue)}/mo)</div>
              </div>

              {method === 'arr' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide">ARR Multiple</label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[var(--text-muted)]">Auto: {impliedArrMultiple}×</span>
                      <span className="text-sm font-bold text-[var(--accent)]">{arrMultiple}×</span>
                    </div>
                  </div>
                  <input type="range" min={1} max={40} step={0.5} value={arrMultiple}
                    onChange={e => setArrMultipleOverride(parseFloat(e.target.value))}
                    className="w-full" />
                  <div className="flex justify-between text-[9px] text-[var(--text-muted)] mt-1">
                    <span>1× (distressed)</span><span>10× (avg)</span><span>40× (top decile)</span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mt-2">
                    At {(monthlyGrowth * 12).toFixed(0)}% estimated YoY growth, implied multiple is <span className="font-bold text-[var(--accent)]">{impliedArrMultiple}×</span>
                  </p>
                </div>
              )}

              {method === 'vc' && (
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide">Exit ARR Multiple</label>
                      <span className="text-sm font-bold text-[var(--accent)]">{exitMultiple}×</span>
                    </div>
                    <input type="range" min={3} max={30} step={0.5} value={exitMultiple} onChange={e => setExitMultiple(+e.target.value)} className="w-full" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide">Exit Horizon</label>
                      <span className="text-sm font-bold text-[var(--accent)]">{exitYears} years</span>
                    </div>
                    <input type="range" min={3} max={10} step={1} value={exitYears} onChange={e => setExitYears(+e.target.value)} className="w-full" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide">Target MOIC</label>
                      <span className="text-sm font-bold text-[var(--accent)]">{targetMOIC}×</span>
                    </div>
                    <input type="range" min={3} max={30} step={0.5} value={targetMOIC} onChange={e => setTargetMOIC(+e.target.value)} className="w-full" />
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide">Raise Amount</label>
                  <span className="text-sm font-bold text-[var(--text-primary)]">{fmt(targetRaise)}</span>
                </div>
                <input type="range" min={500000} max={50000000} step={250000} value={targetRaise}
                  onChange={e => setTargetRaise(+e.target.value)} className="w-full" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide">Dilution at This Round</label>
                  <span className="text-sm font-bold text-[var(--text-primary)]">{dilution}%</span>
                </div>
                <input type="range" min={5} max={40} step={1} value={dilution} onChange={e => setDilution(+e.target.value)} className="w-full" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide">ESOP Option Pool</label>
                  <span className="text-sm font-bold text-[var(--text-primary)]">{optionPool}%</span>
                </div>
                <input type="range" min={5} max={25} step={1} value={optionPool} onChange={e => setOptionPool(+e.target.value)} className="w-full" />
              </div>
            </div>
          </Card>

          {/* SAFE / Convertible Notes */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <DollarSign size={15} style={{ color: 'var(--amber)' }} />
                <span className="font-bold text-sm">SAFE / Convertible Notes</span>
              </div>
              <Button variant="ghost" size="sm" onClick={addSafe}>+ Add</Button>
            </div>
            <div className="space-y-4">
              {safes.map(safe => (
                <div key={safe.id} className="p-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-base)] space-y-3">
                  <div className="flex items-center justify-between">
                    <select value={safe.type} onChange={e => updateSafe(safe.id, 'type', e.target.value)}
                      className="bg-transparent text-xs font-bold text-[var(--amber)] border-none outline-none cursor-pointer">
                      <option value="SAFE">SAFE</option>
                      <option value="Convertible Note">Convertible Note</option>
                    </select>
                    <button onClick={() => removeSafe(safe.id)} className="text-[var(--text-muted)] hover:text-[var(--red)] text-xs">Remove</button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Amount', value: safe.amount, key: 'amount', prefix: '$', step: 50000, min: 50000, max: 10000000, fmt: (v: number) => v >= 1e6 ? `$${(v/1e6).toFixed(1)}M` : `$${(v/1e3).toFixed(0)}K` },
                      { label: 'Val. Cap', value: safe.valuationCap, key: 'valuationCap', prefix: '$', step: 500000, min: 500000, max: 50000000, fmt: (v: number) => v >= 1e6 ? `$${(v/1e6).toFixed(1)}M` : `$${(v/1e3).toFixed(0)}K` },
                      { label: 'Discount', value: safe.discount, key: 'discount', prefix: '', step: 5, min: 0, max: 30, fmt: (v: number) => `${v}%` },
                    ].map(f => (
                      <div key={f.key}>
                        <div className="text-[9px] text-[var(--text-muted)] uppercase tracking-wide mb-1">{f.label}</div>
                        <div className="text-sm font-bold text-[var(--text-primary)] mb-1">{f.fmt(f.value)}</div>
                        <input type="range" min={f.min} max={f.max} step={f.step} value={f.value}
                          onChange={e => updateSafe(safe.id, f.key as any, +e.target.value)}
                          className="w-full" style={{ accentColor: 'var(--amber)' }} />
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">
                    Converts at: <span className="font-bold text-[var(--amber)]">{fmt(Math.min(safe.valuationCap, preMoneyVal) * (1 - safe.discount / 100))}</span> per share equivalent
                  </div>
                </div>
              ))}
              {safes.length === 0 && <p className="text-xs text-[var(--text-muted)] text-center py-4">No SAFEs added yet. Add one above.</p>}
            </div>
          </Card>
        </div>

        {/* Right: Results */}
        <div className="space-y-4">
          {/* Key outputs */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Pre-Money Valuation', value: fmt(preMoneyVal), color: 'var(--accent)', sub: `${arrMultiple}× ARR multiple` },
              { label: 'Post-Money Valuation', value: fmt(postMoneyVal), color: 'var(--blue)', sub: `After ${fmt(targetRaise)} raise` },
              { label: 'Investor Ownership', value: `${founderDilution.toFixed(1)}%`, color: founderDilution <= 20 ? 'var(--green)' : founderDilution <= 30 ? 'var(--amber)' : 'var(--red)', sub: `At ${fmt(targetRaise)} raise` },
              { label: 'Total SAFE Exposure', value: fmt(totalSafeAmount), color: 'var(--amber)', sub: `${safes.length} note${safes.length !== 1 ? 's' : ''}` },
            ].map(m => (
              <div key={m.label} className="p-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)]">
                <div className="text-2xl font-black mb-1" style={{ color: m.color }}>{m.value}</div>
                <div className="text-xs font-bold text-[var(--text-primary)]">{m.label}</div>
                <div className="text-[10px] text-[var(--text-muted)] mt-0.5">{m.sub}</div>
              </div>
            ))}
          </div>

          {/* Method comparison */}
          <Card>
            <div className="font-bold text-sm mb-4">Valuation by Method</div>
            <div className="space-y-3">
              {VALUATION_METHODS.map(m => {
                const val = valuations[m.id as keyof typeof valuations];
                const maxVal = Math.max(...Object.values(valuations));
                const barW = maxVal > 0 ? (val / maxVal) * 100 : 0;
                const isActive = method === m.id;
                return (
                  <div key={m.id} className={`transition-opacity ${!isActive ? 'opacity-60' : ''}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold" style={{ color: isActive ? 'var(--accent)' : 'var(--text-muted)' }}>{m.label}</span>
                      <span className="text-sm font-bold" style={{ color: isActive ? 'var(--accent)' : 'var(--text-primary)' }}>{fmt(val)}</span>
                    </div>
                    <div className="h-2 bg-[var(--border)] rounded-full overflow-hidden">
                      <motion.div animate={{ width: `${barW}%` }} transition={{ duration: 0.6 }}
                        className="h-full rounded-full" style={{ background: isActive ? 'var(--accent)' : 'rgba(255,255,255,0.2)' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Cap table donut */}
          <Card>
            <div className="font-bold text-sm mb-4">Post-Round Cap Table</div>
            <div className="flex items-center gap-6">
              <div className="relative w-28 h-28 shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  {(() => {
                    let offset = 0;
                    return capTableData.map((row, i) => {
                      const pct = (row.shares / totalShares) * 100;
                      const circumference = 2 * Math.PI * 38;
                      const dash = (pct / 100) * circumference;
                      const gap = circumference - dash;
                      const el = (
                        <circle key={i} cx="50" cy="50" r="38" fill="none" stroke={row.color} strokeWidth="14"
                          strokeDasharray={`${dash} ${gap}`} strokeDashoffset={-offset * circumference / 100}
                          strokeLinecap="butt" />
                      );
                      offset += pct;
                      return el;
                    });
                  })()}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <div className="text-[10px] text-[var(--text-muted)]">Founders</div>
                  <div className="text-sm font-black text-[var(--text-primary)]">{capTableData.find(r => r.name === 'Founders')?.shares.toFixed(0) || 0}%</div>
                </div>
              </div>
              <div className="flex-1 space-y-2">
                {capTableData.map(row => (
                  <div key={row.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-sm" style={{ background: row.color }} />
                      <span className="text-xs text-[var(--text-secondary)]">{row.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: `${row.color}15`, color: row.color }}>{row.type}</span>
                      <span className="text-xs font-bold text-[var(--text-primary)]">{row.shares.toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Key health metrics */}
          <Card>
            <div className="font-bold text-sm mb-4">Valuation Health Check</div>
            <div className="space-y-3">
              {[
                { label: 'Burn Multiple', value: burnMultiple, fmt: (v: number) => `${v.toFixed(1)}×`, good: 1.5, bad: 3, higher: false, note: '< 1.5× is excellent' },
                { label: 'Rule of 40', value: ruleOf40, fmt: (v: number) => `${v.toFixed(0)}`, good: 40, bad: 20, higher: true, note: '40+ commands premium multiple' },
                { label: 'NDR', value: ndr, fmt: (v: number) => `${v.toFixed(0)}%`, good: 120, bad: 100, higher: true, note: '> 120% is top quartile' },
                { label: 'Gross Margin', value: grossMargin, fmt: (v: number) => `${v.toFixed(0)}%`, good: 70, bad: 50, higher: true, note: '> 70% for premium SaaS multiple' },
              ].map(m => {
                const color = healthColor(m.value, m.good, m.bad, m.higher);
                return (
                  <div key={m.label} className="flex items-center justify-between p-3 rounded-[var(--radius-md)] bg-[var(--bg-base)] border border-[var(--border)]">
                    <div>
                      <div className="text-xs font-bold">{m.label}</div>
                      <div className="text-[10px] text-[var(--text-muted)]">{m.note}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black" style={{ color }}>{m.fmt(m.value)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
