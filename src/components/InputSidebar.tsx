import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { InputField, MetricTooltip } from './Shared';
import {
  ChevronRight,
  ChevronLeft,
  Settings2,
  Save,
  Trash,
  Undo2,
  Redo2,
  RefreshCcw,
  ChevronDown,
  ChevronUp,
  Activity,
  Flame,
  Target,
  BarChart,
  Github,
  Pen
} from 'lucide-react';

const Accordion = ({ title, icon: Icon, defaultOpen = true, children }: any) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mb-4 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-2xl overflow-hidden">
      <button 
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.05)] transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <Icon size={16} className="text-[var(--accent-light)]" />
          <span className="font-bold text-[13px] tracking-wide text-[var(--text-primary)] uppercase">
            {title}
          </span>
        </div>
        {open ? <ChevronUp size={16} className="text-[var(--text-muted)]" /> : <ChevronDown size={16} className="text-[var(--text-muted)]" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="p-4 border-t border-[rgba(255,255,255,0.05)] flex flex-col gap-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function InputSidebar({ isOpen, setIsOpen }: any) {
  const app = useApp();
  const [presetName, setPresetName] = useState('');
  const [isSavingPreset, setIsSavingPreset] = useState(false);

  const analyzeRepo = useCallback(async () => {
    const url = app.repoUrl.trim();
    if (!url) return app.addToast('Add a repo URL first.', 'error');
    
    const match = url.match(/github\.com\/([^/\s]+)\/([^/\s#]+)/i);
    if (!match) return app.addToast('Enter a valid GitHub repo URL.', 'error');
    
    const [, owner, repo] = match;
    const repoName = repo.replace(/\.git$/, '');
    
    let readme = '';
    for (const branch of ['main', 'master']) {
      try {
        const res = await fetch(`https://raw.githubusercontent.com/${owner}/${repoName}/${branch}/README.md`);
        if (res.ok) {
          readme = await res.text();
          break;
        }
      } catch {}
    }
    if (!readme) return app.addToast('Could not read repo.', 'error');
    
    const lines = readme.slice(0, 400).split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    
    app.dispatch({
      type: 'BULK_SET',
      payload: {
        idea: app.idea || lines[0] || repoName,
        problem: app.problem || lines.find(l => /problem|pain|why/i.test(l)) || `Core pain from ${repoName}.`,
        industry: app.industry || lines.find(l => /saas|ai|ml|fintech|health|infra/i.test(l)) || 'Software'
      }
    });
    app.addToast('Repo analyzed — narrative fields enriched.', 'success');
  }, [app]);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed top-1/2 -translate-y-1/2 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] z-[201] flex items-center justify-center w-5.5 h-12 bg-[var(--accent)] border-none rounded-r-xl cursor-pointer shadow-glow hover:shadow-elevated ${isOpen ? 'left-[340px]' : 'left-0'}`}
      >
        {isOpen ? <ChevronLeft size={16} className="text-white" /> : <ChevronRight size={16} className="text-white" />}
      </button>

      <div
        className={`fixed left-0 top-0 bottom-0 w-[340px] bg-[var(--bg-surface)] border-r border-[rgba(255,255,255,0.08)] z-[200] transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] flex flex-col transform shadow-2xl ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Fixed Metrics Header */}
        <div className="p-5 border-b border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] backdrop-blur-md sticky top-0 z-[10]">
          <div className="flex items-center gap-2 mb-4">
            <Settings2 size={16} className="text-[var(--accent-light)]" />
            <h3 className="text-[13px] font-bold text-[var(--text-primary)] uppercase tracking-wider">Metrics Engine</h3>
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            <div className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 ${app.derived.runwayMonths > 12 ? 'bg-[rgba(16,185,129,0.1)] border-[#10b981]' : app.derived.runwayMonths > 6 ? 'bg-[rgba(245,158,11,0.1)] border-[#f59e0b]' : 'bg-[rgba(239,68,68,0.1)] border-[#ef4444]'}`}>
              <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase">Runway</span>
              <span className="font-mono font-black text-sm text-[var(--text-primary)]">{app.derived.runwayMonths}m</span>
            </div>
            <div className="p-2 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] flex flex-col items-center justify-center gap-1">
              <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase"><MetricTooltip term="Burn Multiple">Burn Mult</MetricTooltip></span>
              <span className="font-mono font-black text-sm text-[var(--text-primary)]">{app.derived.burnMultiple}x</span>
            </div>
            <div className="p-2 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] flex flex-col items-center justify-center gap-1 relative">
              <svg viewBox="0 0 36 36" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[34px] h-[34px] -rotate-90 opacity-40 mix-blend-screen">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray={`${app.derived.readinessScore}, 100`} className="text-[var(--accent)]" />
              </svg>
              <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase z-10 w-full text-center truncate px-0.5">Ready</span>
              <span className="font-mono font-black text-[13px] text-[var(--text-primary)] z-10">{app.derived.readinessScore}</span>
            </div>
            <div className="p-2 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] flex flex-col items-center justify-center gap-1">
              <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase"><MetricTooltip term="Rule of 40">Rule 40</MetricTooltip></span>
              <span className="font-mono font-black text-sm text-[var(--text-primary)]">{app.derived.ruleOf40}%</span>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          
          <Accordion title="Financials" icon={Activity} defaultOpen>
            <InputField label="Capital Raised" value={app.capital} onChange={app.setCapital} prefix="$" slider={{min:0, max:5000000, step:10000}} />
            <InputField label="Target Raise" value={app.targetRaise} onChange={app.setTargetRaise} prefix="$" slider={{min:0, max:10000000, step:50000}} />
            <InputField label="Valuation Cap" value={app.valuation} onChange={app.setValuation} prefix="$" slider={{min:1000000, max:50000000, step:500000}} />
            <InputField label="Dilution from Raise" value={app.dilution} onChange={app.setDilution} suffix="%" slider={{min:5, max:40, step:1}} />
            <InputField label="Monthly Gross Burn" value={app.burn} onChange={app.setBurn} prefix="$" annotation={`Net: $${app.derived.netBurn.toLocaleString()}/mo`} slider={{min:1000, max:1000000, step:1000}} />
            <InputField label="Monthly Revenue (MRR)" value={app.revenue} onChange={app.setRevenue} prefix="$" annotation={`ARR: $${(app.revenue*12/1000).toLocaleString()}k`} slider={{min:0, max:1000000, step:1000}} />
            <InputField label="MoM Growth Rate" value={app.growth} onChange={app.setGrowth} suffix="%" slider={{min:-20, max:100, step:1}} />
            <InputField label="Gross Margin" value={app.grossMargin} onChange={app.setGrossMargin} suffix="%" slider={{min:10, max:98, step:1}} />
            <InputField label="NDR" value={app.ndr} onChange={app.setNdr} suffix="%" annotation="Net Dollar Retention" slider={{min:60, max:160, step:1}} />
            <InputField label="Active Pipeline" value={app.pipeline} onChange={app.setPipeline} prefix="$" slider={{min:0, max:10000000, step:10000}} />
          </Accordion>

          <Accordion title="Unit Economics" icon={BarChart} defaultOpen>
            <InputField label="CAC" value={app.cac} onChange={app.setCac} prefix="$" annotation={`Payback: ${app.derived.payback}mo`} slider={{min:0, max:10000, step:10}} />
            <InputField label="ARPU / mo" value={app.arpu} onChange={app.setArpu} prefix="$" slider={{min:5, max:5000, step:5}} />
            <InputField label="Monthly Churn" value={app.churn} onChange={app.setChurn} suffix="%" annotation={`Life: ${Math.round(100/Math.max(app.churn, 0.1))}mo`} slider={{min:0, max:20, step:0.1}} />
            
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="p-3 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-xl flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase text-[var(--accent-light)]"><MetricTooltip term="LTV">LTV</MetricTooltip></span>
                <span className="font-mono font-black text-lg">${app.derived.ltv.toLocaleString()}</span>
              </div>
              <div className="p-3 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-xl flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase text-[var(--accent-light)]"><MetricTooltip term="LTV/CAC">LTV/CAC</MetricTooltip></span>
                <span className="font-mono font-black text-lg">{(app.derived.ltv / app.cac).toFixed(1)}x</span>
              </div>
            </div>
          </Accordion>

          <Accordion title="Company" icon={Target} defaultOpen>
            <InputField label="Company Name / Idea" value={app.idea} onChange={app.setIdea} type="text" />
            <InputField label="Product Description" value={app.productDescription} onChange={app.setProductDescription} type="text" />
            <div className="flex gap-3 mb-4">
              <InputField label="Stage" value={app.stage} onChange={app.setStage} type="select" options={['Pre-seed', 'Seed', 'Series A', 'Series B', 'Growth']} />
              <InputField label="Industry" value={app.industry} onChange={app.setIndustry} type="select" options={['B2B SaaS', 'AI/ML', 'Fintech', 'Healthtech', 'Consumer', 'Deep Tech', 'Infra', 'Other']} />
            </div>
            <InputField label="Founder / Team" value={app.founder} onChange={app.setFounder} type="text" />
            <InputField label="Team Size" value={app.teamSize} onChange={app.setTeamSize} slider={{min:1, max:200, step:1}} />
            <InputField label="Target Customer (ICP)" value={app.targetCustomer} onChange={app.setTargetCustomer} type="text" />
            <InputField label="Competitors" value={app.competitors} onChange={app.setCompetitors} type="text" annotation="Comma-separated" />
            <InputField label="North Star Goal" value={app.northStar} onChange={app.setNorthStar} type="text" />
          </Accordion>

          <Accordion title="Narrative" icon={Pen} defaultOpen>
            <InputField label="Problem You Solve" value={app.problem} onChange={app.setProblem} multiline />
            <InputField label="Traction Highlights" value={app.traction} onChange={app.setTraction} multiline />
            <InputField label="Use of Funds" value={app.useOfFunds} onChange={app.setUseOfFunds} multiline />
          </Accordion>

          <Accordion title="Dev Tools" icon={Flame} defaultOpen>
            <div className="flex flex-col gap-4">
              <div className="flex gap-2">
                <InputField label="GitHub Repo URL" value={app.repoUrl} onChange={app.setRepoUrl} type="text" />
                <button 
                  onClick={analyzeRepo} 
                  className="mt-6 h-[42px] px-4 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.1)] transition-colors flex items-center justify-center flex-shrink-0"
                >
                  <Github size={16} className="text-[var(--text-primary)]" />
                </button>
              </div>

              {/* Presets System */}
              <div className="p-3 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-xl flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-[var(--text-secondary)] uppercase">Presets</span>
                  <button 
                    onClick={() => setIsSavingPreset(!isSavingPreset)}
                    className="text-[10px] uppercase font-bold text-[var(--accent-light)] flex items-center gap-1 hover:underline"
                  >
                    <Save size={10} /> Save New
                  </button>
                </div>
                
                <AnimatePresence>
                  {isSavingPreset && (
                    <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} exit={{opacity:0, height:0}} className="flex gap-2 pb-2">
                      <input 
                        value={presetName} 
                        onChange={e => setPresetName(e.target.value)} 
                        placeholder="Preset name..." 
                        className="flex-1 bg-[var(--bg-base)] border border-[var(--border)] rounded-md px-2 py-1.5 text-xs text-[var(--text-primary)]"
                      />
                      <button 
                        onClick={() => {
                          if (presetName.trim()) {
                            app.savePreset(presetName.trim());
                            setPresetName('');
                            setIsSavingPreset(false);
                            app.addToast('Preset saved', 'success');
                          }
                        }}
                        className="bg-[var(--accent)] text-white px-3 py-1.5 rounded-md text-xs font-bold shadow-glow hover:bg-[var(--accent-light)]"
                      >
                        Save
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex flex-wrap gap-2">
                  {app.presets.length === 0 ? (
                    <span className="text-xs text-[var(--text-muted)] italic">No presets saved yet.</span>
                  ) : (
                    app.presets.map(p => (
                      <div key={p.name} className="flex items-center rounded-full bg-[rgba(99,102,241,0.1)] border border-[rgba(99,102,241,0.2)] pl-3 pr-1 py-1 group">
                        <button 
                          onClick={() => { app.loadPreset(p.name); app.addToast(`Loaded ${p.name}`); }}
                          className="text-[11px] font-bold text-[var(--text-primary)] mr-2 hover:text-[var(--accent-light)]"
                        >
                          {p.name}
                        </button>
                        <button 
                          onClick={() => { app.deletePreset(p.name); app.addToast(`Deleted ${p.name}`); }}
                          className="p-1 rounded-full text-[var(--text-muted)] group-hover:bg-[rgba(239,68,68,0.2)] group-hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash size={10} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Global Controls */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button onClick={app.undo} className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.05)] transition-colors">
                  <Undo2 size={14} /> Undo
                </button>
                <button onClick={app.redo} className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.05)] transition-colors">
                  <Redo2 size={14} /> Redo
                </button>
                <button onClick={app.resetDefaults} className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.05)] transition-colors">
                  <RefreshCcw size={14} /> Reset
                </button>
                <button onClick={app.clearData} className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[rgba(239,68,68,0.05)] border border-[rgba(239,68,68,0.1)] text-xs text-red-500 hover:bg-[rgba(239,68,68,0.1)] transition-colors">
                  <Trash size={14} /> Clear All
                </button>
              </div>

            </div>
          </Accordion>
        </div>
      </div>
    </>
  );
}
