import React, { createContext, useContext, useReducer, useEffect, useMemo, useCallback, useState } from 'react';
import { secureStorage } from '../utils/storage';
import { useAI } from '../hooks/useAI';
import type { AppState, AppAction, DerivedMetrics, UseAppReturn, Preset, DailySnapshot, Toast, InvestorRecord } from '../types/AppContext.types';
import { MAX_DAILY_SNAPSHOTS } from '../constants/metrics';

const AppContext = createContext<UseAppReturn | null>(null);

interface AppProviderProps {
  children: React.ReactNode;
}

const defaults: Omit<AppState, 'history' | 'future' | 'lastSaved'> = {
  // ── Financials ──────────────────────────────────────────────────────────────
  capital: 250000,
  burn: 15000,
  revenue: 5000,
  growth: 8,
  headcount: 4,
  cac: 620,
  arpu: 240,
  churn: 2.4,
  pipeline: 185000,
  grossMargin: 85,
  ndr: 108,
  magicNumber: 0.8,
  valuation: 4000000,
  targetRaise: 750000,
  dilution: 18,
  repoUrl: '',

  // ── Company identity ─────────────────────────────────────────────────────────
  companyName: 'VenturePilot',
  idea: 'The AI co-pilot that turns your startup metrics into investor-ready documents',
  productDescription: 'Enter your numbers once — VenturePilot auto-generates pitch decks, business plans, investor updates, and strategic playbooks, live-updated as your metrics change.',
  stage: 'Seed',
  industry: 'B2B SaaS',
  revenueModel: 'SaaS',
  teamSize: 4,
  founder: 'Ness Gelman',
  founderBios: 'Ness Gelman — founder & product lead. Built data tools for B2B companies, experienced the fundraising prep nightmare firsthand, and decided to fix it.',
  targetCustomer: 'Early-stage founders (Pre-seed → Series A) at B2B SaaS startups preparing for their first institutional raise',
  competitors: 'Notion, Visible.vc, Slidebean, Pitch.com, Cabal',
  northStar: 'Reach $50K MRR in 12 months',

  // ── Narrative ───────────────────────────────────────────────────────────────
  problem: 'Founders spend 40+ hours prepping for each fundraise — stitching together outdated spreadsheets, Notion pages, and Google Slides that never reflect the live numbers. Board meetings take days of manual prep. Investor updates get skipped because writing them is too painful. The tools that exist are generic, disconnected, and built for accountants — not founders.',
  solutionStatement: 'VenturePilot connects directly to your metrics and auto-generates every document investors ask for — pitch decks, business plans, monthly investor updates, and valuation models — in real time. One source of truth. Zero formatting time. Every document stays current because it\'s built from your live data, not a stale snapshot.',
  uniqueInsight: 'Founders don\'t need more dashboards. They need their metrics automatically translated into the stories that drive decisions. The document IS the product — every pitch deck, board update, and investor memo is a moment where a founder either wins trust or loses it. Data doesn\'t close rounds; narrative does. We\'re the bridge.',
  traction: '$5K MRR growing 8% MoM on word-of-mouth alone · 40+ active founders in beta · 200+ pitch decks generated · 180-person organic waitlist · 4.8/5 satisfaction from beta users · Zero paid acquisition',
  useOfFunds: '50% product & engineering — AI doc generation, accounting integrations (QuickBooks, Stripe), mobile app · 30% growth & distribution — founder community partnerships, content marketing, PLG flywheel · 20% ops & infrastructure',

  // ── Market ───────────────────────────────────────────────────────────────────
  tam: 15000000000,   // $15B global founder tools + financial planning market
  sam: 1500000000,    // $1.5B early-stage SaaS founders raising capital annually
  som: 75000000,      // $75M near-term capture (10K founders × $600 ACV)

  // ── App state ────────────────────────────────────────────────────────────────
  investors: [],
  onboardingComplete: false,
  checklist: [
    { id: '1', label: 'Complete product narrative in sidebar', done: false },
    { id: '2', label: 'Generate and review pitch deck', done: false },
    { id: '3', label: 'Run valuation model', done: false },
    { id: '4', label: 'Send first investor update', done: false },
  ],
  timeline: [
    { id: '1', label: 'Prep materials', durationDays: 14, date: '', done: false },
    { id: '2', label: 'First meetings', durationDays: 21, date: '', done: false },
    { id: '3', label: 'Term sheet', durationDays: 14, date: '', done: false },
    { id: '4', label: 'Due diligence', durationDays: 21, date: '', done: false },
    { id: '5', label: 'Close', durationDays: 7, date: '', done: false },
  ],
  presets: [],
  dailySnapshots: [],
};

