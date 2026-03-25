import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { ArrowRight, Check, Zap, BarChart2, Users, Target, Rocket, Sparkles } from 'lucide-react';

const STAGES = ['Pre-seed', 'Seed', 'Series A', 'Series B', 'Growth'];
const INDUSTRIES = ['B2B SaaS', 'AI/ML', 'Fintech', 'Healthtech', 'Consumer', 'Deep Tech', 'Infrastructure', 'Other'];

const features = [
  { icon: BarChart2, label: 'Financial Modeling', desc: 'Runway projections, burn rate, Monte Carlo simulations' },
  { icon: Target, label: 'Scenario Planning', desc: 'Model 5 growth paths side-by-side with live impact' },
  { icon: Sparkles, label: 'AI Advisor', desc: 'Runs in your browser. No API key. No sign-up.' },
  { icon: Users, label: 'Investor CRM', desc: 'Track your pipeline, score fit, and prep your updates' },
];

export default function Onboarding() {
  const app = useApp();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    idea: app.idea || '',
    stage: app.stage || 'Seed',
    industry: app.industry || 'B2B SaaS',
    founder: app.founder || '',
    capital: app.capital || 250000,
    burn: app.burn || 15000,
    revenue: app.revenue || 5000,
    targetRaise: app.targetRaise || 750000,
  });

  if (app.onboardingComplete) return null;

  const next = () => {
    if (step < 3) setStep(step + 1);
    else finish();
  };

  const finish = () => {
    app.dispatch({
      type: 'BULK_SET',
      payload: { ...data, onboardingComplete: true },
    });
    app.addToast("You're in. Let's go.", 'success');
  };

  const formatNum = (v: number) => v.toLocaleString();

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-[var(--bg-base)]">
      {/* Background gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-[var(--accent)] opacity-[0.04] blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-[var(--teal)] opacity-[0.04] blur-[120px]" />
      </div>

      <AnimatePresence mode="wait">
        {/* Step 0: Welcome hero */}
        {step === 0 && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.97 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="w-full max-w-2xl"
          >
            {/* Logo + brand */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--accent-dim)] border border-[var(--border-accent)] mb-6">
                <Zap size={14} className="text-[var(--accent-light)]" />
                <span className="text-xs font-bold text-[var(--accent-light)] tracking-widest uppercase">Startup Finance & Fundraising</span>
              </div>
              <h1 className="text-5xl font-black tracking-tight mb-4">
                <span className="gradient-text">VenturePilot</span>
              </h1>
              <p className="text-xl text-[var(--text-secondary)] font-medium max-w-md mx-auto leading-relaxed">
                Know your numbers. Build your story. Close your round.
              </p>
            </div>

            {/* Feature grid */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              {features.map((f) => (
                <div key={f.label} className="flex items-start gap-3 p-4 bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg)]">
                  <div className="w-8 h-8 rounded-[var(--radius-md)] bg-[var(--accent-dim)] border border-[var(--border-accent)] flex items-center justify-center shrink-0 mt-0.5">
                    <f.icon size={14} className="text-[var(--accent-light)]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[var(--text-primary)]">{f.label}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Trust bar */}
            <div className="flex items-center justify-center gap-6 mb-8">
              {['100% Free', 'No Sign-up', 'Runs Locally', 'Open Source'].map(t => (
                <div key={t} className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)]">
                  <Check size={12} className="text-[var(--green)]" />
                  {t}
                </div>
              ))}
            </div>

            <div className="text-center">
              <button
                onClick={next}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-[var(--radius-xl)] bg-[var(--accent)] text-white font-bold text-base shadow-[var(--shadow-glow)] hover:bg-[var(--accent-dark)] hover:shadow-[0_0_30px_var(--accent-glow)] hover:-translate-y-0.5 transition-all btn-glow"
              >
                <Rocket size={18} />
                Get Started
                <ArrowRight size={18} />
              </button>
              <p className="text-xs text-[var(--text-muted)] mt-3">Takes 60 seconds. All data stays in your browser.</p>
            </div>
          </motion.div>
        )}

        {/* Step 1: Company info */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md"
          >
            <OnboardingCard
              step={1} total={3}
              title="Your Company"
              subtitle="Tell us about your company."
            >
              <div className="space-y-4">
                <Field label="Startup Name / Idea" required>
                  <input
                    type="text"
                    value={data.idea}
                    onChange={e => setData(d => ({ ...d, idea: e.target.value }))}
                    placeholder="e.g. AI-powered procurement for SMBs"
                    className="onboard-input"
                  />
                </Field>
                <Field label="Founder / Team Name">
                  <input
                    type="text"
                    value={data.founder}
                    onChange={e => setData(d => ({ ...d, founder: e.target.value }))}
                    placeholder="e.g. Jane Smith & Team"
                    className="onboard-input"
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Stage">
                    <select value={data.stage} onChange={e => setData(d => ({ ...d, stage: e.target.value }))} className="onboard-input">
                      {STAGES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </Field>
                  <Field label="Industry">
                    <select value={data.industry} onChange={e => setData(d => ({ ...d, industry: e.target.value }))} className="onboard-input">
                      {INDUSTRIES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </Field>
                </div>
              </div>
              <OnboardingNav step={step} setStep={setStep} onNext={next} disabled={!data.idea.trim()} />
            </OnboardingCard>
          </motion.div>
        )}

        {/* Step 2: Financials */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md"
          >
            <OnboardingCard
              step={2} total={3}
              title="Core Financials"
              subtitle="These numbers drive your runway model and investor metrics."
            >
              <div className="space-y-4">
                <Field label="Current Bank Balance" hint={`${Math.round(data.capital / Math.max(data.burn - data.revenue, 1))} mo runway`}>
                  <NumInput value={data.capital} onChange={v => setData(d => ({ ...d, capital: v }))} prefix="$" min={0} max={5000000} step={10000} />
                </Field>
                <Field label="Monthly Gross Burn" hint={`Net: $${formatNum(Math.max(data.burn - data.revenue, 0))}/mo`}>
                  <NumInput value={data.burn} onChange={v => setData(d => ({ ...d, burn: v }))} prefix="$" min={0} max={1000000} step={100} />
                </Field>
                <Field label="Monthly Revenue (MRR)" hint={`ARR: $${formatNum(data.revenue * 12)}`}>
                  <NumInput value={data.revenue} onChange={v => setData(d => ({ ...d, revenue: v }))} prefix="$" min={0} max={1000000} step={1000} />
                </Field>
                <Field label="Target Raise">
                  <NumInput value={data.targetRaise} onChange={v => setData(d => ({ ...d, targetRaise: v }))} prefix="$" min={0} max={20000000} step={10000} />
                </Field>
              </div>
              <OnboardingNav step={step} setStep={setStep} onNext={next} />
            </OnboardingCard>
          </motion.div>
        )}

        {/* Step 3: Ready */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.35 }}
            className="w-full max-w-md text-center"
          >
            <div className="w-20 h-20 rounded-full bg-[var(--green-dim)] border-2 border-[var(--green)] flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
              <Check size={36} className="text-[var(--green)]" />
            </div>
            <h2 className="text-3xl font-black text-[var(--text-primary)] mb-2">You're all set.</h2>
            <p className="text-[var(--text-muted)] mb-2">You're set up for <strong className="text-[var(--text-secondary)]">{data.idea || 'your startup'}</strong>.</p>
            <p className="text-[var(--text-muted)] text-sm mb-8">Your dashboard, pitch deck, and strategy planner are ready.</p>

            {/* Summary pills */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {[
                { label: 'Stage', val: data.stage },
                { label: 'Industry', val: data.industry },
                { label: 'MRR', val: `$${(data.revenue / 1000).toFixed(0)}k` },
                { label: 'Runway', val: `${Math.round(data.capital / Math.max(data.burn - data.revenue, 1))}mo` },
              ].map(p => (
                <div key={p.label} className="px-3 py-1.5 rounded-[var(--radius-md)] bg-[var(--bg-card)] border border-[var(--border)] flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)]">{p.label}</span>
                  <span className="text-xs font-black font-mono text-[var(--accent-light)]">{p.val}</span>
                </div>
              ))}
            </div>

            <button
              onClick={finish}
              className="w-full py-3.5 rounded-[var(--radius-xl)] bg-[var(--accent)] text-white font-bold text-base shadow-[var(--shadow-glow)] hover:bg-[var(--accent-dark)] hover:shadow-[0_0_30px_var(--accent-glow)] transition-all btn-glow"
            >
              Launch Dashboard →
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .onboard-input {
          width: 100%;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 10px 12px;
          color: var(--text-primary);
          font-size: 14px;
          font-weight: 500;
          outline: none;
          transition: border-color 0.15s;
        }
        .onboard-input:focus { border-color: var(--accent); }
      `}</style>
    </div>
  );
}

// Sub-components
function OnboardingCard({ children, step, total, title, subtitle }: any) {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-2xl)] p-8 shadow-[var(--shadow-elevated)]">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        {Array.from({ length: total }, (_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i < step ? 'bg-[var(--accent)]' : i === step - 1 ? 'bg-[var(--accent-light)]' : 'bg-[var(--border)]'}`} />
        ))}
        <span className="text-xs font-bold text-[var(--text-muted)] ml-2 shrink-0">{step}/{total}</span>
      </div>
      <h2 className="text-xl font-black text-[var(--text-primary)] mb-1">{title}</h2>
      <p className="text-sm text-[var(--text-muted)] mb-6 leading-relaxed">{subtitle}</p>
      {children}
    </div>
  );
}

