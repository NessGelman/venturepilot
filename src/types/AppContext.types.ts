export interface InvestorRecord {
  id: string;
  name: string;
  focus: string;
  stage: string;
  contact: 'Active' | 'Interested' | 'Dormant' | 'Passed' | 'Portfolio';
  link: string;
  note: string;
  next: string;
  sentiment: 1 | 2 | 3 | 4 | 5;
  lastContacted: string;
  tags: string[];
}

import type { UseAIReturn } from '../hooks/useAI';

export interface AppState {
  capital: number;
  burn: number;
  revenue: number;
  growth: number;
  headcount: number;
  cac: number;
  arpu: number;
  churn: number;
  pipeline: number;
  idea: string;
  industry: string;
  problem: string;
  stage: string;
  founder: string;
  northStar: string;
  repoUrl: string;

  // New financial fields
  valuation: number;
  targetRaise: number;
  dilution: number;
  grossMargin: number;
  ndr: number;
  magicNumber: number;

  // New narrative fields
  teamSize: number;
  productDescription: string;
  targetCustomer: string;
  competitors: string;
  traction: string;
  useOfFunds: string;
  solutionStatement: string;
  uniqueInsight: string;
  founderBios: string;

  // Market sizing
  tam: number;
  sam: number;
  som: number;
  revenueModel: string;

  // New CRM fields
  investors: InvestorRecord[];

  // Note: aiReady is derived, not stored. So we don't put it here.
  
  presets: Preset[];
  dailySnapshots: DailySnapshot[];
  history: AppState[];
  future: AppState[];
  lastSaved: string | null;
  onboardingComplete: boolean;
  checklist: ChecklistItem[]; // for Strategy page
  timeline: TimelineMilestone[]; // for Dashboard timeline
}

export interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

export interface TimelineMilestone {
  id: string;
  label: string;
  done: boolean;
  durationDays: number;
  date: string;
}

export interface Preset {
  name: string;
  capital: number;
  burn: number;
  revenue: number;
  growth: number;
  headcount: number;
  cac: number;
  arpu: number;
  churn: number;
  pipeline: number;
  idea: string;
  industry: string;
  problem: string;
  stage: string;
  founder: string;
  northStar: string;
  valuation: number;
  targetRaise: number;
  dilution: number;
  grossMargin: number;
  ndr: number;
  magicNumber: number;
  teamSize: number;
  productDescription: string;
  targetCustomer: string;
  competitors: string;
  traction: string;
  useOfFunds: string;
  solutionStatement: string;
  uniqueInsight: string;
  founderBios: string;
  tam: number;
  sam: number;
  som: number;
  revenueModel: string;
}

export interface DailySnapshot {
  date: string;
  runwayMonths: number;
  revenue: number;
  burn: number;
  growth: number;
}

export type AppAction = 
  | { type: 'SET_FIELD'; field: keyof Omit<AppState, 'history' | 'future' | 'lastSaved' | 'presets' | 'dailySnapshots' | 'investors'>; value: any }
  | { type: 'BULK_SET'; payload: Partial<AppState> }
  | { type: 'UPSERT_INVESTOR'; payload: InvestorRecord }
  | { type: 'DELETE_INVESTOR'; payload: string }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'RESET_DEFAULTS' }
  | { type: 'SAVE_PRESET'; name: string }
  | { type: 'LOAD_PRESET'; name: string }
  | { type: 'DELETE_PRESET'; name: string };

export interface UseAppReturn {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  derived: DerivedMetrics;
  isDark: boolean;
  toggleTheme: () => void;
  toasts: Toast[];
  addToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  undo: () => void;
  redo: () => void;
  savePreset: (name: string) => void;
  loadPreset: (name: string) => boolean;
  deletePreset: (name: string) => void;
  resetDefaults: () => void;
  clearData: () => void;
  upsertInvestor: (inv: InvestorRecord) => void;
  deleteInvestor: (id: string) => void;
  
  capital: number;
  burn: number;
  revenue: number;
  growth: number;
  headcount: number;
  cac: number;
  arpu: number;
  churn: number;
  pipeline: number;
  idea: string;
  industry: string;
  problem: string;
  stage: string;
  founder: string;
  northStar: string;
  repoUrl: string;
  valuation: number;
  targetRaise: number;
  dilution: number;
  grossMargin: number;
  ndr: number;
  magicNumber: number;
  teamSize: number;
  productDescription: string;
  targetCustomer: string;
  competitors: string;
  traction: string;
  useOfFunds: string;
  onboardingComplete: boolean;
  checklist: ChecklistItem[];
  timeline: TimelineMilestone[];

  setCapital: (v: number) => void;
  setBurn: (v: number) => void;
  setRevenue: (v: number) => void;
  setGrowth: (v: number) => void;
  setHeadcount: (v: number) => void;
  setCac: (v: number) => void;
  setArpu: (v: number) => void;
  setChurn: (v: number) => void;
  setPipeline: (v: number) => void;
  setIdea: (v: string) => void;
  setIndustry: (v: string) => void;
  setProblem: (v: string) => void;
  setStage: (v: string) => void;
  setFounder: (v: string) => void;
  setNorthStar: (v: string) => void;
  setRepoUrl: (v: string) => void;
  setValuation: (v: number) => void;
  setTargetRaise: (v: number) => void;
  setDilution: (v: number) => void;
  setGrossMargin: (v: number) => void;
  setNdr: (v: number) => void;
  setMagicNumber: (v: number) => void;
  setTeamSize: (v: number) => void;
  setProductDescription: (v: string) => void;
  setTargetCustomer: (v: string) => void;
  setCompetitors: (v: string) => void;
  setTraction: (v: string) => void;
  setUseOfFunds: (v: string) => void;
  solutionStatement: string;
  setSolutionStatement: (v: string) => void;
  uniqueInsight: string;
  setUniqueInsight: (v: string) => void;
  founderBios: string;
  setFounderBios: (v: string) => void;
  tam: number;
  setTam: (v: number) => void;
  sam: number;
  setSam: (v: number) => void;
  som: number;
  setSom: (v: number) => void;
  revenueModel: string;
  setRevenueModel: (v: string) => void;

  netBurn: number;
  runwayMonths: number;
  readinessScore: number;
  mrr: number;
  arr: number;
  ltv: number;
  payback: number;
  revenuePerEmployee: number;
  pipelineCoverage: number;
  burnMultiple: number;
  ruleOf40: number;
  impliedValuation: number;
  dilutedOwnership: number;
  daysOfRunway: number;

  lastSaved: string | null;
  presets: Preset[];
  dailySnapshots: DailySnapshot[];
  investors: InvestorRecord[];
  
  ai: UseAIReturn;
}

export interface DerivedMetrics {
  netBurn: number;
  runwayMonths: number;
  readinessScore: number;
  mrr: number;
  arr: number;
  ltv: number;
  payback: number;
  revenuePerEmployee: number;
  pipelineCoverage: number;
  burnMultiple: number;
  ruleOf40: number;
  impliedValuation: number;
  dilutedOwnership: number;
  daysOfRunway: number;
  aiReady: boolean;
}

export interface Toast {
  id: number;
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
}