const defaultInvestors: InvestorRecord[] = [
  {
    id: '1',
    name: 'Andreessen Horowitz',
    focus: 'Generalist/AI',
    stage: 'Seed–Series D',
    contact: 'Active',
    link: 'a16z.com',
    note: 'Warm intro via LP',
    next: '2026-03-20',
    sentiment: 4,
    lastContacted: '2026-03-10',
    tags: ['AI', 'Series A']
  },
  {
    id: '2',
    name: 'Sequoia Capital',
    focus: 'Enterprise/SaaS',
    stage: 'Pre-seed–IPO',
    contact: 'Dormant',
    link: 'sequoiacap.com',
    note: 'Paused until Q2',
    next: '2026-04-05',
    sentiment: 3,
    lastContacted: '2026-02-15',
    tags: ['Enterprise', 'Growth']
  },
  {
    id: '3',
    name: 'Greylock',
    focus: 'Infrastructure/B2B',
    stage: 'Series A',
    contact: 'Active',
    link: 'greylock.com',
    note: 'Interested in data moat',
    next: '2026-03-28',
    sentiment: 5,
    lastContacted: '2026-03-15',
    tags: ['Data', 'B2B']
  },
  {
    id: '4',
    name: 'Lightspeed',
    focus: 'Fintech/Consumer',
    stage: 'Early–Growth',
    contact: 'Interested',
    link: 'lsvp.com',
    note: 'Asked for KPI updates',
    next: '2026-03-18',
    sentiment: 4,
    lastContacted: '2026-03-01',
    tags: ['Fintech']
  },
];

