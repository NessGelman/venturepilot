import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const defaults = {
    capital: 250000,
    burn: 15000,
    revenue: 5000,
    growth: 8,
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
  const [idea, setIdea] = useState(() => getStoredValue('idea', defaults.idea));

  useEffect(() => {
    const payload = { capital, burn, revenue, growth, idea };
    try {
      localStorage.setItem('vp-state', JSON.stringify(payload));
    } catch (_) {
      // ignore write errors (private mode, etc.)
    }
  }, [capital, burn, revenue, growth, idea]);

  const netBurn = Math.max(burn - revenue, 1);
  const runwayMonths = Math.max(1, Math.round(capital / netBurn));
  const readinessScore = Math.min(100, Math.round((revenue * 0.6 + growth * 50 + runwayMonths * 5) / 10));

  const value = {
    capital, setCapital,
    burn, setBurn,
    revenue, setRevenue,
    growth, setGrowth,
    idea, setIdea,
    netBurn, runwayMonths, readinessScore
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => useContext(AppContext);
