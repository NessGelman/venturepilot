import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card, SectionHeader, StatCard, MetricTooltip, Badge } from '../components/Shared';
import { Activity, Download, Zap, BarChart2, TrendingUp, Sparkles, Filter, ShieldCheck, PieChart, Target, CalendarDays, Rocket } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar
} from 'recharts';

export default function Dashboard() {
  const app = useApp();
  const [showRaiseScenario, setShowRaiseScenario] = useState(false);
  const [scenarioRaise, setScenarioRaise] = useState(app.targetRaise || 750000);

  // Health Data for Radar
  const radarData = useMemo(() => [
    { subject: 'Growth', A: Math.min(app.growth * 5, 100), fullMark: 100 },
    { subject: 'Profitability', A: Math.min(app.grossMargin, 100), fullMark: 100 },
    { subject: 'Efficiency', A: Math.max(0, 100 - app.derived.burnMultiple * 20), fullMark: 100 },
    { subject: 'Runway', A: Math.min(app.derived.runwayMonths * 5, 100), fullMark: 100 },
    { subject: 'Retention', A: Math.min(app.ndr, 150) / 1.5, fullMark: 100 },
    { subject: 'Pipeline', A: Math.min(app.derived.pipelineCoverage, 300) / 3, fullMark: 100 },
  ], [app]);

  // Cash Projection Chart
  const projectionData = useMemo(() => {
    const data = [];
    let currentCash = app.capital + (showRaiseScenario ? scenarioRaise : 0);
    let currentRev = app.revenue;
    const baseBurn = app.burn;

    for (let month = 0; month <= 18; month++) {
      if (month > 0) {
        currentCash -= Math.max(baseBurn - currentRev, 0);
        currentRev *= (1 + app.growth / 100);
      }
      data.push({
        month: `M${month}`,
        cash: Math.max(currentCash, 0),
        revenue: currentRev,
        breakeven: baseBurn
      });
    }
    return data;
  }, [app, showRaiseScenario, scenarioRaise]);

  // Monte Carlo Simulation
  const { histogram, riskBadge, survivalRate } = useMemo(() => {
    const TRIALS = 2000;
    const results = [];
    let survived = 0;
    
    for (let i = 0; i < TRIALS; i++) {
        let cash = app.capital;
        let rev = app.revenue;
        const burn = app.burn;
        let months = 0;
        
        while (cash > 0 && months < 36) {
            // Random variance +/- 15% revenue growth, +/- 10% burn
            const rVar = 1 + ((Math.random() * 0.3) - 0.15);
            const bVar = 1 + ((Math.random() * 0.2) - 0.10);
            
            cash -= Math.max((burn * bVar) - rev, 0);
            rev *= (1 + (app.growth / 100) * rVar);
            months++;
        }
        results.push(months);
        if (months >= 24) survived++;
    }

    const survivalRate = Math.round((survived / TRIALS) * 100);
    
    // Binning into 6-month intervals
    const bins = [0,0,0,0,0,0];
    results.forEach(m => {
        if (m < 6) bins[0]++;
        else if (m < 12) bins[1]++;
        else if (m < 18) bins[2]++;
        else if (m < 24) bins[3]++;
        else if (m < 30) bins[4]++;
        else bins[5]++;
    });

    const histogram = [
        { name: '<6m', count: bins[0] },
        { name: '6-12m', count: bins[1] },
        { name: '12-18m', count: bins[2] },
        { name: '18-24m', count: bins[3] },
        { name: '24-30m', count: bins[4] },
        { name: '>30m', count: bins[5] }
    ];

    let riskBadge = { label: 'High Risk', color: 'var(--red)' };
    if (survivalRate > 80) riskBadge = { label: 'Safe', color: 'var(--green)' };
    else if (survivalRate > 40) riskBadge = { label: 'Moderate', color: 'var(--amber)' };

    return { histogram, riskBadge, survivalRate };
  }, [app]);

  const exportCSV = () => {
    const rows = [
      ['Metric', 'Value', 'Unit'],
      ['Runway', app.derived.runwayMonths, 'months'],
      ['Cash Remaining', app.capital, 'USD'],
      ['Monthly Revenue', app.revenue, 'USD'],
      ['Gross Margin', app.grossMargin, '%'],
      ['Burn Multiple', app.derived.burnMultiple, 'x'],
      ['Rule of 40', app.derived.ruleOf40, '%'],
      ['NDR', app.ndr, '%'],
      ['Implied Valuation', app.derived.impliedValuation, 'USD'],
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vp-export-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  const getBorderColor = (val: number, good: number, bad: number, inverse = false) => {
      // Return green/yellow/red color string
      // If inverse=true, LOWER is better (e.g. Burn Multiple)
      let isGood = inverse ? val <= good : val >= good;
      let isBad = inverse ? val >= bad : val <= bad;
      if (isGood) return 'border-l-[10px] border-l-emerald-500';
      if (isBad) return 'border-l-[10px] border-l-red-500';
      return 'border-l-[10px] border-l-amber-500';
  };

  const submitAI = (prompt: string) => {
    window.dispatchEvent(new CustomEvent('open-ai-panel', { detail: { prompt } }));
  };

  return (
    <div className="max-w-[1400px] mx-auto pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Activity className="text-[var(--accent)]" /> Dashboard
          </h1>
          <p className="text-[var(--text-muted)] mt-1 font-medium font-mono text-sm tracking-wide">
            Real-time financial telemetry mapped to AI benchmarks.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={() => submitAI('Analyze my current dashboard KPIs and give me 3 priority actions.')} className="bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.1)] text-[13px] text-white px-4 py-2 rounded-xl flex items-center gap-2 font-medium transition-all shadow-glow hover:-translate-y-0.5 card-hover">
             <Sparkles size={14} className="text-[var(--accent-light)]" /> AI Insights
          </button>
          <button onClick={exportCSV} className="bg-[var(--accent)] hover:bg-[var(--accent-dark)] text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold shadow-glow hover:shadow-[0_0_20px_var(--accent-glow)] transition-all hover:-translate-y-0.5 card-hover text-[13px]">
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          icon={TrendingUp} 
          label="Gross Margin" 
          value={`${app.grossMargin}%`} 
          sub="Target: >80% (SaaS)" 
          className={getBorderColor(app.grossMargin, 80, 60)} 
        />
        <StatCard 
          icon={PieChart} 
          label={<MetricTooltip term="NDR">Net Dollar Retention</MetricTooltip>} 
          value={`${app.ndr}%`} 
          sub="Target: >100%" 
          className={getBorderColor(app.ndr, 100, 80)} 
        />
        <StatCard 
          icon={Target} 
          label={<MetricTooltip term="Rule of 40">Rule of 40</MetricTooltip>} 
          value={`${app.derived.ruleOf40}%`} 
          sub="Growth + Margin" 
          className={getBorderColor(app.derived.ruleOf40, 40, 20)} 
        />
        <StatCard 
          icon={Zap} 
          label={<MetricTooltip term="Burn Multiple">Burn Multiple</MetricTooltip>} 
          value={`${app.derived.burnMultiple}x`} 
          sub="Target: <2.0x" 
          className={getBorderColor(app.derived.burnMultiple, 1.5, 3.0, true)} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        
        {/* Main Chart */}
        <div className="lg:col-span-8">
          <Card glow="rgba(99,102,241,0.1)" className="h-full flex flex-col relative">
            <div className="flex justify-between items-center mb-6 z-10">
              <SectionHeader icon={BarChart2} title="Runway Trajectory" />
              <div className="flex items-center gap-3">
                 <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Raise Scenario</span>
                 <button 
                  onClick={() => setShowRaiseScenario(!showRaiseScenario)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${showRaiseScenario ? 'bg-[var(--accent)]' : 'bg-[rgba(255,255,255,0.1)]'}`}
                 >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${showRaiseScenario ? 'translate-x-6' : 'translate-x-0'}`} />
                 </button>
              </div>
            </div>

            {showRaiseScenario && (
              <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-[var(--bg-card)] border border-[var(--accent)] rounded-full px-4 py-1.5 shadow-glow">
                 <span className="text-xs font-bold text-[var(--text-primary)]">Injection:</span>
                 <input 
                   type="range" 
                   min={100000} 
                   max={5000000} 
                   step={100000} 
                   value={scenarioRaise} 
                   onChange={(e)=> setScenarioRaise(Number(e.target.value))}
                   className="w-32 accent-[var(--accent)]"
                 />
                 <span className="text-sm font-mono font-bold text-[var(--accent-light)]">${(scenarioRaise/1000000).toFixed(2)}M</span>
              </div>
            )}

            <div className="flex-1 min-h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={projectionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                     <linearGradient id="colorBurn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12, fontFamily: 'monospace'}} />
                  <YAxis stroke="rgba(255,255,255,0.3)" tickFormatter={(val) => `$${(val/1000).toFixed(0)}k`} tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12, fontFamily: 'monospace'}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 12, fontFamily: 'monospace' }} 
                    formatter={(val: number) => `$${val.toLocaleString()}`}
                  />
                  <Area type="monotone" dataKey="breakeven" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorBurn)" name="Burn Rate" />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" name="Revenue" />
                  <Area type="monotone" dataKey="cash" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorCash)" name="Cash Remaining" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Radar & Simulation */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <Card padding="1rem">
             <SectionHeader icon={ShieldCheck} title="Health Radar" />
             <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="subject" tick={{fill: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: 'bold'}} />
                    <Radar name="Score" dataKey="A" stroke="var(--accent-light)" fill="var(--accent)" fillOpacity={0.4} />
                  </RadarChart>
                </ResponsiveContainer>
             </div>
          </Card>

          <Card padding="1rem" className="flex-1">
            <div className="flex justify-between items-start mb-4">
               <SectionHeader icon={Filter} title="Monte Carlo (2k runs)" />
               <Badge color={riskBadge.color}>{riskBadge.label}</Badge>
            </div>
            <p className="text-3xl font-black text-white font-mono mb-1">{survivalRate}%</p>
            <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-6">Probability of surviving 24m</p>
            
            <div className="h-[120px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                <BarChart data={histogram}>
                   <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: 8 }} />
                   <XAxis dataKey="name" stroke="none" tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 10}} />
                   <Bar dataKey="count" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                </BarChart>
               </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      {/* Fundraising Timeline Section */}
      <Card>
         <div className="flex justify-between items-center mb-6">
            <SectionHeader icon={CalendarDays} title="Fundraising Timeline" />
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">Estimated 10 weeks to close</span>
         </div>
         
         <div className="relative overflow-x-auto pb-4 custom-scrollbar">
            <div className="flex gap-4 min-w-max">
               {app.timeline.map((item, idx) => (
                  <div key={item.id} className={`flex-1 min-w-[200px] border border-[rgba(255,255,255,0.08)] rounded-[var(--radius-lg)] p-4 relative overflow-hidden bg-[rgba(255,255,255,0.02)] ${item.done ? 'border-emerald-500/30 bg-emerald-500/5' : ''}`}>
                     {item.done && <div className="absolute right-0 top-0 w-8 h-8 bg-emerald-500/20 rounded-bl-full flex items-center justify-center -mr-1 -mt-1"><ShieldCheck size={12} className="text-emerald-500 ml-1 mb-1" /></div>}
                     <div className="flex items-center gap-2 mb-2">
                        <input 
                          type="checkbox" 
                          checked={item.done} 
                          onChange={(e) => {
                             const newTimeline = [...app.timeline];
                             newTimeline[idx].done = e.target.checked;
                             app.dispatch({ type: 'BULK_SET', payload: { timeline: newTimeline } });
                          }}
                          className="w-4 h-4 rounded-sm border-[var(--border)] accent-[var(--accent)] cursor-pointer"
                        />
                        <h4 className={`font-bold text-sm ${item.done ? 'text-emerald-400' : 'text-[var(--text-primary)]'}`}>{item.label}</h4>
                     </div>
                     <div className="flex justify-between items-end mt-4">
                        <div className="flex flex-col">
                           <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase">Duration</span>
                           <div className="flex items-center gap-1 group">
                              <input 
                                 type="number" 
                                 value={item.durationDays}
                                 onChange={(e) => {
                                    const newTimeline = [...app.timeline];
                                    newTimeline[idx].durationDays = Number(e.target.value);
                                    app.dispatch({ type: 'BULK_SET', payload: { timeline: newTimeline } });
                                 }}
                                 className="bg-transparent border-b border-transparent group-hover:border-[rgba(255,255,255,0.2)] focus:border-[var(--accent)] outline-none w-8 text-sm font-mono text-[var(--text-primary)] transition-colors p-0 text-center"
                              />
                              <span className="text-xs text-[var(--text-secondary)] font-medium">days</span>
                           </div>
                        </div>
                        <span className="text-xs font-mono font-bold text-[var(--text-muted)]">
                           T+{(app.timeline.slice(0,idx).reduce((acc, curr) => acc + curr.durationDays, 0))}d
                        </span>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </Card>
    </div>
  );
}
