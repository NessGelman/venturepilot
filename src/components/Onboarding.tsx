import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { InputField } from './Shared';
import { ArrowRight, Check, Rocket } from 'lucide-react';

export default function Onboarding() {
  const app = useApp();
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    stage: app.stage,
    industry: app.industry,
    idea: app.idea,
    capital: app.capital,
    burn: app.burn,
    revenue: app.revenue,
  });

  const hide = app.onboardingComplete;

  const next = () => {
    if (step < 3) setStep(step + 1);
    else finish();
  };

  const finish = () => {
    app.dispatch({
      type: 'BULK_SET',
      payload: { ...data, onboardingComplete: true }
    });
    app.addToast('Welcome to VenturePilot!', 'success');
  };

  if (hide) return null;

  return (
    <div className="fixed inset-0 z-[400] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg bg-[var(--bg-card)] border border-[rgba(255,255,255,0.08)] rounded-[var(--radius-xl)] shadow-elevated overflow-hidden flex flex-col"
      >
        <div className="p-6 border-b border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)] flex flex-col items-center">
          <div className="w-12 h-12 bg-[rgba(99,102,241,0.15)] text-[var(--accent)] border border-[rgba(99,102,241,0.3)] rounded-[var(--radius-md)] flex items-center justify-center mb-4">
            <Rocket size={24} />
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">Welcome to VenturePilot</h2>
          <p className="text-sm text-[var(--text-muted)] text-center max-w-xs">Let's set up your foundational metrics to calibrate the AI engine.</p>
        </div>

        <div className="p-6 flex-1 min-h-[250px] relative overflow-hidden">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4">
                <InputField label="Startup Name / Idea" value={data.idea} onChange={(v: string) => setData(d => ({...d, idea: v}))} type="text" />
                <InputField label="Stage" value={data.stage} onChange={(v: string) => setData(d => ({...d, stage: v}))} type="select" options={['Pre-seed', 'Seed', 'Series A', 'Series B', 'Growth']} />
                <InputField label="Industry" value={data.industry} onChange={(v: string) => setData(d => ({...d, industry: v}))} type="select" options={['B2B SaaS', 'AI/ML', 'Fintech', 'Healthtech', 'Consumer', 'Deep Tech', 'Infra', 'Other']} />
              </motion.div>
            )}
            {step === 2 && (
              <motion.div key="2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4">
                <InputField label="Capital Raised (Bank Balance)" value={data.capital} onChange={(v: number) => setData(d => ({...d, capital: v}))} type="number" prefix="$" />
                <InputField label="Monthly Gross Burn" value={data.burn} onChange={(v: number) => setData(d => ({...d, burn: v}))} type="number" prefix="$" />
                <InputField label="Monthly Revenue (MRR)" value={data.revenue} onChange={(v: number) => setData(d => ({...d, revenue: v}))} type="number" prefix="$" />
              </motion.div>
            )}
            {step === 3 && (
              <motion.div key="3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 bg-[rgba(16,185,129,0.15)] text-[var(--green)] border border-[rgba(16,185,129,0.3)] rounded-full flex items-center justify-center mb-4 mt-8">
                  <Check size={32} />
                </div>
                <h3 className="font-bold text-lg text-[var(--text-primary)] mb-2">You're ready to go!</h3>
                <p className="text-sm text-[var(--text-muted)] max-w-sm">We've generated your initial dashboard, pitch deck, and strategy planner based on your inputs.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-4 border-t border-[rgba(255,255,255,0.05)] flex justify-between items-center bg-[var(--bg-surface)]">
          <div className="flex gap-1.5">
            {[1, 2, 3].map(i => (
              <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === step ? 'bg-[var(--accent)]' : i < step ? 'bg-[var(--accent-light)] opacity-50' : 'bg-[var(--border)]'}`} />
            ))}
          </div>
          <button
            onClick={next}
            className="flex items-center gap-2 px-5 py-2.5 rounded-[var(--radius-lg)] bg-[var(--accent)] text-white font-bold text-sm shadow-glow hover:shadow-[0_0_20px_var(--accent-glow)] transition-all card-hover"
          >
            {step === 3 ? "Launch Dashboard" : "Continue"}
            {step < 3 && <ArrowRight size={16} />}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