function Field({ label, hint, required, children }: any) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
          {label}{required && <span className="text-[var(--accent-light)] ml-1">*</span>}
        </label>
        {hint && <span className="text-[10px] font-mono font-bold text-[var(--green)]">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function NumInput({ value, onChange, prefix, min, max, step }: any) {
  return (
    <div className="relative">
      {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)] font-medium pointer-events-none">{prefix}</span>}
      <input
        type="text"
        value={Number(value).toLocaleString()}
        onChange={e => {
          const raw = e.target.value.replace(/,/g, '');
          if (!isNaN(Number(raw))) onChange(Math.min(max, Math.max(min, Number(raw))));
        }}
        className={`onboard-input ${prefix ? 'pl-7' : ''}`}
      />
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full mt-2"
        style={{
          background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.1) ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.1) 100%)`,
        }}
      />
    </div>
  );
}

function OnboardingNav({ step, setStep, onNext, disabled = false }: any) {
  return (
    <div className="flex items-center justify-between mt-6 pt-4 border-t border-[var(--border-subtle)]">
      <button
        onClick={() => setStep((s: number) => s - 1)}
        className="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
      >
        ← Back
      </button>
      <button
        onClick={onNext}
        disabled={disabled}
        className="flex items-center gap-2 px-6 py-2.5 rounded-[var(--radius-lg)] bg-[var(--accent)] text-white font-bold text-sm shadow-[var(--shadow-glow-sm)] hover:bg-[var(--accent-dark)] hover:shadow-[var(--shadow-glow)] transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-0.5"
      >
        Continue
        <ArrowRight size={14} />
      </button>
    </div>
  );
}
