import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card, SectionHeader, Badge } from '../components/Shared';
import { Target, AlertTriangle, ArrowRight, Settings2, Plus, GripVertical, Trash2, ListChecks, SplitSquareHorizontal, Sparkles } from 'lucide-react';

const PRESET_CHECKLISTS = {
  'Pre-Seed Milestones': [
    { id: '1', label: 'Launch working MVP', done: false },
    { id: '2', label: '10 paying design partners', done: false },
    { id: '3', label: 'Define ICP and Core Problem', done: false },
  ],
  'Series A Readiness': [
    { id: '1', label: '$1M+ ARR', done: false },
    { id: '2', label: 'Net Dollar Retention > 105%', done: false },
    { id: '3', label: 'Repeatable sales motion', done: false },
  ],
  'Fundraising Sprint': [
    { id: '1', label: 'Update Pitch Deck', done: false },
    { id: '2', label: 'Build Investor CRM (50+ prospects)', done: false },
    { id: '3', label: 'Draft Q&A Memo', done: false },
  ]
};

const ScenarioColumn = ({ title, activeOption, setActiveOption, options, baseGrowth, baseBurn, app }: any) => {
  const [shifts, setShifts] = useState({ burn: 0, growth: 0, headcount: 0 });

  const active = options.find((o: any) => o.id === activeOption);
  const burnMult = active ? active.burnM : 1;
  const growthMult = active ? active.growthM : 1;

  const simBurn = baseBurn * burnMult * (1 + shifts.burn / 100) * (1 + shifts.headcount / 100);
  const simGrowth = baseGrowth * growthMult * (1 + shifts.growth / 100);
  const simNetBurn = Math.max(simBurn - app.revenue, 1);
  const simRunway = Math.round(app.capital / simNetBurn);
  const simARR = app.revenue * 12 * Math.pow(1 + simGrowth / 100, 12);

  const deltaRunway = simRunway - app.derived.runwayMonths;
  const deltaBurn = simBurn - app.burn;
  const deltaGrowth = simGrowth - app.growth;

  return (
    <div className="flex-1 flex flex-col gap-6">
      <SectionHeader icon={Settings2} title={title} />
      
      <div className="flex gap-2 p-1 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-xl overflow-x-auto custom-scrollbar">
        {options.map((opt: any) => (
          <button
            key={opt.id}
            onClick={() => { setActiveOption(opt.id); setShifts({burn:0, growth:0, headcount:0}); }}
            className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${activeOption === opt.id ? 'bg-[var(--accent)] text-white shadow-glow' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.05)]'}`}
          >
            {opt.name}
          </button>
        ))}
      </div>

      <Card padding="1.5rem" className="flex flex-col gap-4">
        <p className="text-sm font-medium text-[var(--text-secondary)]">{active?.desc}</p>
        
        <div className="flex flex-col gap-4 mt-2">
          <div>
            <div className="flex justify-between items-end mb-1 text-xs font-bold uppercase text-[var(--text-muted)] tracking-wider">
               <span>Growth Shift</span>
               <span className="text-[var(--accent-light)]">{shifts.growth > 0 ? '+' : ''}{shifts.growth}%</span>
            </div>
            <input 
               type="range" min="-50" max="100" step="5" 
               value={shifts.growth} onChange={e => setShifts(s => ({...s, growth: Number(e.target.value)}))}
               className="w-full accent-[var(--accent)] h-1 bg-[rgba(255,255,255,0.1)] rounded-full appearance-none"
            />
          </div>
          <div>
            <div className="flex justify-between items-end mb-1 text-xs font-bold uppercase text-[var(--text-muted)] tracking-wider">
               <span>Burn Shift</span>
               <span className="text-[var(--accent-light)]">{shifts.burn > 0 ? '+' : ''}{shifts.burn}%</span>
            </div>
            <input 
               type="range" min="-50" max="100" step="5" 
               value={shifts.burn} onChange={e => setShifts(s => ({...s, burn: Number(e.target.value)}))}
               className="w-full accent-[var(--accent)] h-1 bg-[rgba(255,255,255,0.1)] rounded-full appearance-none"
            />
          </div>
          <div>
            <div className="flex justify-between items-end mb-1 text-xs font-bold uppercase text-[var(--text-muted)] tracking-wider">
               <span>Headcount Adjust (<Badge color="var(--accent-light)">Proportional Burn</Badge>)</span>
               <span className="text-[var(--accent-light)]">{shifts.headcount > 0 ? '+' : ''}{shifts.headcount}%</span>
            </div>
            <input 
               type="range" min="-50" max="100" step="5" 
               value={shifts.headcount} onChange={e => setShifts(s => ({...s, headcount: Number(e.target.value)}))}
               className="w-full accent-cyan-400 h-1 bg-[rgba(255,255,255,0.1)] rounded-full appearance-none"
            />
          </div>
        </div>

        {/* Real-time Preview Badges */}
        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-[rgba(255,255,255,0.05)]">
           <div className={`p-3 rounded-xl border ${deltaRunway >= 0 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'} flex flex-col`}>
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Δ Runway</span>
              <span className={`font-mono font-black text-lg ${deltaRunway >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                 {deltaRunway > 0 ? '+' : ''}{deltaRunway}m
              </span>
           </div>
           <div className={`p-3 rounded-xl border flex flex-col ${deltaGrowth >= 0 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Δ Growth</span>
              <span className={`font-mono font-black text-lg ${deltaGrowth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                 {deltaGrowth > 0 ? '+' : ''}{deltaGrowth.toFixed(1)}%
              </span>
           </div>
           <div className={`p-3 rounded-xl border flex flex-col ${deltaBurn <= 0 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Δ Burn</span>
              <span className={`font-mono font-black text-lg ${deltaBurn <= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                 {deltaBurn > 0 ? '+' : ''}${(deltaBurn/1000).toFixed(1)}k
              </span>
           </div>
           <div className="p-3 rounded-xl border border-[var(--accent)] bg-[rgba(99,102,241,0.05)] flex flex-col">
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Proj. ARR (12m)</span>
              <span className="font-mono font-black text-lg text-[var(--accent-light)]">
                 ${(Math.round(simARR)/1000).toFixed(0)}k
              </span>
           </div>
        </div>
      </Card>
    </div>
  );
};

export default function Strategy() {
  const app = useApp();
  const [activeScen1, setActiveScen1] = useState('statusQuo');
  const [activeScen2, setActiveScen2] = useState('profitSprint');
  const [compareMode, setCompareMode] = useState(false);
  const [newItemText, setNewItemText] = useState('');
  
  const scenarios = [
    { id: 'statusQuo', name: 'Status Quo', burnM: 1, growthM: 1, desc: 'Keep burn and growth rates exactly as configured.' },
    { id: 'profitSprint', name: 'ProfitSprint', burnM: 0.7, growthM: 0.5, desc: 'Cut burn significantly, accept slower growth.' },
    { id: 'hypergrowth', name: 'Hypergrowth', burnM: 2.0, growthM: 1.5, desc: 'Double down on spending to accelerate topline revenue.' },
    { id: 'extend', name: 'Extend Runway', burnM: 0.85, growthM: 0.9, desc: 'Slight reduction in spend to squeeze out extra months.' },
    { id: 'invest', name: 'Invest', burnM: 1.2, growthM: 1.15, desc: 'Moderate increase to push for next stage metrics.' },
  ];

  const handleDragStart = (e: any, index: number) => {
     e.dataTransfer.setData('index', index.toString());
  };
  
  const handleDrop = (e: any, dropIndex: number) => {
     const dragIndex = Number(e.dataTransfer.getData('index'));
     if (dragIndex === dropIndex) return;
     const newChecklist = [...app.state.checklist];
     const [dragged] = newChecklist.splice(dragIndex, 1);
     newChecklist.splice(dropIndex, 0, dragged);
     app.dispatch({ type: 'BULK_SET', payload: { checklist: newChecklist } });
  };

  const completedCount = app.state.checklist.filter(c => c.done).length;
  const progressPct = app.state.checklist.length === 0 ? 0 : Math.round((completedCount / app.state.checklist.length) * 100);

  const submitAI = (prompt: string) => {
    window.dispatchEvent(new CustomEvent('open-ai-panel', { detail: { prompt } }));
  };

  return (
    <div className="max-w-[1400px] mx-auto pb-24">
      
      {app.derived.burnMultiple > 2.0 && (
         <div className="w-full bg-red-500/10 border-l-4 border-red-500 text-red-500 px-4 py-3 rounded-xl flex items-center gap-3 mb-6 shadow-glow">
            <AlertTriangle size={20} />
            <div>
               <p className="font-bold text-sm text-red-400">High Burn Multiple Alert</p>
               <p className="text-xs font-medium text-red-500/80">Your burn multiple is {app.derived.burnMultiple}x. Consider engaging Profitability Sprint scenario.</p>
            </div>
         </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Target className="text-[var(--accent)]" /> Strategy
          </h1>
          <p className="text-[var(--text-muted)] mt-1 font-medium font-mono text-sm tracking-wide">
            Model forward-looking scenarios and execution milestones.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={() => submitAI('Based on my current burn and growth rate, which scenario should I prioritize?')} className="bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.1)] text-[13px] text-white px-4 py-2 rounded-[var(--radius-lg)] flex items-center gap-2 font-medium transition-all shadow-glow hover:-translate-y-0.5 card-hover">
             <Sparkles size={14} className="text-[var(--accent-light)]" /> Compare Scenarios
          </button>
          <button 
             onClick={() => setCompareMode(!compareMode)}
             className={`px-4 py-2 rounded-[var(--radius-lg)] flex items-center gap-2 text-[13px] font-bold transition-all card-hover hover:-translate-y-0.5 ${compareMode ? 'bg-[var(--accent)] text-white shadow-glow' : 'bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-[var(--text-muted)] hover:text-white'}`}
          >
             <SplitSquareHorizontal size={14} /> Compare Mode
          </button>
        </div>
      </div>

      <div className={`grid gap-8 mb-12 ${compareMode ? 'grid-cols-2' : 'grid-cols-1 md:w-3/4 lg:w-1/2'}`}>
         <ScenarioColumn title={compareMode ? "Scenario A" : "Primary Scenario"} activeOption={activeScen1} setActiveOption={setActiveScen1} options={scenarios} baseGrowth={app.growth} baseBurn={app.burn} app={app} />
         {compareMode && (
            <ScenarioColumn title="Scenario B" activeOption={activeScen2} setActiveOption={setActiveScen2} options={scenarios} baseGrowth={app.growth} baseBurn={app.burn} app={app} />
         )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <Card className="h-full flex flex-col">
               <SectionHeader icon={ListChecks} title="Execution Milestones" subtitle="Drag to reorder • Complete to advance readiness" />
               
               <div className="mb-6">
                  <div className="flex justify-between text-xs font-bold text-[var(--text-muted)] uppercase mb-2">
                     <span>Progress</span>
                     <span className="text-[var(--accent-light)] font-mono">{progressPct}% ({completedCount}/{app.state.checklist.length})</span>
                  </div>
                  <div className="w-full bg-[rgba(255,255,255,0.05)] h-2 rounded-full overflow-hidden">
                     <div className="h-full bg-[var(--accent)] transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]" style={{ width: `${progressPct}%` }} />
                  </div>
               </div>

               <div className="flex-1 flex flex-col gap-2">
                  {app.state.checklist.map((item, idx) => (
                     <div 
                        key={item.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, idx)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleDrop(e, idx)}
                        className={`group flex items-center gap-3 p-3 rounded-xl border border-[rgba(255,255,255,0.05)] cursor-grab active:cursor-grabbing transition-colors ${item.done ? 'bg-[rgba(255,255,255,0.02)] opacity-60' : 'bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.05)]'}`}
                     >
                        <GripVertical size={16} className="text-[var(--text-muted)] opacity-50 group-hover:opacity-100" />
                        <input 
                           type="checkbox" 
                           checked={item.done}
                           onChange={(e) => {
                              const newList = [...app.state.checklist];
                              newList[idx].done = e.target.checked;
                              app.dispatch({ type: 'BULK_SET', payload: { checklist: newList } });
                           }}
                           className="w-5 h-5 rounded-md border-[var(--border)] accent-[var(--accent)] cursor-pointer"
                        />
                        <span className={`flex-1 text-sm font-medium ${item.done ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-primary)]'}`}>
                           {item.label}
                        </span>
                        <button 
                           onClick={() => {
                              const newList = app.state.checklist.filter(i => i.id !== item.id);
                              app.dispatch({ type: 'BULK_SET', payload: { checklist: newList } });
                           }}
                           className="p-1.5 text-[var(--text-muted)] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                           <Trash2 size={16} />
                        </button>
                     </div>
                  ))}

                  <form 
                     onSubmit={(e) => {
                        e.preventDefault();
                        if (!newItemText.trim()) return;
                        const newList = [...app.state.checklist, { id: Date.now().toString(), label: newItemText.trim(), done: false }];
                        app.dispatch({ type: 'BULK_SET', payload: { checklist: newList } });
                        setNewItemText('');
                     }}
                     className="mt-4 flex gap-2"
                  >
                     <input 
                        type="text" 
                        value={newItemText}
                        onChange={(e) => setNewItemText(e.target.value)}
                        placeholder="Add new milestone..."
                        className="flex-1 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
                     />
                     <button type="submit" className="px-4 py-2 bg-[var(--accent)] text-white rounded-xl font-bold shadow-glow hover:bg-[var(--accent-light)] flex items-center">
                        <Plus size={18} />
                     </button>
                  </form>
               </div>
            </Card>
         </div>

         <div className="lg:col-span-4">
            <Card glow="rgba(255,255,255,0.05)" className="h-full">
               <SectionHeader icon={Settings2} title="Templates" />
               <p className="text-sm text-[var(--text-muted)] mb-6">Load standard milestone frameworks to hit your next funding target.</p>
               
               <div className="flex flex-col gap-3">
                  {Object.entries(PRESET_CHECKLISTS).map(([name, list]) => (
                     <button
                        key={name}
                        onClick={() => {
                           app.dispatch({ type: 'BULK_SET', payload: { checklist: list } });
                           app.addToast(`Loaded ${name} template`, 'success');
                        }}
                        className="flex items-center justify-between p-4 rounded-xl border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.05)] hover:border-[var(--accent-light)] transition-all group text-left"
                     >
                        <div>
                           <h4 className="font-bold text-sm text-[var(--text-primary)] group-hover:text-[var(--accent-light)]">{name}</h4>
                           <span className="text-xs text-[var(--text-muted)]">{list.length} milestones</span>
                        </div>
                        <ArrowRight size={16} className="text-[var(--text-muted)] group-hover:text-[var(--accent-light)] group-hover:translate-x-1 transition-transform" />
                     </button>
                  ))}
               </div>
            </Card>
         </div>
      </div>
    </div>
  );
}
