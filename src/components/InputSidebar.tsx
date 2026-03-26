import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { InputField, GaugeMini, Divider, HelpTip } from './Shared';
import {
  ChevronRight, ChevronLeft,
  Activity, BarChart2, Target, FileText, Github,
  Save, Trash2, Undo2, Redo2, RefreshCcw, ChevronDown, ChevronUp,
  Pen, Globe, TrendingUp
} from 'lucide-react';

const SIDEBAR_WIDTH = 320;

function Accordion({ title, icon: Icon, defaultOpen = true, badge, children }: any) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mb-3 rounded-[var(--radius-lg)] overflow-hidden border border-[var(--border-subtle)]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.04)] transition-colors text-left"
      >
        <div className="flex items-center gap-2.5">
          <Icon size={14} className="text-[var(--accent-light)] opacity-80" />
          <span className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">{title}</span>
          {badge && (
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-[var(--accent-dim)] text-[var(--accent-light)]">{badge}</span>
          )}
        </div>
        {open
          ? <ChevronUp size={13} className="text-[var(--text-muted)]" />
          : <ChevronDown size={13} className="text-[var(--text-muted)]" />
        }
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="px-4 pb-4 pt-3 flex flex-col gap-3">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const fmtM = (n: number) => {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n}`;
};

export default function InputSidebar({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (v: boolean) => void }) {
  const app = useApp();
  const [presetName, setPresetName] = useState('');
  const [savingPreset, setSavingPreset] = useState(false);

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
        if (res.ok) { readme = await res.text(); break; }
      } catch {}
    }
    if (!readme) return app.addToast('Could not read repo README.', 'error');
    const lines = readme.slice(0, 400).split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    app.dispatch({
      type: 'BULK_SET',
      payload: {
        idea: app.idea || lines[0] || repoName,
        problem: app.problem || lines.find(l => /problem|pain|why/i.test(l)) || `Core pain from ${repoName}.`,
        industry: app.industry || lines.find(l => /saas|ai|ml|fintech|health|infra/i.test(l)) || 'Software',
      },
    });
    app.addToast('Repo analyzed — narrative fields enriched.', 'success');
  }, [app]);

  const { derived, runwayMonths, readinessScore, burnMultiple, ruleOf40, arr } = app;
  const netBurnNum = derived?.netBurn || app.burn - app.revenue;
  const ltvCac = app.cac > 0 ? ((derived?.ltv ?? 0) / app.cac).toFixed(1) : '—';

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-1/2 -translate-y-1/2 z-[210] w-5 h-12 flex items-center justify-center bg-[var(--accent)] rounded-r-lg cursor-pointer shadow-[var(--shadow-glow-sm)] hover:shadow-[var(--shadow-glow)] transition-all"
        style={{ left: isOpen ? SIDEBAR_WIDTH : 0, transition: 'left 0.3s cubic-bezier(0.4,0,0.2,1)' }}
        title={isOpen ? 'Close sidebar (⌘\\)' : 'Open sidebar (⌘\\)'}
      >
        {isOpen ? <ChevronLeft size={13} className="text-white" /> : <ChevronRight size={13} className="text-white" />}
      </button>

      {/* Sidebar panel */}
      <div
        className="fixed left-0 top-0 bottom-0 bg-[var(--bg-surface)] border-r border-[var(--border)] z-[200] flex flex-col shadow-[2px_0_20px_rgba(0,0,0,0.4)]"
        style={{
          width: SIDEBAR_WIDTH,
          transform: isOpen ? 'translateX(0)' : `translateX(-${SIDEBAR_WIDTH}px)`,
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Metrics Engine</p>
            {(app.companyName || app.idea) && <p className="text-sm font-bold text-[var(--text-primary)] truncate mt-0.5">{app.companyName || app.idea}</p>}
          </div>
          <div className="shrink-0 flex items-center gap-1.5">
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[var(--accent-dim)] text-[var(--accent-light)]">{app.stage}</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[rgba(255,255,255,0.05)] text-[var(--text-muted)]">{app.revenueModel}</span>
          </div>
        </div>

        {/* Live metrics bar */}
        <div className="px-3 py-3 border-b border-[var(--border)] bg-[rgba(255,255,255,0.01)]">
          <div className="grid grid-cols-5 gap-1.5 mb-2">
            <MetricPill
              label="Runway"
              value={(runwayMonths ?? derived?.runwayMonths) >= 999 ? '∞' : `${runwayMonths ?? derived?.runwayMonths}m`}
              color={(runwayMonths ?? derived?.runwayMonths) >= 12 ? 'var(--green)' : (runwayMonths ?? derived?.runwayMonths) >= 6 ? 'var(--amber)' : 'var(--red)'}
            />
            <MetricPill
              label="Burn×"
              value={`${burnMultiple ?? derived?.burnMultiple}x`}
              color={(burnMultiple ?? derived?.burnMultiple) <= 1.5 ? 'var(--green)' : (burnMultiple ?? derived?.burnMultiple) <= 2.5 ? 'var(--amber)' : 'var(--red)'}
            />
            <div className="flex flex-col items-center gap-1 p-1.5 rounded-[var(--radius-md)] bg-[rgba(255,255,255,0.02)] border border-[var(--border-subtle)]">
              <GaugeMini value={readinessScore ?? derived?.readinessScore ?? 0} size={34} color="var(--accent-light)" />
              <span className="text-[8px] font-bold uppercase tracking-wider text-[var(--text-muted)] leading-none">Score</span>
            </div>
            <MetricPill
              label="R40"
              value={`${ruleOf40 ?? derived?.ruleOf40}%`}
              color={(ruleOf40 ?? derived?.ruleOf40) >= 40 ? 'var(--green)' : (ruleOf40 ?? derived?.ruleOf40) >= 20 ? 'var(--amber)' : 'var(--red)'}
            />
            <MetricPill
              label="LTV:CAC"
              value={ltvCac === '—' ? '—' : `${ltvCac}×`}
              color={ltvCac === '—' ? 'var(--text-muted)' : parseFloat(ltvCac) >= 3 ? 'var(--green)' : parseFloat(ltvCac) >= 2 ? 'var(--amber)' : 'var(--red)'}
            />
          </div>

          {/* ARR + MRR callout */}
          <div className="flex gap-1.5">
            <div className="flex-1 flex items-center justify-between px-3 py-2 rounded-[var(--radius-md)] bg-[var(--accent-dim)] border border-[var(--border-accent)]">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent-light)]">ARR</span>
              <span className="text-sm font-black font-mono text-[var(--accent-light)]">
                {fmtM(arr ?? derived?.arr ?? 0)}
              </span>
            </div>
            <div className="flex-1 flex items-center justify-between px-3 py-2 rounded-[var(--radius-md)] bg-[rgba(255,255,255,0.03)] border border-[var(--border-subtle)]">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Net Burn</span>
              <span className="text-sm font-black font-mono text-[var(--amber)]">
                {fmtM(Math.max(netBurnNum, 0))}
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable inputs */}
        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
          <Accordion title="Company" icon={Target} defaultOpen>
            <InputField label="Company Name" value={app.companyName} onChange={app.setCompanyName} type="text" placeholder="e.g. VenturePilot, Acme Corp" />
            <InputField label="One-line Pitch / Concept" value={app.idea} onChange={app.setIdea} type="text" placeholder="e.g. AI that helps founders choose the best capital source"
              help="Your elevator pitch in a single sentence. Used across pitch decks, investor updates, and AI analysis." />
            <InputField label="Product Description" value={app.productDescription} onChange={app.setProductDescription} type="text"
              help="A slightly longer description of what your product does and who it's for." />
            <div className="grid grid-cols-2 gap-2">
              <InputField label="Stage" value={app.stage} onChange={app.setStage} type="select"
                options={['Pre-seed', 'Seed', 'Series A', 'Series B', 'Growth']}
                help="Your current fundraising stage. This affects benchmark comparisons and investor matching." />
              <InputField label="Industry" value={app.industry} onChange={app.setIndustry} type="select"
                options={['B2B SaaS', 'AI/ML', 'Fintech', 'Healthtech', 'Consumer', 'Deep Tech', 'Infrastructure', 'Other']}
                help="Your primary industry vertical. Used to benchmark your metrics against sector averages." />
            </div>
            <InputField label="Founders" value={app.founder} onChange={app.setFounder} type="text" placeholder="e.g. Jane Smith, John Lee"
              help="Founder names, comma-separated. Appears in pitch decks and investor updates." />
            <InputField label="Founder Bios" value={app.founderBios} onChange={app.setFounderBios} multiline placeholder="Short background for each founder, comma-separated"
              help="Brief backgrounds for each founder. Investors look for relevant domain experience and prior exits." />
            <InputField label="Team Size" value={app.teamSize} onChange={app.setTeamSize} slider={{ min: 1, max: 200, step: 1 }}
              help="Total number of full-time employees. Used in revenue-per-employee and efficiency calculations." />
            <InputField label="Target Customer (ICP)" value={app.targetCustomer} onChange={app.setTargetCustomer} type="text"
              help="Your Ideal Customer Profile — the specific type of person or company who gets the most value from your product." />
            <InputField label="Competitors" value={app.competitors} onChange={app.setCompetitors} type="text" annotation="Comma-separated"
              help="Your main competitors. Knowing your competitive landscape helps investors understand your differentiation." />
            <InputField label="North Star Goal" value={app.northStar} onChange={app.setNorthStar} type="text"
              help="The single most important metric or milestone your company is optimizing for right now." />
          </Accordion>

          <Accordion title="Narrative" icon={Pen} defaultOpen={false}>
            <InputField label="Problem You Solve" value={app.problem} onChange={app.setProblem} multiline placeholder="The acute pain your customers experience today."
              help="Describe the painful problem your customers face today. The sharper and more specific, the better." />
            <InputField label="Your Solution" value={app.solutionStatement} onChange={app.setSolutionStatement} multiline placeholder="How your product solves that problem."
              help="How your product uniquely solves the problem. Focus on what makes your approach different." />
            <InputField label="Unique Insight" value={app.uniqueInsight} onChange={app.setUniqueInsight} multiline placeholder="What do you know that others don't?"
              help="The non-obvious insight or 'secret' that gives your company an unfair advantage. This is what makes investors believe you'll win." />
            <InputField label="Traction Highlights" value={app.traction} onChange={app.setTraction} multiline placeholder="Key wins, logos, growth signals."
              help="Your best proof points: revenue milestones, customer logos, growth rates, waitlists, or pilot results." />
            <InputField label="Use of Funds" value={app.useOfFunds} onChange={app.setUseOfFunds} multiline placeholder="Where does the raise go?"
              help="How you'll spend the money you raise. Investors want to see it tied to specific milestones (e.g. hire 3 engineers, reach $500k ARR)." />
          </Accordion>

          <Accordion title="Financials" icon={Activity} defaultOpen={false}>
            <InputField label="Capital (Bank Balance)" value={app.capital} onChange={app.setCapital} prefix="$" slider={{ min: 0, max: 5000000, step: 10000 }}
              help="Your current total cash in the bank. This is used to calculate your runway — how many months you can operate before running out of money." />
            <InputField label="Monthly Gross Burn" value={app.burn} onChange={app.setBurn} prefix="$"
              annotation={`Net: $${Math.max(netBurnNum, 0).toLocaleString()}/mo`}
              slider={{ min: 0, max: 1000000, step: 100 }}
              help="Total money spent each month (salaries, rent, servers, etc.), before subtracting revenue. Net burn = Gross Burn minus MRR." />
            <InputField label="MRR" value={app.revenue} onChange={app.setRevenue} prefix="$"
              annotation={`ARR: ${fmtM(app.revenue * 12)}`}
              slider={{ min: 0, max: 1000000, step: 1000 }}
              help="Monthly Recurring Revenue — the predictable subscription revenue you earn every month. The heartbeat metric for SaaS businesses." />
            <InputField label="MoM Growth Rate" value={app.growth} onChange={app.setGrowth} suffix="%" slider={{ min: -20, max: 100, step: 1 }}
              help="Month-over-Month growth — how much your MRR increases each month as a percentage. 8–15% is typical at Seed; 20%+ is exceptional." />
            <InputField label="Gross Margin" value={app.grossMargin} onChange={app.setGrossMargin} suffix="%" slider={{ min: 0, max: 100, step: 1 }}
              help="Revenue minus the direct cost of delivering your product, as a % of revenue. SaaS target is 70–80%+. Low margins can hurt valuation." />
            <InputField label="NDR" value={app.ndr} onChange={app.setNdr} suffix="%" annotation="Net Dollar Retention" slider={{ min: 0, max: 200, step: 1 }}
              help="Net Dollar Retention — how much revenue you keep and grow from existing customers. Above 100% means customers spend more over time (expansions outpace cancellations). World-class is 120%+." />
            <InputField label="Active Pipeline" value={app.pipeline} onChange={app.setPipeline} prefix="$" slider={{ min: 0, max: 10000000, step: 10000 }}
              help="The total dollar value of deals in your sales pipeline that could realistically close. Used to calculate pipeline coverage ratio." />
            <Divider label="Fundraise" />
            <InputField label="Target Raise" value={app.targetRaise} onChange={app.setTargetRaise} prefix="$" slider={{ min: 0, max: 10000000, step: 10000 }}
              help="How much capital you're trying to raise in your next funding round. Drives the fundraise timeline and dilution calculations." />
            <InputField label="Valuation Cap" value={app.valuation} onChange={app.setValuation} prefix="$" slider={{ min: 0, max: 50000000, step: 500000 }}
              help="For SAFEs and convertible notes — the maximum valuation at which your note converts into equity. Protects early investors if the company's valuation rises quickly." />
            <InputField label="Dilution" value={app.dilution} onChange={app.setDilution} suffix="%" slider={{ min: 0, max: 100, step: 1 }}
              help="The percentage of company ownership you're giving to investors in this round. Typical Seed rounds are 15–25%. Higher dilution leaves less for founders and future rounds." />
          </Accordion>

          <Accordion title="Unit Economics" icon={BarChart2} defaultOpen>
            <InputField label="CAC" value={app.cac} onChange={app.setCac} prefix="$"
              annotation={`Payback: ${derived?.payback ?? 0}mo`}
              slider={{ min: 0, max: 10000, step: 10 }}
              help="Customer Acquisition Cost — the average amount you spend to acquire one new paying customer (marketing + sales costs ÷ new customers). Lower is better." />
            <InputField label="ARPU / month" value={app.arpu} onChange={app.setArpu} prefix="$" slider={{ min: 0, max: 5000, step: 5 }}
              help="Average Revenue Per User per month — how much the typical customer pays you each month. Used to calculate LTV." />
            <InputField label="Monthly Churn" value={app.churn} onChange={app.setChurn} suffix="%"
              annotation={app.churn > 0 ? `Life: ${Math.round(100 / app.churn)}mo` : 'Life: ∞ (0% churn)'}
              slider={{ min: 0, max: 20, step: 0.1 }}
              help="The percentage of customers who cancel their subscription each month. 1–2% is typical for B2B SaaS; anything above 5% is a serious problem." />
            <div className="grid grid-cols-2 gap-2 mt-1">
              <div className="p-2.5 bg-[rgba(255,255,255,0.02)] border border-[var(--border-subtle)] rounded-[var(--radius-md)]">
                <div className="flex items-center gap-1 mb-0.5">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--accent-light)]">LTV</p>
                  <HelpTip content="Lifetime Value — the total revenue expected from one customer over their entire relationship with you. Calculated as ARPU ÷ Monthly Churn Rate. Healthy LTV is at least 3× your CAC." />
                </div>
                <p className="text-sm font-black font-mono text-[var(--text-primary)]">${(derived?.ltv ?? 0).toLocaleString()}</p>
              </div>
              <div className="p-2.5 bg-[rgba(255,255,255,0.02)] border border-[var(--border-subtle)] rounded-[var(--radius-md)]">
                <div className="flex items-center gap-1 mb-0.5">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--accent-light)]">LTV:CAC</p>
                  <HelpTip content="The ratio of Lifetime Value to Customer Acquisition Cost. Above 3× is healthy — it means each customer earns back their acquisition cost 3 times over. Below 1× means you're losing money on every customer." />
                </div>
                <p className="text-sm font-black font-mono" style={{ color: ltvCac === '—' ? 'var(--text-muted)' : parseFloat(ltvCac) >= 3 ? 'var(--green)' : parseFloat(ltvCac) >= 2 ? 'var(--amber)' : 'var(--red)' }}>{ltvCac === '—' ? '—' : `${ltvCac}×`}</p>
              </div>
            </div>
          </Accordion>

          <Accordion title="Market" icon={Globe} defaultOpen={false}>
            <InputField label="Revenue Model" value={app.revenueModel} onChange={app.setRevenueModel} type="select"
              options={['SaaS', 'Usage-based', 'Marketplace', 'Transactional', 'Advertising', 'Hardware+SaaS', 'Open Core']}
              help="How your business makes money. This affects which benchmarks and metrics are most relevant to your company." />
            <Divider label="Market Sizing" />
            <InputField label="TAM — Total Market" value={app.tam} onChange={app.setTam} prefix="$"
              annotation={fmtM(app.tam)}
              slider={{ min: 0, max: 500000000000, step: 100000000 }}
              help="Total Addressable Market — the entire potential market if every possible customer used a solution like yours. Investors want to see TAM > $1B for venture-scale businesses." />
            <InputField label="SAM — Serviceable" value={app.sam} onChange={app.setSam} prefix="$"
              annotation={fmtM(app.sam)}
              slider={{ min: 0, max: 50000000000, step: 10000000 }}
              help="Serviceable Addressable Market — the portion of TAM you can realistically reach with your current product, distribution, and geography. Usually 10–30% of TAM." />
            <InputField label="SOM — Obtainable" value={app.som} onChange={app.setSom} prefix="$"
              annotation={fmtM(app.som)}
              slider={{ min: 0, max: 5000000000, step: 1000000 }}
              help="Serviceable Obtainable Market — the realistic slice of SAM you can capture in the next 3–5 years. This is what you're actually pitching investors on." />
            {/* Quick ratio check */}
            <div className="flex gap-1.5 mt-0.5">
              {[
                { label: 'SAM/TAM', value: app.tam > 0 ? `${((app.sam / app.tam) * 100).toFixed(1)}%` : '—' },
                { label: 'SOM/SAM', value: app.sam > 0 ? `${((app.som / app.sam) * 100).toFixed(1)}%` : '—' },
              ].map(m => (
                <div key={m.label} className="flex-1 p-2 bg-[rgba(255,255,255,0.02)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-center">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--accent-light)] mb-0.5">{m.label}</p>
                  <p className="text-xs font-black font-mono text-[var(--text-primary)]">{m.value}</p>
                </div>
              ))}
            </div>
          </Accordion>

          <Accordion title="Dev Tools" icon={Github} defaultOpen={false}>
            {/* Repo analyzer */}
            <div className="flex gap-2">
              <InputField label="GitHub Repo URL" value={app.repoUrl} onChange={app.setRepoUrl} type="text" />
              <button
                onClick={analyzeRepo}
                className="mt-5 h-10 px-3 rounded-[var(--radius-md)] bg-[var(--accent-dim)] border border-[var(--border-accent)] hover:bg-[rgba(59,130,246,0.18)] transition-colors flex items-center justify-center shrink-0"
                title="Analyze README"
              >
                <Github size={14} className="text-[var(--accent-light)]" />
              </button>
            </div>

            {/* Presets */}
            <div className="p-3 bg-[rgba(255,255,255,0.02)] border border-[var(--border-subtle)] rounded-[var(--radius-md)]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Saved Presets</span>
                <button
                  onClick={() => setSavingPreset(s => !s)}
                  className="text-[10px] font-bold text-[var(--accent-light)] hover:underline flex items-center gap-1"
                >
                  <Save size={10} /> New
                </button>
              </div>

              <AnimatePresence>
                {savingPreset && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex gap-2 mb-2"
                  >
                    <input
                      value={presetName}
                      onChange={e => setPresetName(e.target.value)}
                      placeholder="Preset name..."
                      className="flex-1 bg-[var(--bg-base)] border border-[var(--border)] rounded-[var(--radius-md)] px-2 py-1.5 text-xs text-[var(--text-primary)] focus:border-[var(--accent)] outline-none"
                    />
                    <button
                      onClick={() => {
                        if (presetName.trim()) {
                          app.savePreset(presetName.trim());
                          setPresetName('');
                          setSavingPreset(false);
                          app.addToast('Preset saved', 'success');
                        }
                      }}
                      className="bg-[var(--accent)] text-white px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-bold"
                    >
                      Save
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex flex-wrap gap-1.5">
                {app.presets.length === 0 ? (
                  <span className="text-xs text-[var(--text-muted)] italic">No presets yet.</span>
                ) : app.presets.map(p => (
                  <div key={p.name} className="flex items-center gap-1 rounded-full bg-[var(--accent-dim)] border border-[var(--border-accent)] pl-3 pr-1 py-1">
                    <button
                      onClick={() => { app.loadPreset(p.name); app.addToast(`Loaded "${p.name}"`, 'success'); }}
                      className="text-[11px] font-bold text-[var(--accent-light)] hover:underline"
                    >
                      {p.name}
                    </button>
                    <button
                      onClick={() => { app.deletePreset(p.name); app.addToast(`Deleted "${p.name}"`, 'info'); }}
                      className="p-1 rounded-full hover:bg-[rgba(239,68,68,0.2)] text-[var(--text-muted)] hover:text-[var(--red)] transition-colors"
                    >
                      <Trash2 size={9} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: Undo2, label: 'Undo', action: app.undo },
                { icon: Redo2, label: 'Redo', action: app.redo },
                { icon: RefreshCcw, label: 'Reset', action: app.resetDefaults },
                { icon: Trash2, label: 'Clear', action: app.clearData, danger: true },
              ].map(b => (
                <button
                  key={b.label}
                  onClick={b.action}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-[var(--radius-md)] text-xs font-medium transition-colors ${
                    b.danger
                      ? 'bg-[var(--red-dim)] border border-[rgba(239,68,68,0.15)] text-[var(--red)] hover:bg-[rgba(239,68,68,0.15)]'
                      : 'bg-[rgba(255,255,255,0.03)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.05)]'
                  }`}
                >
                  <b.icon size={12} /> {b.label}
                </button>
              ))}
            </div>
          </Accordion>
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-[var(--border)] flex items-center justify-between">
          <span className="text-[9px] text-[var(--text-muted)] font-medium">
            {app.lastSaved ? `Saved ${new Date(app.lastSaved).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Not saved yet'}
          </span>
          <span className="text-[9px] font-bold text-[var(--accent-light)] uppercase tracking-wider">VenturePilot v2</span>
        </div>
      </div>
    </>
  );
}

const PILL_HELP: Record<string, string> = {
  'Runway': 'How many months until you run out of cash, based on your current net burn rate. Green = 12+ months, amber = 6–12, red = under 6.',
  'Burn×': 'Burn Multiple — how much you spend for every $1 of new ARR added. Under 1.5× is excellent; above 2.5× means you\'re spending too much to grow.',
  'Score': 'Investor Readiness Score (0–100) — a composite of your financial health, unit economics, and narrative completeness. 70+ is investor-ready.',
  'R40': 'Rule of 40 — Growth % + Profit Margin %. A score above 40% signals a healthy balance between growth and efficiency. Key SaaS health metric.',
  'LTV:CAC': 'Ratio of customer Lifetime Value to Customer Acquisition Cost. Above 3× is healthy — it means each customer earns back their acquisition cost 3 times over.',
};

function MetricPill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex flex-col items-center gap-1 p-1.5 rounded-[var(--radius-md)] bg-[rgba(255,255,255,0.02)] border border-[var(--border-subtle)]">
      <div className="flex items-center gap-0.5">
        <span className="text-[8px] font-bold uppercase tracking-wider text-[var(--text-muted)] leading-none">{label}</span>
        {PILL_HELP[label] && <HelpTip content={PILL_HELP[label]} />}
      </div>
      <span className="text-xs font-black font-mono leading-none" style={{ color }}>{value}</span>
    </div>
  );
}
