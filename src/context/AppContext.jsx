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

  useEffect(() => {
    const payload = { capital, burn, revenue, growth, headcount, cac, arpu, churn, pipeline, idea };
    try {
      localStorage.setItem('vp-state', JSON.stringify(payload));
    } catch (_) {
      // ignore write errors (private mode, etc.)
    }
  }, [capital, burn, revenue, growth, headcount, cac, arpu, churn, pipeline, idea]);

  const netBurn = Math.max(burn - revenue, 1);
  const runwayMonths = Math.max(1, Math.round(capital / netBurn));
  const readinessScore = Math.min(100, Math.round((revenue * 0.6 + growth * 50 + runwayMonths * 5) / 10));
  const mrr = revenue;
  const arr = mrr * 12;
  const ltv = Math.round(arpu / Math.max(churn / 100, 0.01));
  const payback = Math.round((cac / Math.max(arpu, 1)) * 10) / 10;
  const revenuePerEmployee = headcount ? Math.round(revenue / headcount) : revenue;
  const pipelineCoverage = Math.round((pipeline / Math.max(arr, 1)) * 100);

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
    netBurn, runwayMonths, readinessScore,
    mrr, arr, ltv, payback, revenuePerEmployee, pipelineCoverage
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => useContext(AppContext);
