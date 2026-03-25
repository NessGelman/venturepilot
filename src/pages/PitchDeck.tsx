import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Presentation, ChevronLeft, ChevronRight, Download,
  Copy, Check, Maximize2, Minimize2, Sparkles,
  Target, DollarSign, TrendingUp, Users, Zap, Shield,
  BarChart2, Globe, ArrowRight, Building2
} from 'lucide-react';
import { PageHeader, Button, Badge, Card } from '../components/Shared';

interface SlideData {
  id: number;
  title: string;
  subtitle?: string;
  notes: string;
  type: 'cover' | 'problem' | 'solution' | 'market' | 'traction' | 'product' | 'model' | 'team' | 'competition' | 'financials' | 'ask' | 'appendix';
}

const fmt = (n: number, prefix = '$') => {
  if (n >= 1e9) return `${prefix}${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${prefix}${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${prefix}${(n / 1e3).toFixed(0)}K`;
  return `${prefix}${n.toFixed(0)}`;
};

const fmtPct = (n: number) => `${n.toFixed(1)}%`;

function useSlides(state: any): SlideData[] {
  const {
    ideaName = 'Your Startup', stage = 'Seed', mrr = 0, arr = 0, burnRate = 0,
    monthlyGrowth = 0, ltv = 0, cac = 0, ndr = 100, grossMargin = 70,
    teamSize = 3, targetRaise = 0, founderNames = '', founderBios = '',
    problemStatement = '', solutionStatement = '', uniqueInsight = '',
    tam = 0, sam = 0, som = 0, revenueModel = 'SaaS', runwayMonths = 0,
    burnMultiple = 0, rule40 = 0
  } = state || {};

  return [
    {
      id: 1, type: 'cover', title: ideaName,
      subtitle: `${stage} · ${revenueModel} · ${ideaName}`,
      notes: `Opening slide. State company name, stage, and one-line pitch. Spend no more than 30 seconds on this slide. The goal is to set context and build intrigue — let the investors lean in.`,
    },
    {
      id: 2, type: 'problem',
      title: '🔥 The Problem',
      subtitle: problemStatement || 'Describe the acute pain your customers experience today.',
      notes: `This is your most important slide. Make the pain visceral and quantifiable. Use the "before" state — what does life look like without your solution? Lead with a customer story or striking statistic. Investors need to believe this problem is urgent, large, and underserved.`,
    },
    {
      id: 3, type: 'solution',
      title: '💡 Our Solution',
      subtitle: solutionStatement || 'A clear, differentiated answer to the problem above.',
      notes: `Introduce ${ideaName} in one crisp sentence. Show the "after" state — what does the customer's world look like with your product? Highlight your unique insight: ${uniqueInsight || 'what do you know that others don\'t?'}. Avoid feature lists — focus on the transformation you deliver.`,
    },
    {
      id: 4, type: 'market',
      title: '📊 Market Opportunity',
      subtitle: tam ? `TAM: ${fmt(tam)} · SAM: ${fmt(sam)} · SOM: ${fmt(som)}` : 'Total addressable, serviceable, and obtainable market.',
      notes: `Walk through the market sizing methodology — not just the numbers. TAM shows ambition, SAM shows focus, SOM shows realism. Use a bottom-up approach: # of target customers × ACV = SAM. Address why this market is growing and what's driving the tailwind (regulatory, tech, behavior shift).`,
    },
    {
      id: 5, type: 'product',
      title: '⚡ Product',
      subtitle: "What you've built, how it works, and why it's defensible.",
      notes: `Demo or screenshots here. Walk through the core user journey in 60 seconds. Emphasize: (1) time-to-value, (2) stickiness mechanisms, (3) data / network effects. If you have a proprietary data moat or novel ML, highlight it here as your technical defensibility.`,
    },
    {
      id: 6, type: 'traction',
      title: `📈 Traction`,
      subtitle: mrr > 0 ? `${fmt(mrr)} MRR · ${fmtPct(monthlyGrowth)} MoM · NDR ${fmtPct(ndr)}` : 'Show your growth trajectory and key signals of product-market fit.',
      notes: `Lead with your best metric. ${mrr > 0 ? `MRR is ${fmt(mrr)} growing at ${fmtPct(monthlyGrowth)} month-over-month.` : ''} Show the growth curve, not just current state. Include: customer count, NPS, churn rate, logos of notable customers. Social proof matters enormously at this stage. If pre-revenue, show engagement metrics or waitlist size.`,
    },
    {
      id: 7, type: 'model',
      title: '💰 Business Model',
      subtitle: `${revenueModel} · ${fmt(arr)} ARR · ${fmtPct(grossMargin)} Gross Margin`,
      notes: `Explain exactly how you make money. Cover: pricing tiers, expansion revenue mechanics, and payback period. LTV/CAC ratio is ${ltv > 0 && cac > 0 ? `${(ltv / cac).toFixed(1)}x` : 'to be calculated'} — ${ltv / Math.max(cac, 1) >= 3 ? 'above the 3× threshold investors expect.' : 'work toward the 3× benchmark.'} Show the path to unit economics improvement as you scale.`,
    },
    {
      id: 8, type: 'competition',
      title: '🗺️ Competitive Landscape',
      subtitle: 'Why now, why us, and why can\'t incumbents copy us.',
      notes: `Use a 2×2 matrix comparing key dimensions where ${ideaName} wins. Acknowledge competitors — investors know they exist. Explain your unfair advantage: proprietary data, founder expertise, distribution moat, or network effects. The question investors really ask: "Why can't [incumbent] just build this?"`,
    },
    {
      id: 9, type: 'team',
      title: '👥 Team',
      subtitle: founderNames || `${teamSize}-person founding team`,
      notes: `${founderBios || 'Highlight founder-market fit. Why is THIS team uniquely positioned to win this market?'} Cover: domain expertise, past exits, technical depth, and key advisors or investors already backing you. The team slide is often the deciding factor at early stages — investors bet on people.`,
    },
    {
      id: 10, type: 'financials',
      title: '📉 Financials',
      subtitle: `${runwayMonths}mo runway · ${fmt(burnRate)}/mo burn · Rule of 40: ${rule40.toFixed(0)}`,
      notes: `Show the last 12 months of actuals and 24-month forecast. Key metrics: burn rate ${fmt(burnRate)}/month, runway ${runwayMonths} months. Burn Multiple is ${burnMultiple.toFixed(1)}x — ${burnMultiple <= 1 ? 'excellent capital efficiency.' : burnMultiple <= 2 ? 'reasonable, with room to improve.' : 'high; show the path to < 1.5×.'} Demonstrate you understand the business deeply and can manage capital.`,
    },
    {
      id: 11, type: 'ask',
      title: '🚀 The Ask',
      subtitle: targetRaise > 0 ? `Raising ${fmt(targetRaise)} · ${stage} Round` : 'Specify your raise amount, valuation, and use of funds.',
      notes: `Be specific: ${targetRaise > 0 ? `Raising ${fmt(targetRaise)}` : 'state the raise amount'}. Break down use of proceeds: typically 40-50% engineering/product, 30-40% GTM, 10-20% ops/overhead. State your 18-month milestones: what does this capital unlock? End with the key ask — introductions, specific expertise, or a meeting to go deeper.`,
    },
    {
      id: 12, type: 'appendix',
      title: '📎 Appendix',
      subtitle: 'Detailed financials, cohort analysis, technical architecture.',
      notes: `Keep detailed models here. Include: monthly cohort retention curves, detailed P&L, cap table summary, product roadmap, and customer case studies. Don't present these unless asked — but be ready to pull them up when diligence questions arise. A deep appendix signals operational maturity.`,
    },
  ];
}

