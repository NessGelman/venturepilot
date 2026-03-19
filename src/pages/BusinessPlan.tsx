import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { FileText, Download, Target, ChevronDown, ChevronUp, Check, Sparkles, PieChart as PieIcon, Users, DollarSign, Activity } from 'lucide-react';
import { Card, SectionHeader } from '../components/Shared';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function BusinessPlan() {
  const app = useApp();
  const [activeSection, setActiveSection] = useState('executive-summary');
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'executive-summary': true,
    'market-opportunity': true,
    'competitive-analysis': true,
    'go-to-market': true,
    'financial-plan': true,
    'use-of-funds': true,
  });

  const refs = {
    'executive-summary': useRef<HTMLDivElement>(null),
    'market-opportunity': useRef<HTMLDivElement>(null),
    'competitive-analysis': useRef<HTMLDivElement>(null),
    'go-to-market': useRef<HTMLDivElement>(null),
    'financial-plan': useRef<HTMLDivElement>(null),
    'use-of-funds': useRef<HTMLDivElement>(null),
  };

  const scrollTo = (id: string) => {
    setActiveSection(id);
    refs[id as keyof typeof refs].current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setOpenSections(prev => ({ ...prev, [id]: true }));
  };

  const toggleSection = (id: string) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    const handleScroll = () => {
      let currentId = 'executive-summary';
      const offset = 100;
      Object.entries(refs).forEach(([id, ref]) => {
        if (ref.current && ref.current.getBoundingClientRect().top < offset) {
          currentId = id;
        }
      });
      setActiveSection(currentId);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const exportDocxHTML = () => {
    const html = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>${app.idea} - Business Plan</title>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 40px; }
          h1 { color: #111; font-size: 28px; text-align: center; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; margin-bottom: 30px; }
          h2 { color: #2563eb; font-size: 20px; margin-top: 30px; border-bottom: 1px solid #eee; padding-bottom: 8px; }
          p { margin-bottom: 15px; }
          ul { margin-bottom: 15px; }
          li { margin-bottom: 5px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background-color: #f3f4f6; font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>Business Plan: ${app.idea || 'Company Name'}</h1>
        
        <h2>Executive Summary</h2>
        <p>${app.idea || 'The Company'} is a ${app.stage} ${app.industry} startup raising $${(app.targetRaise/1000000).toFixed(2)}M. 
        We are building a solution for ${app.targetCustomer}. 
        Our current MRR is $${(app.revenue).toLocaleString()} growing at ${app.growth}% MoM.</p>
        
        <h2>Market Opportunity</h2>
        <p><strong>The Problem:</strong> ${app.problem}</p>
        <p><strong>Our Target Customer:</strong> ${app.targetCustomer}</p>

        <h2>Competitive Analysis</h2>
        <table>
          <tr><th>Competitor</th><th>Key Weakness</th><th>Our Advantage</th></tr>
          ${app.competitors ? app.competitors.split(',').map(c => `<tr><td>${c.trim()}</td><td>Legacy tech, poor UX</td><td>Modern design, AI-first</td></tr>`).join('') : '<tr><td colspan="3">No primary competitors listed.</td></tr>'}
        </table>

        <h2>Go-To-Market Strategy</h2>
        <p><strong>Customer Acquisition Cost (CAC):</strong> $${app.cac.toLocaleString()}</p>
        <p><strong>ARPU:</strong> $${app.arpu.toLocaleString()} / month</p>
        <p><strong>LTV:</strong> $${app.derived.ltv.toLocaleString()}</p>

        <h2>Financial Plan</h2>
        <p><strong>Capital Need:</strong> $${app.targetRaise.toLocaleString()}</p>
        <p><strong>Current Burn:</strong> $${app.burn.toLocaleString()} / month</p>
        <p><strong>Post-Raise Runway:</strong> ~${Math.round(app.targetRaise / Math.max(app.burn - app.revenue, 1))} months</p>

        <h2>Use of Funds</h2>
        <ul>
          <li>R&D (Engineering & Product): 40%</li>
          <li>Sales & Marketing: 30%</li>
          <li>Operations: 20%</li>
          <li>Legal & Reserve: 10%</li>
        </ul>
      </body>
      </html>
    `;
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${app.idea.split(' ')[0] || 'business'}_plan.doc`;
    a.click();
  };

  const useOfFundsData = [
    { name: 'R&D', value: 40, color: '#3b82f6' },
    { name: 'S&M', value: 30, color: '#10b981' },
    { name: 'Ops', value: 20, color: '#f59e0b' },
    { name: 'Legal/Reserve', value: 10, color: '#8b5cf6' },
  ];

  const submitAI = (prompt: string) => {
    window.dispatchEvent(new CustomEvent('open-ai-panel', { detail: { prompt } }));
  };

  return (
    <div className="max-w-[1400px] mx-auto pb-24 h-full flex flex-col md:flex-row gap-8">
      
      {/* Table of Contents Sidebar */}
      <div className="w-full md:w-64 shrink-0 mt-[120px] order-2 md:order-1 hidden md:block">
         <div className="sticky top-[100px] p-4 bg-[var(--bg-card)] border border-[rgba(255,255,255,0.08)] rounded-[var(--radius-xl)] shadow-elevated card-hover">
            <h3 className="font-bold text-[var(--text-primary)] text-sm uppercase tracking-wider mb-4 border-b border-[rgba(255,255,255,0.05)] pb-3">Contents</h3>
            <div className="flex flex-col gap-2">
               {[
                  { id: 'executive-summary', label: 'Executive Summary', icon: Target },
                  { id: 'market-opportunity', label: 'Market Opportunity', icon: Activity },
                  { id: 'competitive-analysis', label: 'Competitive Analysis', icon: Users },
                  { id: 'go-to-market', label: 'Go-To-Market', icon: Rocket },
                  { id: 'financial-plan', label: 'Financial Plan', icon: DollarSign },
                  { id: 'use-of-funds', label: 'Use of Funds', icon: PieIcon },
               ].map((item) => (
                  <button
                     key={item.id}
                     onClick={() => scrollTo(item.id)}
                     className={`flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all ${activeSection === item.id ? 'bg-[rgba(99,102,241,0.1)] text-[var(--accent-light)] shadow-inner' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.02)]'}`}
                  >
                     <item.icon size={14} className={activeSection === item.id ? 'opacity-100' : 'opacity-60'} />
                     <span className="text-xs font-bold font-sans">{item.label}</span>
                  </button>
               ))}
            </div>
         </div>
      </div>

      <div className="flex-1 order-1 md:order-2">
         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 px-2">
            <div>
               <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                  <FileText className="text-[var(--accent)]" /> Business Plan
               </h1>
               <p className="text-[var(--text-muted)] mt-1 font-medium font-mono text-sm tracking-wide">
                  Auto-orchestrated narrative based on core metrics.
               </p>
            </div>
            
            <div className="flex items-center gap-2">
               <button onClick={() => submitAI('Based on my metrics, draft a 3-paragraph executive summary that emphasizes my key strengths.')} className="bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.1)] text-[13px] text-white px-4 py-2 rounded-xl flex items-center gap-2 font-medium transition-all shadow-glow hover:-translate-y-0.5 card-hover">
                  <Sparkles size={14} className="text-[var(--accent-light)]" /> Auto-rewrite
               </button>
               <button onClick={exportDocxHTML} className="bg-[var(--accent)] hover:bg-[var(--accent-dark)] text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold transition-colors shadow-glow hover:shadow-[0_0_20px_var(--accent-glow)] hover:-translate-y-0.5 card-hover text-[13px]">
                  <Download size={14} /> Export DOCX
               </button>
            </div>
         </div>

         <div className="flex flex-col gap-6">
            
            <Card className="px-8 py-6">
               <div ref={refs['executive-summary']} id="executive-summary" className="scroll-mt-[100px]">
                  <button onClick={() => toggleSection('executive-summary')} className="flex justify-between items-center w-full group">
                     <SectionHeader icon={Target} title="Executive Summary" />
                     <ChevronDown size={20} className={`text-[var(--text-muted)] transition-transform duration-300 ${openSections['executive-summary'] ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {openSections['executive-summary'] && (
                     <div className="text-[var(--text-secondary)] leading-relaxed text-[15px] space-y-4 animate-in fade-in slide-in-from-top-4">
                        <p><strong>{app.idea || 'Our Company'}</strong> is a <strong>{app.stage}</strong> stage startup operating in the <strong>{app.industry}</strong> sector.</p>
                        <p>Led by <strong>{app.founder}</strong> and a team of {app.teamSize}, we are raising a <strong>${(app.targetRaise/1000000).toFixed(2)}M</strong> round to accelerate our growth toward our north star goal: <em>{app.northStar}</em>.</p>
                        <p>Our current financial performance demonstrates product-market fit, with a monthly recurring revenue of <strong>${(app.revenue).toLocaleString()}</strong> growing at an impressive <strong>{app.growth}%</strong> month-over-month. With our strong unit economics—featuring an LTV to CAC ratio of <strong>{(app.derived.ltv/app.cac).toFixed(1)}x</strong>—we are positioned to deploy capital efficiently.</p>
                        <p>{app.productDescription}</p>
                     </div>
                  )}
               </div>
            </Card>

            <Card className="px-8 py-6">
               <div ref={refs['market-opportunity']} id="market-opportunity" className="scroll-mt-[100px]">
                  <button onClick={() => toggleSection('market-opportunity')} className="flex justify-between items-center w-full group">
                     <SectionHeader icon={Activity} title="Market Opportunity" />
                     <ChevronDown size={20} className={`text-[var(--text-muted)] transition-transform duration-300 ${openSections['market-opportunity'] ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {openSections['market-opportunity'] && (
                     <div className="text-[var(--text-secondary)] leading-relaxed text-[15px] space-y-4 animate-in fade-in slide-in-from-top-4">
                        <div>
                           <h4 className="font-bold text-[var(--text-primary)] text-sm uppercase tracking-wider mb-2">The Problem</h4>
                           <textarea 
                              className="w-full h-24 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-[var(--radius-md)] p-4 text-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)] resize-none"
                              value={app.problem}
                              onChange={(e) => app.dispatch({ type:'BULK_SET', payload: { problem: e.target.value }})}
                           />
                        </div>
                        <div>
                           <h4 className="font-bold text-[var(--text-primary)] text-sm uppercase tracking-wider mb-2 mt-4">Target Customer (ICP)</h4>
                           <p className="p-4 bg-[rgba(16,185,129,0.05)] border border-[rgba(16,185,129,0.2)] rounded-[var(--radius-md)] text-emerald-400 font-medium">
                              {app.targetCustomer || 'No target customer defined yet.'}
                           </p>
                        </div>
                     </div>
                  )}
               </div>
            </Card>

            <Card className="px-8 py-6">
               <div ref={refs['competitive-analysis']} id="competitive-analysis" className="scroll-mt-[100px]">
                  <button onClick={() => toggleSection('competitive-analysis')} className="flex justify-between items-center w-full group">
                     <SectionHeader icon={Users} title="Competitive Analysis" />
                     <ChevronDown size={20} className={`text-[var(--text-muted)] transition-transform duration-300 ${openSections['competitive-analysis'] ? 'rotate-180' : ''}`} />
                  </button>

                  {openSections['competitive-analysis'] && (
                     <div className="animate-in fade-in slide-in-from-top-4">
                        <div className="mb-4">
                           <span className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">Identified Competitors: </span>
                           <span className="text-sm font-bold text-[var(--accent-light)] ml-2">{app.competitors || 'None'}</span>
                        </div>
                        <div className="overflow-x-auto rounded-[var(--radius-md)] border border-[rgba(255,255,255,0.08)]">
                           <table className="w-full text-left text-sm text-[var(--text-secondary)]">
                           <thead className="bg-[rgba(255,255,255,0.02)] border-b border-[rgba(255,255,255,0.08)]">
                              <tr>
                                 <th className="p-4 font-bold text-[var(--text-primary)]">Company</th>
                                 <th className="p-4 font-bold text-[var(--text-primary)]">Core Weakness</th>
                                 <th className="p-4 font-bold text-[var(--text-primary)]">Our Advantage</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
                              <tr className="bg-[rgba(99,102,241,0.05)]">
                                 <td className="p-4 font-bold text-[var(--accent-light)] flex items-center gap-2"><Check size={14} className="text-[var(--accent)]"/> {app.idea.split(' ')[0] || 'Us'}</td>
                                 <td className="p-4 text-[var(--text-muted)]">N/A</td>
                                 <td className="p-4 font-medium text-[var(--text-primary)]">Modern, lean, fast execution, tailored to {app.targetCustomer.split(' ')[0]}</td>
                              </tr>
                              {app.competitors ? app.competitors.split(',').map((c, i) => (
                                 <tr key={i} className="hover:bg-[rgba(255,255,255,0.01)] transition-colors">
                                 <td className="p-4 font-bold text-[var(--text-primary)]">{c.trim()}</td>
                                 <td className="p-4">Legacy architecture, poor usability</td>
                                 <td className="p-4 text-emerald-400 font-medium">10x better UX, natively AI-driven</td>
                                 </tr>
                              )) : (
                                 <tr><td colSpan={3} className="p-6 text-center text-[var(--text-muted)] italic">Update competitors in the sidebar to populate this matrix.</td></tr>
                              )}
                           </tbody>
                           </table>
                        </div>
                     </div>
                  )}
               </div>
            </Card>

            <Card className="px-8 py-6">
               <div ref={refs['use-of-funds']} id="use-of-funds" className="scroll-mt-[100px]">
                  <button onClick={() => toggleSection('use-of-funds')} className="flex justify-between items-center w-full group">
                     <SectionHeader icon={PieIcon} title="Use of Funds" />
                     <ChevronDown size={20} className={`text-[var(--text-muted)] transition-transform duration-300 ${openSections['use-of-funds'] ? 'rotate-180' : ''}`} />
                  </button>

                  {openSections['use-of-funds'] && (
                     <div className="flex flex-col md:flex-row items-center gap-12 mt-4 animate-in fade-in slide-in-from-top-4">
                        <div className="w-64 h-64 shrink-0 -ml-4">
                           <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                 <Pie data={useOfFundsData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={4} dataKey="value" stroke="none">
                                    {useOfFundsData.map((e, i) => <Cell key={i} fill={e.color} />)}
                                 </Pie>
                                 <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', fontSize: 12, fontWeight: 'bold' }} itemStyle={{ color: '#fff' }} />
                              </PieChart>
                           </ResponsiveContainer>
                        </div>
                        <div className="flex-1 flex flex-col gap-4 w-full">
                           <p className="text-sm font-medium text-[var(--text-muted)]">Deploying <span className="text-[var(--text-primary)] font-bold font-mono">${(app.targetRaise/1000000).toFixed(2)}M</span> over <span className="font-bold text-[var(--text-primary)]">18 months</span> to achieve {app.northStar}.</p>
                           
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {useOfFundsData.map((item, idx) => (
                                 <div key={idx} className="flex items-center gap-3 p-3 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-xl relative overflow-hidden group">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 transition-all group-hover:w-2" style={{ backgroundColor: item.color }} />
                                    <div className="ml-2 flex-1">
                                       <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1">{item.name}</span>
                                       <span className="text-sm font-mono font-black text-[var(--text-primary)]">${((app.targetRaise * item.value) / 100).toLocaleString()} ({item.value}%)</span>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </div>
                     </div>
                  )}
               </div>
            </Card>

         </div>
      </div>
    </div>
  );
}