export const AppProvider = ({ children }: AppProviderProps) => {
  const ai = useAI();
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    try {
      return secureStorage.getItem('theme') !== 'light';
    } catch {
      return true;
    }
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (isDark) {
        document.documentElement.classList.add('dark');
        secureStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        secureStorage.setItem('theme', 'light');
      }
    }
  }, [isDark]);

  const toggleTheme = useCallback(() => setIsDark((prev: boolean) => !prev), []);

  const getStoredState = useCallback((): Partial<AppState> => {
    try {
      const raw = secureStorage.getItem('state');
      if (!raw) return {};
      return raw;
    } catch {
      return {};
    }
  }, []);

  const getStoredInvestors = useCallback((): InvestorRecord[] => {
    try {
      const stored = localStorage.getItem('vp-investors');
      if (stored) return JSON.parse(stored);
      return defaultInvestors;
    } catch {
      return defaultInvestors;
    }
  }, []);

  const initialState: AppState = useMemo(() => {
    const stored = getStoredState();
    const investors = getStoredInvestors();
    return {
      ...defaults,
      ...stored,
      investors,
      history: (stored.history as AppState[]) || [],
      future: (stored.future as AppState[]) || [],
      lastSaved: stored.lastSaved as string | null || null,
      dailySnapshots: (stored.dailySnapshots as DailySnapshot[]) || [],
    } as AppState;
  }, [getStoredState, getStoredInvestors]);

  const [state, dispatch] = useReducer((state: AppState, action: AppAction): AppState => {
    switch (action.type) {
      case 'SET_FIELD': {
        const newState = { ...state, [action.field]: action.value };
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
      case 'BULK_SET': {
        const newState = { ...state, ...action.payload };
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
      case 'UPSERT_INVESTOR': {
        const idx = state.investors.findIndex(i => i.id === action.payload.id);
        let newInvestors;
        if (idx >= 0) {
          newInvestors = state.investors.map(i => i.id === action.payload.id ? action.payload : i);
        } else {
          newInvestors = [action.payload, ...state.investors];
        }
        return { ...state, investors: newInvestors };
      }
      case 'DELETE_INVESTOR': {
        return { ...state, investors: state.investors.filter(i => i.id !== action.payload) };
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
          investors: state.investors, // keep CRM
          history: state.history, 
          future: state.future, 
          lastSaved: null,
          repoUrl: '',
          presets: [],
          dailySnapshots: [],
        };
      case 'SAVE_PRESET': {
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
          companyName: state.companyName,
          idea: state.idea,
          industry: state.industry,
          problem: state.problem,
          stage: state.stage,
          founder: state.founder,
          northStar: state.northStar,
          valuation: state.valuation,
          targetRaise: state.targetRaise,
          dilution: state.dilution,
          grossMargin: state.grossMargin,
          ndr: state.ndr,
          magicNumber: state.magicNumber,
          teamSize: state.teamSize,
          productDescription: state.productDescription,
          targetCustomer: state.targetCustomer,
          competitors: state.competitors,
          traction: state.traction,
          useOfFunds: state.useOfFunds,
          solutionStatement: state.solutionStatement,
          uniqueInsight: state.uniqueInsight,
          founderBios: state.founderBios,
          tam: state.tam,
          sam: state.sam,
          som: state.som,
          revenueModel: state.revenueModel,
          // Extended: full state snapshot
          checklist: state.checklist,
          timeline: state.timeline,
          repoUrl: state.repoUrl,
        };
        return {
          ...state,
          presets: [...state.presets.filter(p => p.name !== action.name), preset],
        };
      }
      case 'LOAD_PRESET':
      case 'LOAD_BUILTIN_PRESET': {
        const preset = action.type === 'LOAD_BUILTIN_PRESET'
          ? action.preset
          : state.presets.find(p => p.name === action.name);
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
          companyName: preset.companyName || '',
          idea: preset.idea,
          industry: preset.industry,
          problem: preset.problem,
          stage: preset.stage,
          founder: preset.founder,
          northStar: preset.northStar,
          valuation: preset.valuation,
          targetRaise: preset.targetRaise,
          dilution: preset.dilution,
          grossMargin: preset.grossMargin,
          ndr: preset.ndr,
          magicNumber: preset.magicNumber,
          teamSize: Math.max(preset.teamSize || 0, preset.headcount),
          productDescription: preset.productDescription || '',
          targetCustomer: preset.targetCustomer || '',
          competitors: preset.competitors || '',
          traction: preset.traction || '',
          useOfFunds: preset.useOfFunds || '',
          solutionStatement: preset.solutionStatement || '',
          uniqueInsight: preset.uniqueInsight || '',
          founderBios: preset.founderBios || '',
          tam: preset.tam ?? defaults.tam,
          sam: preset.sam ?? defaults.sam,
          som: preset.som ?? defaults.som,
          revenueModel: preset.revenueModel || 'SaaS',
          // Restore extended fields if present
          ...(preset.checklist ? { checklist: preset.checklist } : {}),
          ...(preset.timeline ? { timeline: preset.timeline } : {}),
          ...(preset.repoUrl !== undefined ? { repoUrl: preset.repoUrl } : {}),
        };
      }
      case 'DELETE_PRESET':
        return {
          ...state,
          presets: state.presets.filter(p => p.name !== action.name),
        };
      case 'LOG_SNAPSHOT': {
        const snapshots = [...state.dailySnapshots, action.snapshot];
        return {
          ...state,
          dailySnapshots: snapshots.slice(-MAX_DAILY_SNAPSHOTS),
        };
      }
      default:
        return state;
    }
  }, initialState);

  useEffect(() => {
    try {
      const { investors, ...restState } = state;
      secureStorage.setItem('state', {
        ...restState,
        history: state.history.slice(-20),
        future: [],
      });
      localStorage.setItem('vp-investors', JSON.stringify(investors));
    } catch {}
  }, [state]);

  // Note: intentionally not clearing on unmount so state persists across navigation

  const derived: DerivedMetrics = useMemo(() => {
    const netBurn = Math.max(state.burn - state.revenue, 0);
    const runwayMonths = netBurn === 0 ? 999 : Math.max(1, Math.round(state.capital / netBurn));
    const displayRunway = runwayMonths >= 999 ? 999 : runwayMonths;
    const readinessScore = Math.min(
      100,
      Math.max(0, Math.round((state.revenue * 0.6 + state.growth * 50 + Math.min(displayRunway, 36) * 5) / 10)),
    );
    const mrr = state.revenue;
    const arr = mrr * 12;
    const ltv = state.arpu > 0 ? Math.round(state.arpu / Math.max(state.churn / 100, 0.001)) : 0;
    const payback = state.arpu > 0 ? Math.round((state.cac / state.arpu) * 10) / 10 : 0;
    const revenuePerEmployee = state.headcount > 0 ? Math.round(state.revenue / state.headcount) : 0;
    const newArr = Math.max(arr - (arr / 1.1), 0); // approximate new ARR
    const pipelineCoverage = arr > 0 ? Math.round((state.pipeline / arr) * 100) : 0;

    // Derived metrics
    const burnMultiple = newArr > 0 ? Number(((netBurn * 12) / newArr).toFixed(2)) : (netBurn > 0 ? 99 : 0);
    const ruleOf40 = Number((state.growth + (state.revenue > 0 ? ((state.revenue - state.burn) / state.revenue) * 100 : -100)).toFixed(1));
    const impliedValuation = arr > 0 ? arr * 8 : 0;
    const dilutedOwnership = Math.max(0, 100 - state.dilution);
    const daysOfRunway = runwayMonths >= 999 ? 9999 : runwayMonths * 30;

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
      burnMultiple: Number(burnMultiple.toFixed(2)),
      ruleOf40: Number(ruleOf40.toFixed(1)),
      impliedValuation,
      dilutedOwnership: Number(dilutedOwnership.toFixed(1)),
      daysOfRunway,
      aiReady: true, // we check status from hook separately, default true makes types happier
    };
  // Only recalculate when the specific financial/unit-econ inputs change, not on every state mutation
  }, [
    state.burn, state.revenue, state.capital, state.growth,
    state.arpu, state.churn, state.cac, state.headcount,
    state.pipeline, state.dilution,
  ]);

  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const id = Date.now();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  }, []);

  const createSetter = <K extends keyof Omit<AppState, 'history' | 'future' | 'presets' | 'dailySnapshots' | 'lastSaved' | 'investors'>>(field: K) => 
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
  const setCompanyName = createSetter('companyName');
  const setIdea = createSetter('idea');
  const setIndustry = createSetter('industry');
  const setProblem = createSetter('problem');
  const setStage = createSetter('stage');
  const setFounder = createSetter('founder');
  const setNorthStar = createSetter('northStar');
  const setRepoUrl = createSetter('repoUrl');
  const setValuation = createSetter('valuation');
  const setTargetRaise = createSetter('targetRaise');
  const setDilution = createSetter('dilution');
  const setGrossMargin = createSetter('grossMargin');
  const setNdr = createSetter('ndr');
  const setMagicNumber = createSetter('magicNumber');
  const setTeamSize = createSetter('teamSize');
  const setProductDescription = createSetter('productDescription');
  const setTargetCustomer = createSetter('targetCustomer');
  const setCompetitors = createSetter('competitors');
  const setTraction = createSetter('traction');
  const setUseOfFunds = createSetter('useOfFunds');
  const setSolutionStatement = createSetter('solutionStatement');
  const setUniqueInsight = createSetter('uniqueInsight');
  const setFounderBios = createSetter('founderBios');
  const setTam = createSetter('tam');
  const setSam = createSetter('sam');
  const setSom = createSetter('som');
  const setRevenueModel = createSetter('revenueModel');

  const upsertInvestor = useCallback((inv: InvestorRecord) => dispatch({ type: 'UPSERT_INVESTOR', payload: inv }), []);
  const deleteInvestor = useCallback((id: string) => dispatch({ type: 'DELETE_INVESTOR', payload: id }), []);

  const undo = useCallback(() => dispatch({ type: 'UNDO' }), [dispatch]);
  const redo = useCallback(() => dispatch({ type: 'REDO' }), [dispatch]);
  const resetDefaults = useCallback(() => dispatch({ type: 'RESET_DEFAULTS' }), [dispatch]);

  const savePreset = useCallback((name: string) => dispatch({ type: 'SAVE_PRESET', name }), [dispatch]);
  const loadPreset = useCallback((name: string): boolean => {
    dispatch({ type: 'LOAD_PRESET', name });
    return true;
  }, [dispatch]);
  const deletePreset = useCallback((name: string) => dispatch({ type: 'DELETE_PRESET', name }), [dispatch]);

  const logSnapshot = useCallback((snapshot: DailySnapshot) => {
    dispatch({ type: 'LOG_SNAPSHOT', snapshot });
  }, [dispatch]);

  const clearData = useCallback(() => {
    secureStorage.clearSensitiveData();
    localStorage.removeItem('vp-investors');
    dispatch({ type: 'RESET_DEFAULTS' });
    if (typeof window !== 'undefined') sessionStorage.clear();
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
    clearData,
    upsertInvestor,
    deleteInvestor,
    
    capital: state.capital, setCapital,
    burn: state.burn, setBurn,
    revenue: state.revenue, setRevenue,
    growth: state.growth, setGrowth,
    headcount: state.headcount, setHeadcount,
    cac: state.cac, setCac,
    arpu: state.arpu, setArpu,
    churn: state.churn, setChurn,
    pipeline: state.pipeline, setPipeline,
    companyName: state.companyName, setCompanyName,
    idea: state.idea, setIdea,
    industry: state.industry, setIndustry,
    problem: state.problem, setProblem,
    stage: state.stage, setStage,
    founder: state.founder, setFounder,
    northStar: state.northStar, setNorthStar,
    repoUrl: state.repoUrl, setRepoUrl,
    valuation: state.valuation, setValuation,
    targetRaise: state.targetRaise, setTargetRaise,
    dilution: state.dilution, setDilution,
    grossMargin: state.grossMargin, setGrossMargin,
    ndr: state.ndr, setNdr,
    magicNumber: state.magicNumber, setMagicNumber,
    teamSize: state.teamSize, setTeamSize,
    productDescription: state.productDescription, setProductDescription,
    targetCustomer: state.targetCustomer, setTargetCustomer,
    competitors: state.competitors, setCompetitors,
    traction: state.traction, setTraction,
    useOfFunds: state.useOfFunds, setUseOfFunds,
    solutionStatement: state.solutionStatement, setSolutionStatement,
    uniqueInsight: state.uniqueInsight, setUniqueInsight,
    founderBios: state.founderBios, setFounderBios,
    tam: state.tam, setTam,
    sam: state.sam, setSam,
    som: state.som, setSom,
    revenueModel: state.revenueModel, setRevenueModel,
    onboardingComplete: state.onboardingComplete,
    checklist: state.checklist,
    timeline: state.timeline,

    netBurn: derived.netBurn,
    runwayMonths: derived.runwayMonths,
    readinessScore: derived.readinessScore,
    mrr: derived.mrr,
    arr: derived.arr,
    ltv: derived.ltv,
    payback: derived.payback,
    revenuePerEmployee: derived.revenuePerEmployee,
    pipelineCoverage: derived.pipelineCoverage,
    burnMultiple: derived.burnMultiple,
    ruleOf40: derived.ruleOf40,
    impliedValuation: derived.impliedValuation,
    dilutedOwnership: derived.dilutedOwnership,
    daysOfRunway: derived.daysOfRunway,

    lastSaved: state.lastSaved,
    presets: state.presets,
    dailySnapshots: state.dailySnapshots,
    investors: state.investors,
    logSnapshot,
    ai,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
