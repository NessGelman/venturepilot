import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/Shared';
import { Users, Plus, Search, Star, Edit2, Trash2, Download, Sparkles, LayoutGrid, List, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { InvestorRecord } from '../types/AppContext.types';

const STATUSES: InvestorRecord['contact'][] = ['Active', 'Interested', 'Dormant', 'Passed', 'Portfolio'];

export default function InvestorMatch() {
  const app = useApp();
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sortConfig, setSortConfig] = useState<{ key: keyof InvestorRecord, dir: 'asc'|'desc' }>({ key: 'sentiment', dir: 'desc' });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInv, setEditingInv] = useState<Partial<InvestorRecord> | null>(null);

  // Hardcoded simple preferences for the default investors for Match %
  const getMatchScore = (inv: InvestorRecord) => {
     let score = 50;
     if (inv.focus.toLowerCase().includes(app.industry.toLowerCase().split(' ')[0])) score += 20;
     if (inv.stage.toLowerCase().includes(app.stage.toLowerCase())) score += 15;
     if (app.derived.burnMultiple < 2.0) score += 5;
     if (app.derived.ruleOf40 > 30) score += 10;
     return Math.min(100, score);
  };

  const filteredData = useMemo(() => {
     let data = app.investors.filter(i => 
        (statusFilter === 'All' || i.contact === statusFilter) &&
        (i.name.toLowerCase().includes(search.toLowerCase()) || i.focus.toLowerCase().includes(search.toLowerCase()) || i.tags.join(' ').toLowerCase().includes(search.toLowerCase()))
     );
     data.sort((a,b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];
        if (valA < valB) return sortConfig.dir === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.dir === 'asc' ? 1 : -1;
        return 0;
     });
     return data;
  }, [app.investors, search, statusFilter, sortConfig]);

  const toggleSort = (key: keyof InvestorRecord) => {
     setSortConfig(prev => ({ key, dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc' }));
  };

  const selectAll = () => {
    if (selectedIds.size === filteredData.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredData.map(i => i.id)));
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const bulkDelete = () => {
     if (window.confirm(`Delete ${selectedIds.size} investors?`)) {
        selectedIds.forEach(id => app.deleteInvestor(id));
        setSelectedIds(new Set());
        app.addToast('Investors deleted', 'success');
     }
  };

  const bulkUpdateStatus = (status: InvestorRecord['contact']) => {
     selectedIds.forEach(id => {
        const inv = app.investors.find(i => i.id === id);
        if (inv) app.upsertInvestor({ ...inv, contact: status });
     });
     setSelectedIds(new Set());
     app.addToast(`Updated to ${status}`, 'success');
  };

  const bulkExport = () => {
     const toExport = app.investors.filter(i => selectedIds.has(i.id));
     const rows = [['Name','Focus','Stage','Status','Sentiment','Last Contact']];
     toExport.forEach(i => rows.push([i.name, i.focus, i.stage, i.contact, String(i.sentiment), i.lastContacted]));
     const csv = rows.map(r => r.join(',')).join('\n');
     const blob = new Blob([csv], { type: 'text/csv' });
     const a = document.createElement('a');
     a.href = URL.createObjectURL(blob);
     a.download = 'investors.csv';
     a.click();
     app.addToast('Exported CSV', 'success');
  };

  const saveModal = () => {
     if (!editingInv?.name) return app.addToast('Name is required', 'error');
     
     const id = editingInv.id || Math.random().toString(36).substring(7);
     const complete: InvestorRecord = {
        id,
        name: editingInv.name,
        focus: editingInv.focus || '',
        stage: editingInv.stage || '',
        contact: editingInv.contact || 'Active',
        link: editingInv.link || '',
        note: editingInv.note || '',
        next: editingInv.next || '',
        sentiment: editingInv.sentiment || 3,
        lastContacted: editingInv.lastContacted || new Date().toISOString().split('T')[0],
        tags: editingInv.tags || [],
     };
     app.upsertInvestor(complete);
     setIsModalOpen(false);
     app.addToast(editingInv.id ? 'Investor updated' : 'Investor added', 'success');
  };

  const onDragStart = (e: any, id: string) => e.dataTransfer.setData('id', id);
  const onDragOver = (e: any) => e.preventDefault();
  const onDrop = (e: any, status: InvestorRecord['contact']) => {
     const id = e.dataTransfer.getData('id');
     const inv = app.investors.find(i => i.id === id);
     if (inv && inv.contact !== status) {
        app.upsertInvestor({ ...inv, contact: status });
     }
  };

  const bgForStatus = (s: string) => {
     if (s === 'Active') return 'var(--green-dim)';
     if (s === 'Interested') return 'var(--accent-glow)';
     if (s === 'Dormant') return 'var(--yellow-dim)';
     if (s === 'Passed') return 'var(--red-dim)';
     return 'rgba(255,255,255,0.1)';
  };
  const colorForStatus = (s: string) => {
     if (s === 'Active') return 'var(--green)';
     if (s === 'Interested') return 'var(--accent-light)';
     if (s === 'Dormant') return 'var(--amber)';
     if (s === 'Passed') return 'var(--red)';
     return 'var(--text-primary)';
  };

  const renderStars = (rating: number) => {
     return (
        <div className="flex gap-0.5">
           {[1,2,3,4,5].map(n => (
              <Star key={n} size={12} className={n <= rating ? 'text-amber-400 fill-amber-400' : 'text-[rgba(255,255,255,0.1)]'} />
           ))}
        </div>
     );
  };

  const submitAI = (prompt: string) => {
    window.dispatchEvent(new CustomEvent('open-ai-panel', { detail: { prompt } }));
  };

  return (
    <div className="max-w-[1400px] mx-auto pb-24 h-full relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 px-2">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Users className="text-[var(--accent)]" /> Investor CRM
          </h1>
          <p className="text-[var(--text-muted)] mt-1 font-medium font-mono text-sm tracking-wide">
            Manage your pipeline and track alignment scores.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={() => submitAI('Rank my investor list based on my current metrics and stage, and tell me who to prioritize.')} className="bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.1)] text-[13px] text-white px-4 py-2 rounded-xl flex items-center gap-2 font-medium transition-all shadow-glow hover:-translate-y-0.5 card-hover hidden md:flex">
             <Sparkles size={14} className="text-[var(--accent-light)]" /> Rank Investors
          </button>
          <div className="flex bg-[rgba(255,255,255,0.05)] rounded-xl border border-[rgba(255,255,255,0.1)] p-1">
             <button onClick={() => setViewMode('table')} className={`p-2 rounded-md transition-colors ${viewMode === 'table' ? 'bg-[rgba(255,255,255,0.1)] text-white' : 'text-[var(--text-muted)] hover:text-white'}`}>
               <List size={16} />
             </button>
             <button onClick={() => setViewMode('kanban')} className={`p-2 rounded-md transition-colors ${viewMode === 'kanban' ? 'bg-[rgba(255,255,255,0.1)] text-white' : 'text-[var(--text-muted)] hover:text-white'}`}>
               <LayoutGrid size={16} />
             </button>
          </div>
          <button 
             onClick={() => { setEditingInv({}); setIsModalOpen(true); }}
             className="bg-[var(--accent)] hover:bg-[var(--accent-dark)] text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold transition-colors shadow-glow hover:shadow-[0_0_20px_var(--accent-glow)] hover:-translate-y-0.5 card-hover text-[13px]"
          >
             <Plus size={16} /> Add Investor
          </button>
        </div>
      </div>

      {/* Snapshot Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
         <Card padding="1.25rem" className="flex items-center justify-between">
            <div>
               <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Active Pipeline</p>
               <p className="text-2xl font-black font-mono text-white">{app.investors.filter(i => i.contact === 'Active' || i.contact === 'Interested').length}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center"><Activity size={18} className="text-indigo-400" /></div>
         </Card>
         <Card padding="1.25rem" className="flex items-center justify-between">
            <div>
               <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Total Tracked</p>
               <p className="text-2xl font-black font-mono text-white flex items-baseline gap-2">
                  {app.investors.length}
                  <span className="text-xs font-medium text-[var(--text-muted)] hidden sm:inline">contacts</span>
               </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center"><Users size={18} className="text-emerald-400" /></div>
         </Card>
         <Card padding="1.25rem" className="flex justify-between items-center sm:col-span-1">
            <div className="flex-1">
               <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Profile Alignment</p>
               <div className="w-full bg-[rgba(255,255,255,0.05)] h-2 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-400 to-indigo-400" style={{ width: `${Math.max(10, Math.min(100, app.derived.readinessScore))}%` }}></div>
               </div>
            </div>
         </Card>
      </div>

      {/* Filters & Bulk Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4 bg-[rgba(255,255,255,0.02)] p-2 rounded-xl border border-[rgba(255,255,255,0.05)]">
         <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-xs">
               <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
               <input 
                  type="text" 
                  placeholder="Search investors, focus, tags..." 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.1)] rounded-lg pl-9 pr-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
               />
            </div>
            <select
               value={statusFilter}
               onChange={e => setStatusFilter(e.target.value)}
               className="bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] cursor-pointer"
            >
               <option value="All">All Statuses</option>
               {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
         </div>

         <AnimatePresence>
            {selectedIds.size > 0 && (
               <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[var(--accent-light)] mr-2">{selectedIds.size} selected</span>
                  <select 
                     onChange={e => { if(e.target.value) bulkUpdateStatus(e.target.value as any); e.target.value = ''; }}
                     className="bg-[var(--accent)] text-white text-xs font-bold rounded-lg px-3 py-1.5 focus:outline-none cursor-pointer border-none shadow-glow"
                     defaultValue=""
                  >
                     <option value="" disabled>Move to...</option>
                     {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button onClick={bulkExport} className="p-1.5 rounded-lg bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] text-[var(--text-primary)] transition-colors" title="Export CSV"><Download size={14} /></button>
                  <button onClick={bulkDelete} className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors" title="Delete"><Trash2 size={14} /></button>
               </motion.div>
            )}
         </AnimatePresence>
      </div>

      {viewMode === 'table' ? (
         <Card padding="0" className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left text-sm whitespace-nowrap">
               <thead className="bg-[rgba(255,255,255,0.02)] border-b border-[rgba(255,255,255,0.05)] text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  <tr>
                     <th className="p-4 w-12 text-center">
                        <input type="checkbox" checked={selectedIds.size === filteredData.length && filteredData.length > 0} onChange={selectAll} className="accent-[var(--accent)] cursor-pointer" />
                     </th>
                     <th className="p-4 cursor-pointer hover:text-[var(--text-primary)]" onClick={() => toggleSort('name')}>Investor {sortConfig.key==='name' && (sortConfig.dir==='asc'?'↑':'↓')}</th>
                     <th className="p-4 cursor-pointer hover:text-[var(--text-primary)]" onClick={() => toggleSort('contact')}>Status {sortConfig.key==='contact' && (sortConfig.dir==='asc'?'↑':'↓')}</th>
                     <th className="p-4 cursor-pointer hover:text-[var(--text-primary)]" onClick={() => toggleSort('sentiment')}>Sentiment {sortConfig.key==='sentiment' && (sortConfig.dir==='asc'?'↑':'↓')}</th>
                     <th className="p-4 cursor-pointer hover:text-[var(--text-primary)]" onClick={() => toggleSort('focus')}>Focus / Stage {sortConfig.key==='focus' && (sortConfig.dir==='asc'?'↑':'↓')}</th>
                     <th className="p-4 text-center">Match %</th>
                     <th className="p-4">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-[rgba(255,255,255,0.02)] text-[var(--text-primary)]">
                  {filteredData.length === 0 && (
                     <tr><td colSpan={7} className="p-8 text-center text-[var(--text-muted)] italic">No investors found.</td></tr>
                  )}
                  {filteredData.map(inv => (
                     <tr key={inv.id} className={`hover:bg-[rgba(255,255,255,0.01)] transition-colors ${selectedIds.has(inv.id) ? 'bg-[rgba(99,102,241,0.05)]' : ''}`}>
                        <td className="p-4 text-center">
                           <input type="checkbox" checked={selectedIds.has(inv.id)} onChange={() => toggleSelect(inv.id)} className="accent-[var(--accent)] cursor-pointer" />
                        </td>
                        <td className="p-4 font-bold max-w-[200px] truncate">
                           <div className="flex flex-col">
                              <span>{inv.name}</span>
                              <span className="text-[10px] font-medium text-[var(--text-muted)] font-mono">{inv.tags.join(', ')}</span>
                           </div>
                        </td>
                        <td className="p-4">
                           <span className="px-2 py-1 rounded-[var(--radius-sm)] text-[10px] items-center font-bold uppercase tracking-wider" style={{ background: bgForStatus(inv.contact), color: colorForStatus(inv.contact) }}>
                              {inv.contact}
                           </span>
                        </td>
                        <td className="p-4">
                           {renderStars(inv.sentiment)}
                        </td>
                        <td className="p-4 text-xs">
                           <div className="flex flex-col">
                              <span className="font-medium">{inv.focus}</span>
                              <span className="text-[10px] text-[var(--text-muted)]">{inv.stage}</span>
                           </div>
                        </td>
                        <td className="p-4 text-center relative">
                           {/* Match Donut */}
                           <div className="inline-flex items-center justify-center relative w-8 h-8">
                              <svg className="w-8 h-8 -rotate-90">
                                 <circle cx="16" cy="16" r="14" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                                 <circle cx="16" cy="16" r="14" fill="none" stroke="var(--accent-light)" strokeWidth="3" strokeDasharray={`${getMatchScore(inv) * 0.88}, 100`} />
                              </svg>
                              <span className="absolute text-[9px] font-mono font-bold text-white max-w-full text-center leading-none tracking-tighter" style={{ fontSize: getMatchScore(inv) === 100 ? '7px' : '9px' }}>{getMatchScore(inv)}</span>
                           </div>
                        </td>
                        <td className="p-4">
                           <div className="flex items-center gap-2">
                              <button onClick={() => { setEditingInv(inv); setIsModalOpen(true); }} className="p-1.5 text-[var(--text-muted)] hover:text-[var(--accent-light)] transition-colors rounded hover:bg-[rgba(255,255,255,0.05)]"><Edit2 size={14} /></button>
                              <button onClick={() => submitAI(`Draft a 3-paragraph follow up email to ${inv.name} highlighting our $${(app.derived.arr/1000).toLocaleString()}k ARR and ${app.growth}% growth.`)} className="p-1.5 text-[var(--text-muted)] hover:text-[var(--accent-light)] transition-colors rounded hover:bg-[rgba(255,255,255,0.05)]" title="Draft Email with AI"><Sparkles size={14} /></button>
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </Card>
      ) : (
         <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar min-h-[500px]">
            {STATUSES.map(status => (
               <div 
                  key={status} 
                  className="flex-1 min-w-[280px] bg-[rgba(255,255,255,0.01)] border border-[rgba(255,255,255,0.05)] rounded-[var(--radius-xl)] flex flex-col"
                  onDragOver={onDragOver}
                  onDrop={e => onDrop(e, status)}
               >
                  <div className="p-3 border-b border-[rgba(255,255,255,0.05)] flex justify-between items-center" style={{ borderTop: `2px solid ${colorForStatus(status)}`, borderTopLeftRadius: 'var(--radius-xl)', borderTopRightRadius: 'var(--radius-xl)' }}>
                     <span className="font-bold text-xs uppercase tracking-wider text-[var(--text-primary)]">{status}</span>
                     <span className="px-2 py-0.5 rounded-full bg-[rgba(255,255,255,0.1)] text-[10px] font-mono font-bold">{filteredData.filter(i => i.contact === status).length}</span>
                  </div>
                  <div className="p-2 flex-1 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
                     {filteredData.filter(i => i.contact === status).map(inv => (
                        <div 
                           key={inv.id} 
                           draggable 
                           onDragStart={e => onDragStart(e, inv.id)}
                           className="bg-[var(--bg-card)] border border-[rgba(255,255,255,0.05)] p-3 rounded-xl shadow-sm cursor-grab active:cursor-grabbing hover:border-[var(--accent-light)] transition-colors"
                        >
                           <div className="flex justify-between items-start mb-1">
                              <h4 className="font-bold text-sm text-[var(--text-primary)]">{inv.name}</h4>
                              <span className="text-[10px] font-mono font-bold text-[var(--accent-light)]">{getMatchScore(inv)}%</span>
                           </div>
                           <p className="text-xs text-[var(--text-muted)] font-medium mb-2">{inv.focus}</p>
                           {renderStars(inv.sentiment)}
                           {inv.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-3">
                                 {inv.tags.slice(0,3).map(t => <span key={t} className="px-1.5 py-0.5 bg-[rgba(255,255,255,0.05)] rounded text-[9px] text-[var(--text-secondary)]">{t}</span>)}
                              </div>
                           )}
                           <button onClick={(e) => { e.stopPropagation(); setEditingInv(inv); setIsModalOpen(true); }} className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 p-1 text-[var(--text-muted)] hover:text-white"><Edit2 size={12} /></button>
                        </div>
                     ))}
                  </div>
               </div>
            ))}
         </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
         {isModalOpen && (
            <div className="fixed inset-0 z-[500] bg-black/60 backdrop-blur-sm flex justify-center items-center p-4">
               <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="w-full max-w-lg bg-[var(--bg-surface)] border border-[rgba(255,255,255,0.1)] rounded-[var(--radius-xl)] shadow-2xl flex flex-col max-h-[90vh]"
               >
                  <div className="p-5 border-b border-[rgba(255,255,255,0.05)] flex justify-between items-center bg-[rgba(255,255,255,0.02)]">
                     <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2"><Users size={18} className="text-[var(--accent-light)]"/> {editingInv?.id ? 'Edit Investor' : 'Add Investor'}</h2>
                  </div>
                  
                  <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-4 custom-scrollbar">
                     <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                           <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Investor Name</label>
                           <input type="text" value={editingInv?.name || ''} onChange={e => setEditingInv(prev => ({...prev, name: e.target.value}))} className="w-full bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--accent)]" />
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Focus</label>
                           <input type="text" value={editingInv?.focus || ''} onChange={e => setEditingInv(prev => ({...prev, focus: e.target.value}))} placeholder="e.g. B2B, AI" className="w-full bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--accent)]" />
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Stage</label>
                           <input type="text" value={editingInv?.stage || ''} onChange={e => setEditingInv(prev => ({...prev, stage: e.target.value}))} placeholder="e.g. Seed, Series A" className="w-full bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--accent)]" />
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Status</label>
                           <select value={editingInv?.contact || 'Active'} onChange={e => setEditingInv(prev => ({...prev, contact: e.target.value as any}))} className="w-full bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--accent)] cursor-pointer appearance-none">
                              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                           </select>
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Sentiment (1-5)</label>
                           <div className="flex gap-2 items-center h-[38px] px-2 bg-[rgba(0,0,0,0.2)] rounded-lg border border-[rgba(255,255,255,0.1)]">
                              {[1,2,3,4,5].map(n => (
                                 <Star 
                                    key={n} size={18} 
                                    onClick={() => setEditingInv(prev => ({...prev, sentiment: n as any}))}
                                    className={`cursor-pointer transition-colors ${n <= (editingInv?.sentiment || 3) ? 'text-amber-400 fill-amber-400' : 'text-[rgba(255,255,255,0.2)] hover:text-amber-400/50'}`} 
                                 />
                              ))}
                           </div>
                        </div>
                        <div className="col-span-2">
                           <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Tags (comma separated)</label>
                           <input 
                              type="text" 
                              value={editingInv?.tags?.join(', ') || ''} 
                              onChange={e => setEditingInv(prev => ({...prev, tags: e.target.value.split(',').map(s=>s.trim()).filter(Boolean)}))} 
                              className="w-full bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--accent)]" 
                              placeholder="e.g. AI, Deeptech, Warm Intro"
                           />
                        </div>
                     </div>
                  </div>

                  <div className="p-4 border-t border-[rgba(255,255,255,0.05)] flex justify-end gap-3 bg-[rgba(255,255,255,0.02)]">
                     <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-bold text-[var(--text-muted)] hover:text-white transition-colors">Cancel</button>
                     <button onClick={saveModal} className="px-5 py-2 bg-[var(--accent)] text-white text-sm font-bold rounded-xl shadow-glow hover:shadow-[0_0_20px_var(--accent-glow)] transition-all">Save</button>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

    </div>
  );
}
