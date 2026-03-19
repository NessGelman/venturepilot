import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Presentation, Download, FileJson, Copy, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

export default function PitchDeck() {
  const app = useApp();
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    {
      id: 'title',
      title: app.idea || 'Company Name',
      content: app.productDescription || 'One sentence pitch goes here',
      bg: 'bg-gradient-to-br from-[var(--bg-card)] to-[rgba(99,102,241,0.1)]'
    },
    {
      id: 'problem',
      title: 'The Problem',
      content: app.problem || 'Describe the pain point you are solving...',
      bg: 'bg-[var(--bg-card)]'
    },
    {
      id: 'solution',
      title: 'Our Solution',
      content: `We built a product that solves this for ${app.targetCustomer}.`,
      bg: 'bg-[var(--bg-card)]'
    },
    {
      id: 'market',
      title: 'Market Size',
      content: `Operating in the highly lucrative ${app.industry} space.\n\nTAM: $XX Billion\nSAM: $X Billion\nSOM: $XXX Million`,
      bg: 'bg-[var(--bg-card)]'
    },
    {
      id: 'gtm',
      title: 'Go-To-Market',
      content: `Targeting: ${app.targetCustomer}\nCAC: $${app.cac.toLocaleString()}\nPayback Period: ${app.derived.payback} months`,
      bg: 'bg-[var(--bg-card)]'
    },
    {
      id: 'traction',
      title: 'Traction',
      content: app.traction || `ARR: $${(app.derived.arr/1000).toLocaleString()}k\nGrowth: ${app.growth}% MoM\nNDR: ${app.ndr}%`,
      bg: 'bg-[var(--bg-card)]'
    },
    {
      id: 'product',
      title: 'Product',
      content: `Core value proposition: ${app.northStar}`,
      bg: 'bg-[var(--bg-card)]'
    },
    {
      id: 'bizmodel',
      title: 'Business Model',
      content: `Pricing: $${app.arpu.toLocaleString()} ARPU/mo\nGross Margin: ${app.grossMargin}%\nLTV: $${app.derived.ltv.toLocaleString()}`,
      bg: 'bg-[var(--bg-card)]'
    },
    {
      id: 'team',
      title: 'Team',
      content: `${app.founder} (${app.teamSize} employees)\n\nWe have the unique insights to win this market.`,
      bg: 'bg-[var(--bg-card)]'
    },
    {
      id: 'financials',
      title: 'Financials',
      content: `Current Runway: ${app.derived.runwayMonths} months\nMonthly Burn: $${app.burn.toLocaleString()}\nBurn Multiple: ${app.derived.burnMultiple}x`,
      bg: 'bg-[var(--bg-card)]'
    },
    {
      id: 'competition',
      title: 'Competition',
      content: `Competitors: ${app.competitors || 'None listed yet.'}\n\nOur Moat: Better UX, better distribution, unique AI integration.`,
      bg: 'bg-[var(--bg-card)]'
    },
    {
      id: 'ask',
      title: 'The Ask',
      content: `Raising $${(app.targetRaise/1000000).toFixed(2)}M\nat a $${(app.valuation/1000000).toFixed(2)}M Cap\n\nUse of Funds:\n${app.useOfFunds || 'Engineering, Go-to-market, Operations'}`,
      bg: 'bg-gradient-to-tl from-[var(--bg-card)] to-[rgba(16,185,129,0.1)]'
    }
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setActiveSlide(s => Math.min(slides.length - 1, s + 1));
      if (e.key === 'ArrowLeft') setActiveSlide(s => Math.max(0, s - 1));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slides.length]);

  const exportMarkdown = () => {
    const md = slides.map((s, i) => `## Slide ${i+1}: ${s.title}\n\n${s.content}\n\n---\n`).join('\n');
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${app.idea.split(' ')[0] || 'pitch'}_deck.md`;
    a.click();
  };

  const exportHTML = () => {
    const html = `
<!DOCTYPE html>
<html>
<head>
<title>${app.idea} Pitch Deck</title>
<style>
  body { font-family: sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 2rem; display: flex; flex-direction: column; align-items: center; gap: 2rem; }
  .slide { aspect-ratio: 16/9; width: 800px; background: #1e293b; border-radius: 12px; padding: 3rem; box-shadow: 0 10px 30px rgba(0,0,0,0.5); display: flex; flex-direction: column; justify-content: center; }
  .slide h2 { font-size: 2.5rem; margin-top: 0; color: #818cf8; }
  .slide pre { white-space: pre-wrap; font-family: inherit; font-size: 1.5rem; line-height: 1.5; }
</style>
</head>
<body>
  ${slides.map((s, i) => `
  <div class="slide" id="slide-${i}">
    <h2>${s.title}</h2>
    <pre>${s.content}</pre>
  </div>`).join('\n')}
</body>
</html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${app.idea.split(' ')[0] || 'pitch'}_deck.html`;
    a.click();
  };

  const copySlide = () => {
    const s = slides[activeSlide];
    navigator.clipboard.writeText(`Slide: ${s.title}\n\n${s.content}`);
    app.addToast('Slide copied to clipboard', 'success');
  };

  const submitAI = (prompt: string) => {
    window.dispatchEvent(new CustomEvent('open-ai-panel', { detail: { prompt } }));
  };

  const current = slides[activeSlide];

  return (
    <div className="max-w-[1200px] mx-auto pb-24 h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 px-2">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Presentation className="text-[var(--accent)]" /> Pitch Deck Generator
          </h1>
          <p className="text-[var(--text-muted)] mt-1 font-medium font-mono text-sm tracking-wide">
             12-slide structured narrative. Export anywhere. Use ←/→ arrows to navigate.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={() => submitAI('Critique my current pitch deck content and suggest one major improvement for the narrative.')} className="bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.1)] text-[13px] text-white px-4 py-2 rounded-xl flex items-center gap-2 font-medium transition-all shadow-glow hover:-translate-y-0.5 card-hover">
             <Sparkles size={14} className="text-[var(--accent-light)]" /> AI Review
          </button>
          <div className="flex bg-[rgba(255,255,255,0.05)] rounded-xl border border-[rgba(255,255,255,0.1)] p-1">
             <button onClick={exportMarkdown} className="px-3 py-1.5 text-xs font-bold text-[var(--text-muted)] hover:text-white rounded-md hover:bg-[rgba(255,255,255,0.05)] flex items-center gap-2 transition-colors">
               <FileJson size={14} /> Markdown
             </button>
             <button onClick={exportHTML} className="px-3 py-1.5 text-xs font-bold text-[var(--text-muted)] hover:text-white rounded-md hover:bg-[rgba(255,255,255,0.05)] flex items-center gap-2 transition-colors">
               <Download size={14} /> HTML
             </button>
          </div>
        </div>
      </div>

      {/* Main Presentation Screen */}
      <div className="flex-1 flex items-center justify-center relative min-h-[500px]">
         <div className="absolute left-0 z-10 p-4">
            <button 
               onClick={() => setActiveSlide(s => Math.max(0, s - 1))}
               disabled={activeSlide === 0}
               className="w-12 h-12 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center hover:bg-[var(--accent)] text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
            >
               <ChevronLeft size={24} />
            </button>
         </div>
         
         <div className={`w-full max-w-4xl aspect-video rounded-[24px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] border border-[rgba(255,255,255,0.1)] relative overflow-hidden flex flex-col justify-center p-16 ${current.bg} transition-colors duration-500`}>
            
            <div className="absolute top-6 right-6 flex gap-2">
               <button onClick={copySlide} className="p-2 rounded-lg bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] text-[var(--text-muted)] hover:text-white transition-colors">
                  <Copy size={16} />
               </button>
            </div>

            <div className="absolute top-6 left-6 text-sm font-bold font-mono text-[var(--accent-light)] opacity-70">
               {String(activeSlide + 1).padStart(2, '0')} / {slides.length}
            </div>

            <h2 className={`text-5xl font-black text-white mb-8 tracking-tight ${activeSlide === 0 ? 'text-6xl text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400' : ''}`}>
               {current.title}
            </h2>
            <div className={`text-2xl text-[var(--text-secondary)] font-medium leading-relaxed whitespace-pre-wrap ${activeSlide === 0 ? 'text-center text-3xl' : ''}`}>
               {current.content}
            </div>
         </div>

         <div className="absolute right-0 z-10 p-4">
            <button 
               onClick={() => setActiveSlide(s => Math.min(slides.length - 1, s + 1))}
               disabled={activeSlide === slides.length - 1}
               className="w-12 h-12 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center hover:bg-[var(--accent)] text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
            >
               <ChevronRight size={24} />
            </button>
         </div>
      </div>

      {/* Thumbnail Strip */}
      <div className="mt-8 overflow-x-auto pb-4 custom-scrollbar">
         <div className="flex gap-4 min-w-max px-2">
            {slides.map((s, idx) => (
               <button
                  key={s.id}
                  onClick={() => setActiveSlide(idx)}
                  className={`relative flex flex-col justify-center items-center w-32 aspect-video rounded-xl border-2 transition-all overflow-hidden ${activeSlide === idx ? 'border-[var(--accent)] shadow-glow scale-105 z-10' : 'border-[rgba(255,255,255,0.1)] opacity-50 hover:opacity-100'} ${s.bg}`}
               >
                  <span className="text-[10px] font-bold text-[var(--text-primary)] text-center px-2 line-clamp-2">
                     {s.title}
                  </span>
                  <span className="absolute bottom-1 right-2 text-[8px] font-mono font-bold text-[var(--text-muted)] opacity-50">
                     {idx + 1}
                  </span>
               </button>
            ))}
         </div>
      </div>

    </div>
  );
}
