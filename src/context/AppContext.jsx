import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const defaults = {
    capital: 250000,
    burn: 15000,
    revenue: 5000,
    growth: 8,
    headcount: 12,
    cac: 620,
    arpu: 240,
    churn: 2.4,
    pipeline: 185000,
    idea: "AI startup helping founders choose the best capital sources",
    industry: "B2B SaaS",
    problem: "Founders lack a unified system to plan capital strategy with real-time data.",
    stage: "Seed",
    founder: "Founding Team",
    northStar: "Reach $100k MRR in 12 months"
  };

  const getStoredValue = (key, fallback) => {
    if (typeof window === 'undefined') return fallback;
    try {
      const raw = localStorage.getItem('vp-state');
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed?.[key] ?? fallback;
    } catch (err) {
      return fallback;
    }
  };

  const [capital, setCapital] = useState(() => getStoredValue('capital', defaults.capital));
  const [burn, setBurn] = useState(() => getStoredValue('burn', defaults.burn));
  const [revenue, setRevenue] = useState(() => getStoredValue('revenue', defaults.revenue));
  const [growth, setGrowth] = useState(() => getStoredValue('growth', defaults.growth));
  const [headcount, setHeadcount] = useState(() => getStoredValue('headcount', defaults.headcount));
  const [cac, setCac] = useState(() => getStoredValue('cac', defaults.cac));
  const [arpu, setArpu] = useState(() => getStoredValue('arpu', defaults.arpu));
  const [churn, setChurn] = useState(() => getStoredValue('churn', defaults.churn));
  const [pipeline, setPipeline] = useState(() => getStoredValue('pipeline', defaults.pipeline));
  const [idea, setIdea] = useState(() => getStoredValue('idea', defaults.idea));
  const [industry, setIndustry] = useState(() => getStoredValue('industry', defaults.industry));
  const [problem, setProblem] = useState(() => getStoredValue('problem', defaults.problem));
  const [stage, setStage] = useState(() => getStoredValue('stage', defaults.stage));
  const [founder, setFounder] = useState(() => getStoredValue('founder', defaults.founder));
  const [northStar, setNorthStar] = useState(() => getStoredValue('northStar', defaults.northStar));
  const [lastSaved, setLastSaved] = useState(() => getStoredValue('lastSaved', null));
  const [presets, setPresets] = useState(() => getStoredValue('presets', []));
  const [repoUrl, setRepoUrl] = useState(() => getStoredValue('repoUrl', ""));
  const [history, setHistory] = useState(() => getStoredValue('history', []));
  const [future, setFuture] = useState([]);
  const [dailySnapshots, setDailySnapshots] = useState(() => getStoredValue('dailySnapshots', []));
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const payload = { capital, burn, revenue, growth, headcount, cac, arpu, churn, pipeline, idea, industry, problem, stage, founder, northStar, lastSaved: new Date().toISOString(), presets, repoUrl, history, dailySnapshots };
    try {
      localStorage.setItem('vp-state', JSON.stringify(payload));
      setLastSaved(payload.lastSaved);
    } catch (_) {
      // ignore write errors (private mode, etc.)
    }
  }, [capital, burn, revenue, growth, headcount, cac, arpu, churn, pipeline, idea, industry, problem, stage, founder, northStar, presets, repoUrl, history, dailySnapshots]);

  // history tracking for undo/redo
  const prevRef = React.useRef(null);
  useEffect(() => {
    const current = { capital, burn, revenue, growth, headcount, cac, arpu, churn, pipeline, idea, industry, problem, stage, founder, northStar, repoUrl };
    if (prevRef.current && JSON.stringify(prevRef.current) !== JSON.stringify(current)) {
      setHistory((h) => [...h.slice(-19), prevRef.current]);
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

  const undo = () => {
    setHistory((h) => {
      if (h.length === 0) return h;
      const latest = h[h.length - 1];
      setFuture((f) => [ { capital, burn, revenue, growth, headcount, cac, arpu, churn, pipeline, idea, industry, problem, stage, founder, northStar, repoUrl }, ...f ]);
      applySnapshot(latest);
      return h.slice(0, -1);
    });
  };

  const redo = () => {
    setFuture((f) => {
      if (f.length === 0) return f;
      const next = f[0];
      setHistory((h) => [...h, { capital, burn, revenue, growth, headcount, cac, arpu, churn, pipeline, idea, industry, problem, stage, founder, northStar, repoUrl }]);
      applySnapshot(next);
      return f.slice(1);
    });
  };

  // daily snapshot (one per day)
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    if (dailySnapshots.find((s) => s.date === today)) return;
    const snap = { date: today, runwayMonths, revenue, burn, growth };
    setDailySnapshots((prev) => [...prev.slice(-29), snap]);
  }, [runwayMonths, revenue, burn, growth, dailySnapshots]);

  // toasts
  const addToast = (message) => {
    const id = Date.now();
    setToasts((t) => [...t, { id, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  };

  const netBurn = Math.max(burn - revenue, 1);
  const runwayMonths = Math.max(1, Math.round(capital / netBurn));
  const readinessScore = Math.min(100, Math.round((revenue * 0.6 + growth * 50 + runwayMonths * 5) / 10));
  const mrr = revenue;
  const arr = mrr * 12;
  const ltv = Math.round(arpu / Math.max(churn / 100, 0.01));
  const payback = Math.round((cac / Math.max(arpu, 1)) * 10) / 10;
  const revenuePerEmployee = headcount ? Math.round(revenue / headcount) : revenue;
  const pipelineCoverage = Math.round((pipeline / Math.max(arr, 1)) * 100);

  const savePreset = (name) => {
    if (!name) return;
    const snapshot = { name, capital, burn, revenue, growth, headcount, cac, arpu, churn, pipeline, idea, industry, problem, stage, founder, northStar };
    setPresets((prev) => {
      const filtered = prev.filter((p) => p.name !== name);
      return [...filtered, snapshot];
    });
  };

  const loadPreset = (name) => {
    const preset = presets.find((p) => p.name === name);
    if (!preset) return false;
    setCapital(preset.capital);
    setBurn(preset.burn);
    setRevenue(preset.revenue);
    setGrowth(preset.growth);
    setHeadcount(preset.headcount);
    setCac(preset.cac);
    setArpu(preset.arpu);
    setChurn(preset.churn);
    setPipeline(preset.pipeline);
    setIdea(preset.idea);
    setIndustry(preset.industry);
    setProblem(preset.problem);
    setStage(preset.stage);
    setFounder(preset.founder);
    setNorthStar(preset.northStar);
    return true;
  };

  const deletePreset = (name) => setPresets((prev) => prev.filter((p) => p.name !== name));

  const resetDefaults = () => {
    setCapital(defaults.capital);
    setBurn(defaults.burn);
    setRevenue(defaults.revenue);
    setGrowth(defaults.growth);
    setHeadcount(defaults.headcount);
    setCac(defaults.cac);
    setArpu(defaults.arpu);
    setChurn(defaults.churn);
    setPipeline(defaults.pipeline);
    setIdea(defaults.idea);
    setIndustry(defaults.industry);
    setProblem(defaults.problem);
    setStage(defaults.stage);
    setFounder(defaults.founder);
    setNorthStar(defaults.northStar);
  };

  const value = {
    capital, setCapital,
    burn, setBurn,
    revenue, setRevenue,
    growth, setGrowth,
    headcount, setHeadcount,
    cac, setCac,
    arpu, setArpu,
    churn, setChurn,
    pipeline, setPipeline,
    idea, setIdea,
    industry, setIndustry,
    problem, setProblem,
    stage, setStage,
    founder, setFounder,
    northStar, setNorthStar,
    netBurn, runwayMonths, readinessScore,
    mrr, arr, ltv, payback, revenuePerEmployee, pipelineCoverage,
    lastSaved,
    resetDefaults,
    presets,
    savePreset,
    loadPreset,
    deletePreset,
    repoUrl, setRepoUrl,
    undo, redo,
    dailySnapshots,
    toasts, addToast
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => useContext(AppContext);
