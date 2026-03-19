import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/Shared';
import { Database, Filter, ChevronRight, X, Sparkles, TrendingUp, Info } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const BENCHMARKS: Record<string, Record<string, any>> = {
  'B2B SaaS': {
     growth: { median: 85, top: 120, bottom: 40, desc: 'Year-over-year revenue growth. SaaS investors look for T2D3 (Triple, Triple, Double, Double, Double).', tips: ['Optimize onboarding flow', 'Expand sales team', 'Launch self-serve tier'] },
     margin: { median: 78, top: 85, bottom: 65, desc: 'Gross margin. Shows scalability of software delivery minus hosting and support.', tips: ['Transition to annual billing', 'Optimize AWS/cloud spend', 'Automate low-tier support'] },
     ndr: { median: 105, top: 120, bottom: 90, desc: 'Net Dollar Retention. Crucial for compounding growth without new customer acquisition.', tips: ['Launch upsell campaigns', 'Improve customer success', 'Adjust pricing tiers'] },
     rule40: { median: 35, top: 50, bottom: 20, desc: 'Growth Rate + Profit Margin. The ultimate SaaS health metric.', tips: ['Cut non-performing marketing', 'Raise prices for legacy users', 'Consolidate tech stack'] },
     burnMult: { median: 1.8, top: 1.2, bottom: 2.5, inverse: true, desc: 'Net Burn / Net New ARR. Measures capital efficiency of growth.', tips: ['Reduce CAC payback period', 'Extend runway with venture debt', 'Focus on organic channels'] },
  },
  'Fintech': {
     growth: { median: 110, top: 160, bottom: 60, desc: 'Year-over-year growth.', tips: ['Localize for new markets', 'Expand product lines', 'Partner with banks'] },
     margin: { median: 65, top: 75, bottom: 50, desc: 'Gross margin. Lower than SaaS due to payment processing costs.', tips: ['Renegotiate payment rails', 'Move upmarket', 'Verticalize offerings'] },
     ndr: { median: 115, top: 130, bottom: 100, desc: 'Net Dollar Retention.', tips: ['Increase wallet share', 'Add lending products', 'Improve B2B integration'] },
     rule40: { median: 30, top: 45, bottom: 15, desc: 'Growth Rate + Margin.', tips: ['Focus on high LTV users', 'Reduce fraud losses', 'Cross-sell insurance'] },
     burnMult: { median: 2.2, top: 1.5, bottom: 3.0, inverse: true, desc: 'Burn Multiple. Higher due to compliance and capital requirements.', tips: ['Raise compliance efficiency', 'Lower cost of capital', 'Decrease CAC via referrals'] },
  },
  'Climate Tech': {
     growth: { median: 60, top: 90, bottom: 30, desc: 'Slower initial growth due to hardware/infra timelines.', tips: ['Secure government grants', 'Pre-sell capacity', 'Partner with corporates'] },
     margin: { median: 45, top: 60, bottom: 30, desc: 'Capex heavy, margins improve at scale.', tips: ['Scale manufacturing', 'Value-based pricing', 'Reduce BOM costs'] },
     ndr: { median: 105, top: 120, bottom: 95, desc: 'Retention of enterprise contracts.', tips: ['Sign multi-year deals', 'Expand facility scope', 'Add data/software layer'] },
     rule40: { median: 25, top: 40, bottom: 10, desc: 'Lower early focus on Rule 40 compared to deep tech milestones.', tips: ['Focus on unit economics', 'Delay aggressive scaling', 'Non-dilutive funding'] },
     burnMult: { median: 3.5, top: 2.0, bottom: 5.0, inverse: true, desc: 'High burn is expected pre-commercialization.', tips: ['Hit technical milestones', 'Lease instead of buy infra', 'Leverage tax credits'] },
  },
  'Consumer': {
     growth: { median: 150, top: 300, bottom: 80, desc: 'Must demonstrate explosive viral growth.', tips: ['Optimize viral loops', 'Influencer marketing', 'Gamification features'] },
     margin: { median: 55, top: 70, bottom: 40, desc: 'Varies by physical vs digital, but acquisition costs eat margins.', tips: ['Reduce shipping/CAC', 'Introduce premium subscriptions', 'In-app purchases'] },
     ndr: { median: 85, top: 110, bottom: 60, desc: 'Churn is highly prevalent in consumer.', tips: ['Strengthen network effects', 'Daily active habit hooks', 'Annual plans'] },
     rule40: { median: 40, top: 70, bottom: 20, desc: 'Growth dominates this equation.', tips: ['A/B test onboarding', 'Referral programs', 'Re-engagement loops'] },
     burnMult: { median: 2.5, top: 1.2, bottom: 4.0, inverse: true, desc: 'Expensive S&M spend reduces efficiency.', tips: ['Lower CAC', 'Increase organic acquisition', 'Extend LTV cohort'] },
  }
};