const SLIDE_ICONS: Record<string, React.ReactNode> = {
  cover: <Sparkles size={20} />, problem: <Target size={20} />, solution: <Zap size={20} />,
  market: <Globe size={20} />, traction: <TrendingUp size={20} />, product: <BarChart2 size={20} />,
  model: <DollarSign size={20} />, competition: <Shield size={20} />, team: <Users size={20} />,
  financials: <BarChart2 size={20} />, ask: <ArrowRight size={20} />, appendix: <Building2 size={20} />,
};

const SLIDE_COLORS: Record<string, string> = {
  cover: '#3b82f6', problem: '#ef4444', solution: '#3b82f6', market: '#14b8a6',
  traction: '#10b981', product: '#60a5fa', model: '#f59e0b', competition: '#6366f1',
  team: '#ec4899', financials: '#f97316', ask: '#3b82f6', appendix: '#6b7280',
};

export default function PitchDeck() {
  const { state } = useApp() as any;
  const slides = useSlides(state);
  const [current, setCurrent] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showNotes, setShowNotes] = useState(true);
  const [exportFormat, setExportFormat] = useState<'md' | 'html' | null>(null);

  const slide = slides[current];
  const color = SLIDE_COLORS[slide.type] || '#3b82f6';

  const go = useCallback((dir: number) => {
    setCurrent(c => Math.max(0, Math.min(slides.length - 1, c + dir)));
  }, [slides.length]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') go(1);
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') go(-1);
      if (e.key === 'f') setFullscreen(v => !v);
      if (e.key === 'Escape') setFullscreen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [go]);

  const exportMD = () => {
    const md = slides.map(s => `# Slide ${s.id}: ${s.title}\n\n${s.subtitle || ''}\n\n**Speaker Notes:**\n${s.notes}`).join('\n\n---\n\n');
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'pitch-deck.md'; a.click();
    URL.revokeObjectURL(url);
  };

  const exportHTML = () => {
    const ideaName = state?.ideaName || 'VenturePilot';
    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>${ideaName} Pitch Deck</title>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:-apple-system,sans-serif;background:#04060d;color:#e2e8f0;padding:40px}h1{font-size:2em;margin-bottom:.25em;background:linear-gradient(135deg,#3b82f6,#06b6d4);-webkit-background-clip:text;-webkit-text-fill-color:transparent}h2{font-size:1.1em;color:#93c5fd;margin-bottom:1em}.slide{border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:32px;margin-bottom:32px;background:rgba(255,255,255,0.02)}.meta{font-size:.7em;color:#64748b;margin-bottom:.5em}.notes{margin-top:1em;padding:1em;background:rgba(59,130,246,0.08);border-left:3px solid #3b82f6;border-radius:4px;font-size:.85em;color:#94a3b8;line-height:1.6}hr{border:none;border-top:1px solid rgba(255,255,255,0.06);margin:24px 0}</style></head><body>
<h1>${ideaName} Pitch Deck</h1><p style="color:#64748b;margin-bottom:32px">Generated by VenturePilot · ${new Date().toLocaleDateString()}</p>
${slides.map(s => `<div class="slide"><div class="meta">Slide ${s.id} · ${s.type}</div><h1>${s.title}</h1>${s.subtitle ? `<h2>${s.subtitle}</h2>` : ''}<div class="notes"><strong>Speaker Notes:</strong><br>${s.notes}</div></div>`).join('')}
</body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'pitch-deck.html'; a.click();
    URL.revokeObjectURL(url);
  };

  const copyNotes = () => {
    navigator.clipboard.writeText(slide.notes).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <PageHeader
        title="Pitch Deck"
        subtitle={`${slides.length} slides · Live from your data`}
        badge={{ label: `${current + 1} / ${slides.length}`, variant: 'default' }}
        action={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" icon={<Download size={14} />} onClick={exportMD}>MD</Button>
            <Button variant="ghost" size="sm" icon={<Download size={14} />} onClick={exportHTML}>HTML</Button>
            <Button variant="secondary" size="sm" icon={fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />} onClick={() => setFullscreen(v => !v)}>
              {fullscreen ? 'Exit' : 'Present'}
            </Button>
          </div>
        }
      />

      <div className={fullscreen ? 'fixed inset-0 z-[100] bg-[var(--bg-base)] flex flex-col' : 'grid grid-cols-1 lg:grid-cols-[200px_1fr] xl:grid-cols-[240px_1fr] gap-5'}>
        {/* Slide thumbnails */}
        {!fullscreen && (
          <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto lg:max-h-[600px] custom-scrollbar pb-2">
            {slides.map((s, i) => (
              <button key={s.id} onClick={() => setCurrent(i)}
                className="shrink-0 w-28 lg:w-full p-2.5 rounded-[var(--radius-md)] border text-left transition-all"
                style={{ background: current === i ? `${SLIDE_COLORS[s.type]}15` : 'var(--bg-card)', borderColor: current === i ? SLIDE_COLORS[s.type] : 'var(--border)' }}>
                <div className="text-[9px] font-bold mb-1 flex items-center gap-1" style={{ color: SLIDE_COLORS[s.type] }}>
                  <span className="opacity-60">{s.id}.</span> {s.type.toUpperCase()}
                </div>
                <div className="text-[10px] text-[var(--text-muted)] leading-tight line-clamp-2">{s.title}</div>
              </button>
            ))}
          </div>
        )}

        {/* Main slide view */}
        <div className={`flex flex-col gap-4 ${fullscreen ? 'flex-1 p-8 overflow-auto' : ''}`}>
          <AnimatePresence mode="wait">
            <motion.div key={current}
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="rounded-[var(--radius-xl)] overflow-hidden border border-[var(--border)]"
              style={{ background: `linear-gradient(135deg, ${color}10 0%, var(--bg-card) 100%)`, minHeight: fullscreen ? '70vh' : 360 }}
            >
              {/* Slide header bar */}
              <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${color}, ${color}44)` }} />

              <div className="p-8 lg:p-12 flex flex-col justify-between h-full" style={{ minHeight: fullscreen ? 'calc(70vh - 4px)' : 356 }}>
                {/* Slide number + type */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-[var(--radius-md)] flex items-center justify-center" style={{ background: `${color}20`, color }}>
                      {SLIDE_ICONS[slide.type]}
                    </div>
                    <div>
                      <div className="text-[9px] font-bold uppercase tracking-widest" style={{ color }}>{slide.type}</div>
                      <div className="text-[10px] text-[var(--text-muted)]">Slide {slide.id} of {slides.length}</div>
                    </div>
                  </div>
                  {/* Progress dots */}
                  <div className="flex items-center gap-1">
                    {slides.map((_, i) => (
                      <button key={i} onClick={() => setCurrent(i)}
                        className="rounded-full transition-all"
                        style={{ width: i === current ? 16 : 6, height: 6, background: i === current ? color : 'var(--border)' }} />
                    ))}
                  </div>
                </div>

                {/* Slide content */}
                <div className="flex-1 flex flex-col justify-center">
                  <motion.h1
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="text-3xl lg:text-5xl font-black mb-4 leading-tight"
                    style={{ background: `linear-gradient(135deg, #fff, ${color})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                  >
                    {slide.title}
                  </motion.h1>
                  {slide.subtitle && (
                    <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                      className="text-sm lg:text-lg text-[var(--text-secondary)] leading-relaxed max-w-2xl">
                      {slide.subtitle}
                    </motion.p>
                  )}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-8">
                  <button onClick={() => go(-1)} disabled={current === 0}
                    className="flex items-center gap-2 px-4 py-2 rounded-[var(--radius-md)] border border-[var(--border)] text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--accent)] disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                    <ChevronLeft size={15} /> Previous
                  </button>
                  <span className="text-xs text-[var(--text-muted)] hidden sm:block">← → Arrow keys to navigate · F to toggle fullscreen</span>
                  <button onClick={() => go(1)} disabled={current === slides.length - 1}
                    className="flex items-center gap-2 px-4 py-2 rounded-[var(--radius-md)] text-sm font-medium text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    style={{ background: current === slides.length - 1 ? 'var(--border)' : color }}>
                    Next <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Speaker notes */}
          {showNotes && (
            <Card>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Speaker Notes</span>
                  <Badge variant="default" size="sm">Slide {current + 1}</Badge>
                </div>
                <button onClick={copyNotes} className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                  {copied ? <Check size={13} style={{ color: 'var(--green)' }} /> : <Copy size={13} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <AnimatePresence mode="wait">
                <motion.p key={current} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {slide.notes}
                </motion.p>
              </AnimatePresence>
            </Card>
          )}
        </div>

        {/* Fullscreen close */}
        {fullscreen && (
          <button onClick={() => setFullscreen(false)}
            className="fixed top-5 right-5 z-[101] w-10 h-10 rounded-full bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors shadow-lg">
            ✕
          </button>
        )}
      </div>

      {/* Slide grid overview */}
      {!fullscreen && (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Presentation size={14} style={{ color: 'var(--accent)' }} />
            <span className="font-bold text-sm">All Slides</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {slides.map((s, i) => (
              <button key={s.id} onClick={() => setCurrent(i)}
                className="rounded-[var(--radius-lg)] border p-3 text-left transition-all hover:scale-[1.02] group"
                style={{ background: current === i ? `${SLIDE_COLORS[s.type]}12` : 'var(--bg-card)', borderColor: current === i ? SLIDE_COLORS[s.type] : 'var(--border)' }}>
                <div className="text-lg mb-1 group-hover:scale-110 transition-transform inline-block">{['🎯','🔥','💡','📊','⚡','📈','💰','🗺️','👥','📉','🚀','📎'][i]}</div>
                <div className="text-[10px] font-bold text-[var(--text-primary)] leading-tight line-clamp-2">{s.title}</div>
                <div className="text-[9px] mt-1 uppercase tracking-wide font-bold" style={{ color: SLIDE_COLORS[s.type] }}>{s.type}</div>
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
