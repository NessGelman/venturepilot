import React, { createContext, useContext, useReducer, useEffect, useMemo, useCallback, useState } from 'react';
import type { AppState, AppAction, DerivedMetrics, UseAppReturn, Preset, DailySnapshot, Toast } from '../types/AppContext.types';

const AppContext = createContext<UseAppReturn | null>(null);

interface AppProviderProps {
  children: React.ReactNode;
}

const defaults: Omit<AppState, 'history' | 'future' | 'lastSaved'> = {
  capital: 250000,
  burn: 15000,
  revenue: 5000,
  growth: 8,
  headcount: 12,
  cac: 620,
  arpu: 240,
  churn: 2.4,
  pipeline: 185000,
  idea: 'AI startup helping founders choose the best capital sources',
  industry: 'B2B SaaS',
  problem: 'Founders lack a unified system to plan capital strategy with real-time data.',
  stage: 'Seed',
  founder: 'Founding Team',
  northStar: 'Reach $100k MRR in 12 months',
  repoUrl: '',
  presets: [],
  dailySnapshots: [],
};

export const AppProvider = ({ children }: AppProviderProps) => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    try {
      return localStorage.getItem('vp-theme') !== 'light';
    } catch {
      return true;
    }
  });

  // Theme effect
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (isDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('vp-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('vp-theme', 'light');
      }
    }
  }, [isDark]);

  const toggleTheme = useCallback(() => setIsDark((prev: boolean) => !prev), []);

  // Initial state from storage
  const getStoredState = useCallback((): Partial<AppState> => {
    try {
      const raw = sessionStorage.getItem('vp-state') || localStorage.getItem('vp-state');
      if (!raw) return {};
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }, []);

  const initialState: AppState = useMemo(() => {
    const stored = getStoredState();
    return {
      ...defaults,
      ...stored,
      history: (stored.history as AppState[]) || [],
      future: (stored.future as AppState[]) || [],
      lastSaved: stored.lastSaved as string | null || null,
      dailySnapshots: (stored.dailySnapshots as DailySnapshot[]) || [],
    } as AppState;
  }, [getStoredState]);

  const [state, dispatch] = useReducer((state: AppState, action: AppAction): AppState => {
    switch (action.type) {
      case 'SET_FIELD': {
        const newState = { ...state, [action.field]: action.value };
        // Snapshot for undo (limit 20)
        const snapshot: AppState = {
          ...newState,
          presets: state.presets,
          dailySnapshots: state.dailySnapshots,
          repoUrl: newState.repoUrl || '',
          history: [],
          future: [],
          lastSaved: new Date().toISOString(),
        };
        return {
          ...newState,
          history: [...state.history.slice(-19), snapshot],
          future: [],
        };
      }
      case 'UNDO': {
        if (state.history.length === 0) return state;
        const previous = state.history[state.history.length - 1];
        const newHistory = state.history.slice(0, -1);
        return {
          ...previous,
          history: newHistory,
          future: [state, ...state.future],
        };
      }
      case 'REDO': {
        if (state.future.length === 0) return state;
        const next = state.future[0];
        const newFuture = state.future.slice(1);
        return {
          ...next,
          history: [...state.history, state],
          future: newFuture,
        };
      }
      case 'RESET_DEFAULTS':
        return { 
          ...defaults, 
          history: state.history, 
          future: state.future, 
          lastSaved: null,
          repoUrl: '',
          presets: [],
          dailySnapshots: [],
        };
      case 'SAVE_PRESET':
        const preset: Preset = {
          name: action.name,
          capital: state.capital,
          burn: state.burn,
          revenue: state.revenue,
          growth: state.growth,
          headcount: state.headcount,
          cac: state.cac,
          arpu: state.arpu,
          churn: state.churn,
          pipeline: state.pipeline,
          idea: state.idea,
          industry: state.industry,
          problem: state.problem,
          stage: state.stage,
          founder: state.founder,
          northStar: state.northStar,
        };
        return {
          ...state,
          presets: [...state.presets.filter(p => p.name !== action.name), preset],
        };
      case 'LOAD_PRESET': {
        const preset = state.presets.find(p => p.name === action.name);
        if (!preset) return state;
        return { 
          ...state, 
          capital: preset.capital,
          burn: preset.burn,
          revenue: preset.revenue,
          growth: preset.growth,
          headcount: preset.headcount,
          cac: preset.cac,
          arpu: preset.arpu,
          churn: preset.churn,
          pipeline: preset.pipeline,
          idea: preset.idea,
          industry: preset.industry,
          problem: preset.problem,
          stage: preset.stage,
          founder: preset.founder,
          northStar: preset.northStar,
        };
      }
      case 'DELETE_PRESET':
        return {
          ...state,
          presets: state.presets.filter(p => p.name !== action.name),
        };
      default:
        return state;
    }
  }, initialState);

  // Persist state to sessionStorage (undo survives tab refresh)
  useEffect(() => {
    try {
      sessionStorage.setItem('vp-state', JSON.stringify({
        ...state,
        history: state.history.slice(-20), // Limit storage
        future: [],
      }));
      localStorage.setItem('vp-state', JSON.stringify({
        ...state,
        history: [], // Don't persist full history to localStorage
        future: [],
      }));
    } catch {}
  }, [state]);

  // Derived metrics
  const derived: DerivedMetrics = useMemo(() => {
    const netBurn = Math.max(state.burn - state.revenue, 1);
    const runwayMonths = Math.max(1, Math.round(state.capital / netBurn));
    const readinessScore = Math.min(
      100,
      Math.round((state.revenue * 0.6 + state.growth * 50 + runwayMonths * 5) / 10),
    );
    const mrr = state.revenue;
    const arr = mrr * 12;
    const ltv = Math.round(state.arpu / Math.max(state.churn / 100, 0.01));
    const payback = Math.round((state.cac / Math.max(state.arpu, 1)) * 10) / 10;
    const revenuePerEmployee = state.headcount ? Math.round(state.revenue / state.headcount) : state.revenue;
    const pipelineCoverage = Math.round((state.pipeline / Math.max(arr, 1)) * 100);

    return {
      netBurn,
      runwayMonths,
      readinessScore,
      mrr,
      arr,
      ltv,
      payback,
      revenuePerEmployee,
      pipelineCoverage,
    };
  }, [state]);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string) => {
    const id = Date.now();
    setToasts((t) => [...t, { id, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  }, []);

  // Setter helpers
  const createSetter = <K extends keyof Omit<AppState, 'history' | 'future' | 'presets' | 'dailySnapshots' | 'lastSaved'>>(field: K) => 
    ((value: AppState[K]) => {
      dispatch({ type: 'SET_FIELD', field, value });
    });

  const setCapital = createSetter('capital');
  const setBurn = createSetter('burn');
  const setRevenue = createSetter('revenue');
  const setGrowth = createSetter('growth');
  const setHeadcount = createSetter('headcount');
  const setCac = createSetter('cac');
  const setArpu = createSetter('arpu');
  const setChurn = createSetter('churn');
  const setPipeline = createSetter('pipeline');
  const setIdea = createSetter('idea');
  const setIndustry = createSetter('industry');
  const setProblem = createSetter('problem');
  const setStage = createSetter('stage');
  const setFounder = createSetter('founder');
  const setNorthStar = createSetter('northStar');
  const setRepoUrl = createSetter('repoUrl');

  const undo = useCallback(() => dispatch({ type: 'UNDO' }), [dispatch]);
  const redo = useCallback(() => dispatch({ type: 'REDO' }), [dispatch]);
  const resetDefaults = useCallback(() => dispatch({ type: 'RESET_DEFAULTS' }), [dispatch]);

  const savePreset = useCallback((name: string) => {
    dispatch({ type: 'SAVE_PRESET', name });
  }, [dispatch]);

  const loadPreset = useCallback((name: string): boolean => {
    dispatch({ type: 'LOAD_PRESET', name });
    return true; // Assume success, check presets in UI
  }, [dispatch]);

  const deletePreset = useCallback((name: string) => {
    dispatch({ type: 'DELETE_PRESET', name });
  }, [dispatch]);

  const value: UseAppReturn = {
    state,
    dispatch,
    derived,
    isDark,
    toggleTheme,
    toasts,
    addToast,
    undo,
    redo,
    savePreset,
    loadPreset,
    deletePreset,
    resetDefaults,
    // Backwards compat aliases
    capital: state.capital,
    setCapital,
    burn: state.burn,
    setBurn,
    revenue: state.revenue,
    setRevenue,
    growth: state.growth,
    setGrowth,
    headcount: state.headcount,
    setHeadcount,
    cac: state.cac,
    setCac,
    arpu: state.arpu,
    setArpu,
    churn: state.churn,
    setChurn,
    pipeline: state.pipeline,
    setPipeline,
    idea: state.idea,
    setIdea,
    industry: state.industry,
    setIndustry,
    problem: state.problem,
    setProblem,
    stage: state.stage,
    setStage,
    founder: state.founder,
    setFounder,
    northStar: state.northStar,
    setNorthStar,
    netBurn: derived.netBurn,
    runwayMonths: derived.runwayMonths,
    readinessScore: derived.readinessScore,
    mrr: derived.mrr,
    arr: derived.arr,
    ltv: derived.ltv,
    payback: derived.payback,
    revenuePerEmployee: derived.revenuePerEmployee,
    pipelineCoverage: derived.pipelineCoverage,
    lastSaved: state.lastSaved,
    presets: state.presets,
    repoUrl: state.repoUrl,
    setRepoUrl,
    dailySnapshots: state.dailySnapshots,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