export default function MarketBench() {
  const app = useApp();
  const [sector, setSector] = useState(BENCHMARKS[app.industry] ? app.industry : 'B2B SaaS');
  const [modalData, setModalData] = useState<any>(null);

  const bm = BENCHMARKS[sector] || BENCHMARKS['B2B SaaS'];

  // Normalize data for Radar
  const radarData = useMemo(() => [
     { name: 'Growth', user: Math.min((app.growth*12) / bm.growth.median * 100, 150), sector: 100 },
     { name: 'Margin', user: Math.min(app.grossMargin / bm.margin.median * 100, 150), sector: 100 },
     { name: 'NDR', user: Math.min(app.ndr / bm.ndr.median * 100, 150), sector: 100 },
     { name: 'Rule 40', user: Math.max(0, Math.min(app.derived.ruleOf40 / bm.rule40.median * 100, 150)), sector: 100 },
     { name: 'Efficiency', user: Math.min((bm.burnMult.median / Math.max(app.derived.burnMultiple, 0.5)) * 100, 150), sector: 100 },
  ], [app, bm]);

  const metrics = [
    { id: 'growth', name: 'Annual Growth Rate', userVal: app.growth * 12, suffix: '%', bmData: bm.growth },
    { id: 'margin', name: 'Gross Margin', userVal: app.grossMargin, suffix: '%', bmData: bm.margin },
    { id: 'ndr', name: 'Net Dollar Retention', userVal: app.ndr, suffix: '%', bmData: bm.ndr },
    { id: 'rule40', name: 'Rule of 40', userVal: app.derived.ruleOf40, suffix: '%', bmData: bm.rule40 },
    { id: 'burnMult', name: 'Burn Multiple', userVal: app.derived.burnMultiple, suffix: 'x', bmData: bm.burnMult },
  ];

  const getPosition = (val: number, data: any) => {
    if (data.inverse) {
      if (val <= data.top) return { label: 'Top Quartile', dot: 'bg-emerald-500', text: 'text-emerald-500' };
      if (val >= data.bottom) return { label: 'Bottom Quartile', dot: 'bg-red-500', text: 'text-red-500' };
      return { label: 'Median', dot: 'bg-amber-500', text: 'text-amber-500' };
    } else {
      if (val >= data.top) return { label: 'Top Quartile', dot: 'bg-emerald-500', text: 'text-emerald-500' };
      if (val <= data.bottom) return { label: 'Bottom Quartile', dot: 'bg-red-500', text: 'text-red-500' };
      return { label: 'Median', dot: 'bg-amber-500', text: 'text-amber-500' };
    }
  };

  const submitAI = (prompt: string) => {
    window.dispatchEvent(new CustomEvent('open-ai-panel', { detail: { prompt } }));
  };

  return (
    <div className="max-w-[1200px] mx-auto pb-24 h-full relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 px-2">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Database className="text-[var(--accent)]" /> Market Benchmarks
          </h1>
          <p className="text-[var(--text-muted)] mt-1 font-medium font-mono text-sm tracking-wide">
            Calibrate against institutional LP expectations.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={() => submitAI('Based on my current benchmark positioning compared to the '+sector+' sector, what is the single most critical metric I need to improve before pitching?')} className="bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.1)] text-[13px] text-white px-4 py-2 rounded-xl flex items-center gap-2 font-medium transition-all shadow-glow hover:-translate-y-0.5 card-hover">
             <Sparkles size={14} className="text-[var(--accent-light)]" /> AI Benchmark Report
          </button>
          
          <div className="relative group">
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="appearance-none bg-[var(--bg-card)] border border-[rgba(255,255,255,0.1)] hover:border-[var(--accent)] text-white pl-4 pr-10 py-2 rounded-xl text-sm font-bold shadow-elevated focus:outline-none cursor-pointer"
            >
              <option value="B2B SaaS">B2B SaaS</option>
              <option value="Fintech">Fintech</option>
              <option value="Climate Tech">Climate Tech</option>
              <option value="Consumer">Consumer</option>
            </select>
            <Filter size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
         <Card className="lg:col-span-1 flex flex-col items-center justify-center p-6 h-full min-h-[350px]">
            <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider mb-2 self-start"><TrendingUp size={16} className="inline mr-2 text-[var(--accent)]" /> 360° Assessment</h3>
            <p className="text-xs text-[var(--text-muted)] self-start mb-4">You vs Sector Median (Normalized to 100%)</p>
            <div className="w-full flex-1">
               <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                     <PolarGrid stroke="rgba(255,255,255,0.05)" />
                     <PolarAngleAxis dataKey="name" tick={{fill: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 'bold'}} />
                     <RechartsTooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', fontSize: 12 }} />
                     <Radar name="Sector Median" dataKey="sector" stroke="rgba(255,255,255,0.2)" fill="rgba(255,255,255,0.05)" fillOpacity={1} strokeDasharray="3 3" />
                     <Radar name="Your Metrics" dataKey="user" stroke="var(--accent-light)" fill="var(--accent)" fillOpacity={0.5} />
                  </RadarChart>
               </ResponsiveContainer>
            </div>
            <div className="flex gap-4 mt-2">
               <div className="flex items-center gap-1.5"><span className="w-3 h-3 bg-[var(--accent)] rounded-full opacity-50 block"></span><span className="text-xs font-mono text-[var(--text-muted)]">You</span></div>
               <div className="flex items-center gap-1.5"><span className="w-4 h-0 border-t-2 border-dashed border-[rgba(255,255,255,0.2)] block"></span><span className="text-xs font-mono text-[var(--text-muted)]">Median</span></div>
            </div>
         </Card>

         <div className="lg:col-span-2">
            <Card className="h-full flex flex-col p-6">
               <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 pb-3 border-b border-[rgba(255,255,255,0.05)] text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider px-4">
                  <div>Metric</div>
                  <div className="text-right">Your Value</div>
                  <div className="text-right">Median</div>
                  <div className="text-right">Position</div>
               </div>

               <div className="flex-1 flex flex-col gap-2 mt-4">
                  {metrics.map(m => {
                     const pos = getPosition(m.userVal, m.bmData);
                     return (
                        <div 
                           key={m.id} 
                           onClick={() => setModalData({ name: m.name, user: m.userVal, suffix: m.suffix, pos, desc: m.bmData.desc, tips: m.bmData.tips })}
                           className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 items-center p-4 rounded-xl border border-[rgba(255,255,255,0.03)] bg-[rgba(255,255,255,0.01)] hover:bg-[rgba(255,255,255,0.04)] hover:border-[rgba(255,255,255,0.1)] transition-colors cursor-pointer group"
                        >
                           <div className="flex items-center gap-2">
                              <span className="font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-light)] transition-colors">{m.name}</span>
                              <Info size={14} className="text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                           </div>
                           <div className="text-right font-mono font-black text-lg text-[var(--text-primary)]">{m.userVal.toFixed(1)}{m.suffix}</div>
                           <div className="text-right font-mono font-medium text-sm text-[var(--text-muted)]">{m.bmData.median}{m.suffix}</div>
                           <div className="flex justify-end items-center gap-2 text-right">
                              <span className={`text-[10px] font-bold uppercase tracking-wider ${pos.text}`}>{pos.label}</span>
                              <div className={`w-2.5 h-2.5 rounded-full ${pos.dot}`}></div>
                           </div>
                        </div>
                     )
                  })}
               </div>
            </Card>
         </div>
      </div>

      <AnimatePresence>
         {modalData && (
            <div className="fixed inset-0 z-[500] bg-black/60 backdrop-blur-sm flex justify-center items-center p-4" onClick={() => setModalData(null)}>
               <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  onClick={e => e.stopPropagation()}
                  className="w-full max-w-md bg-[var(--bg-card)] border border-[rgba(255,255,255,0.1)] rounded-[var(--radius-xl)] shadow-2xl overflow-hidden p-6 relative"
               >
                  <button onClick={() => setModalData(null)} className="absolute top-4 right-4 p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[rgba(255,255,255,0.1)] transition-colors"><X size={18} /></button>
                  
                  <div className="flex items-center gap-3 mb-6">
                     <div className={`w-3 h-3 rounded-full ${modalData.pos.dot}`} />
                     <h2 className="text-xl font-bold text-[var(--text-primary)]">{modalData.name}</h2>
                  </div>

                  <div className="flex gap-4 mb-6 pt-6 border-t border-[rgba(255,255,255,0.05)]">
                     <div className="flex-1 bg-[rgba(255,255,255,0.02)] p-4 rounded-xl border border-[rgba(255,255,255,0.05)] text-center">
                        <span className="block text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider mb-1">Your Metrics</span>
                        <span className={`font-mono font-black text-2xl ${modalData.pos.text}`}>{modalData.user.toFixed(1)}{modalData.suffix}</span>
                     </div>
                     <div className="flex-1 bg-[rgba(255,255,255,0.02)] p-4 rounded-xl border border-[rgba(255,255,255,0.05)] text-center">
                        <span className="block text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider mb-1">Median</span>
                        <span className="font-mono font-black text-2xl text-[var(--text-muted)]">{bm[Object.keys(metrics).find(k=>metrics[k as any].name===modalData.name) || 'growth']?.median}{modalData.suffix}</span>
                     </div>
                  </div>

                  <p className="text-sm font-medium text-[var(--text-secondary)] leading-relaxed mb-6 bg-[rgba(99,102,241,0.05)] p-4 rounded-xl border border-[rgba(99,102,241,0.1)] border-l-4 border-l-[var(--accent-light)]">
                     {modalData.desc}
                  </p>

                  <h3 className="text-xs font-bold uppercase text-[var(--text-muted)] tracking-wider mb-3">Actionable Strategies to Improve</h3>
                  <ul className="flex flex-col gap-2">
                     {modalData.tips.map((tip: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-sm font-medium text-[var(--text-primary)]"><ChevronRight size={16} className="text-[var(--accent)] mt-0.5 shrink-0" /> {tip}</li>
                     ))}
                  </ul>

               </motion.div>
            </div>
         )}
      </AnimatePresence>
    </div>
  );
}
