import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const defaults = {
    capital: 250000, burn: 15000, revenue: 5000, growth: 8, headcount: 12,
    cac: 620, arpu: 240, churn: 2.4, pipeline: 185000,
    idea: "AI startup helping founders choose the best capital sources",
    industry: "B2B SaaS",
    problem: "Founders lack a unified system to plan capital strategy with real-time data.",
    stage: "Seed", founder: "Founding Team", northStar: "Reach \$100k MRR in 12 months"
  };

  const getStored = (key, fallback) => {
    try {
      const raw = localStorage.getItem('vp-state');
      if (!raw) return fallback;
      return JSON.parse(raw)?.[key] ?? fallback;
    } catch { return fallback; }
  };

  const [capital, setCapital] = useState(() => getStored('capital', defaults.capital));
  const [burn, setBurn] = useState(() => getStored('burn', defaults.burn));
  const [revenue, setRevenue] = useState(() => getStored('revenue', defaults.revenue));
  const [growth, setGrowth] = useState(() => getStored('growth', defaults.growth));
  const [headcount, setHeadcount] = useState(() => getStored('headcount', defaults.headcount));
  const [cac, setCac] = useState(() => getStored('cac', defaults.cac));
  const [arpu, setArpu] = useState(() => getStored('arpu', defaults.arpu));
  const [churn, setChurn] = useState(() => getStored('churn', defaults.churn));
  const [pipeline, setPipeline] = useState(() => getStored('pipeline', defaults.pipeline));
  const [idea, setIdea] = useState(() => getStored('idea', defaults.idea));
  const [industry, setIndustry] = useState(() => getStored('industry', defaults.industry));
  const [problem, setProblem] = useState(() => getStored('problem', defaults.problem));
  const [stage, setStage] = useState(() => getStored('stage', defaults.stage));
  const [founder, setFounder] = useState(() => getStored('founder', defaults.founder));
  const [northStar, setNorthStar] = useState(() => getStored('northStar', defaults.northStar));
  const [lastSaved, setLastSaved] = useState(() => getStored('lastSaved', null));
  const [presets, setPresets] = useState(() => getStored('presets', []));
  const [repoUrl, setRepoUrl] = useState(() => getStored('repoUrl', ""));
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);
  const [dailySnapshots, setDailySnapshots] = useState(() => getStored('dailySnapshots', []));
  const [toasts, setToasts] = useState([]);

  // Derived metrics
  const netBurn = Math.max(burn - revenue, 1);
  const runwayMonths = Math.max(1, Math.round(capital / netBurn));
  const readinessScore = Math.min(100, Math.round((revenue * 0.6 + growth * 50 + runwayMonths * 5) / 10));
  const mrr = revenue;
  const arr = mrr * 12;
  const ltv = Math.round(arpu / Math.max(churn / 100, 0.01));
  const payback = Math.round((cac / Math.max(arpu, 1)) * 10) / 10;
  const revenuePerEmployee = headcount ? Math.round(revenue / headcount) : revenue;
  const pipelineCoverage = Math.round((pipeline / Math.max(arr, 1)) * 100);

  // Persist
  useEffect(() => {
    const payload = { capital, burn, revenue, growth, headcount, cac, arpu, churn,
      pipeline, idea, industry, problem, stage, founder, northStar,
      lastSaved: new Date().toISOString(), presets, repoUrl, dailySnapshots };
    try { localStorage.setItem('vp-state', JSON.stringify(payload)); setLastSaved(payload.lastSaved); } catch {}
  }, [capital, burn, revenue, growth, headcount, cac, arpu, churn,
      pipeline, idea, industry, problem, stage, founder, northStar, presets, repoUrl, dailySnapshots]);

  // Undo/Redo
  const prevRef = useRef(null);
  useEffect(() => {
    const current = { capital, burn, revenue, growth, headcount, cac, arpu, churn, pipeline, idea, industry, problem, stage, founder, northStar, repoUrl };
    if (prevRef.current && JSON.stringify(prevRef.current) !== JSON.stringify(current)) {
      setHistory(h => [...h.slice(-19), prevRef.current]);
      setFuture([]);
    }
    prevRef.current = current;
  }, [capital, burn, revenue, growth, headcount, cac, arpu, churn, pipeline, idea, industry, problem, stage, founder, northStar, repoUrl]);

  const applySnapshot = (snap) => {
    if (!snap) return;
    setCapital(snap.capital); setBurn(snap.burn); setRevenue(snap.revenue); setGrowth(snap.growth);
    setHeadcount(snap.headcount); setCac(snap.cac); setArpu(snap.arpu); setChurn(snap.churn);
    setPipeline(snap.pipeline); setIdea(snap.idea); setIndustry(snap.industry); setProblem(snap.problem);
    setStage(snap.stage); setFounder(snap.founder); setNorthStar(snap.northStar); setRepoUrl(snap.repoUrl || "");
  };

  const undo = () => setHistory(h => {
    if (!h.length) return h;
    const latest = h[h.length - 1];
    setFuture(f => [{ capital, burn, revenue, growth, headcount, cac, arpu, churn, pipeline, idea, industry, problem, stage, founder, northStar, repoUrl }, ...f]);
    applySnapshot(latest);
    return h.slice(0, -1);
  });

  const redo = () => setFuture(f => {
    if (!f.length) return f;
    setHistory(h => [...h, { capital, burn, revenue, growth, headcount, cac, arpu, churn, pipeline, idea, industry, problem, stage, founder, northStar, repoUrl }]);
    applySnapshot(f[0]);
    return f.slice(1);
  });

  // Daily snapshot – run once on mount
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    setDailySnapshots(prev => {
      if (prev.find(s => s.date === today)) return prev;
      const nb = Math.max(burn - revenue, 1);
      const rw = Math.max(1, Math.round(capital / nb));
      return [...prev.slice(-29), { date: today, runwayMonths: rw, revenue, burn, growth }];
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addToast = (message) => {
    const id = Date.now();
    setToasts(t => [...t, { id, message }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  };

  const savePreset = (name) => {
    if (!name) return;
    const snap = { name, capital, burn, revenue, growth, headcount, cac, arpu, churn, pipeline, idea, industry, problem, stage, founder, northStar };
    setPresets(prev => [...prev.filter(p => p.name !== name), snap]);
  };

  const loadPreset = (name) => {
    const preset = presets.find(p => p.name === name);
    if (!preset) return false;
    applySnapshot({ ...preset, repoUrl });
    return true;
  };

  const deletePreset = (name) => setPresets(prev => prev.filter(p => p.name !== name));
  const resetDefaults = () => applySnapshot({ ...defaults, repoUrl: "" });

  const value = {
    capital, setCapital, burn, setBurn, revenue, setRevenue, growth, setGrowth,
    headcount, setHeadcount, cac, setCac, arpu, setArpu, churn, setChurn,
    pipeline, setPipeline, idea, setIdea, industry, setIndustry, problem, setProblem,
    stage, setStage, founder, setFounder, northStar, setNorthStar,
    netBurn, runwayMonths, readinessScore, mrr, arr, ltv, payback,
    revenuePerEmployee, pipelineCoverage,
    lastSaved, resetDefaults,
    presets, savePreset, loadPreset, deletePreset,
    repoUrl, setRepoUrl,
    undo, redo, dailySnapshots,
    toasts, addToast,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => useContext(AppContext);
