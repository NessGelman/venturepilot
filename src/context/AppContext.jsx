import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [capital, setCapital] = useState(250000);
  const [burn, setBurn] = useState(15000);
  const [revenue, setRevenue] = useState(5000);
  const [growth, setGrowth] = useState(8);
  const [idea, setIdea] = useState("AI startup helping founders choose the best capital sources");

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
