import type { UseAIReturn } from '../hooks/useAI';

export type ContactStatus = 'Active' | 'Interested' | 'Dormant' | 'Passed' | 'Portfolio';
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface InvestorRecord {
  id: string;
  name: string;
  focus: string;
  stage: string;
  contact: ContactStatus;
  link: string;
  note: string;
  next: string;
  sentiment: 1 | 2 | 3 | 4 | 5;
  lastContacted: string;
  tags: string[];
}

export interface AppState {
  // Company basics
  companyName: string;
  idea: string;
  industry: string;
  problem: string;
  stage: string;
  founder: string;
  northStar: string;
  repoUrl: string;

  // Core metrics
  capital: number;
  burn: number;
  revenue: number;
  growth: number;
  headcount: number;
  cac: number;
  arpu: number;
  churn: number;
  pipeline: number;

  // Fundraising
  valuation: number;
  targetRaise: number;
  dilution: number;

  // Financial health
  grossMargin: number;
  ndr: number;
  magicNumber: number;

  // Market sizing
  tam: number;
  sam: number;
  som: number;
  revenueModel: string;

  // Narrative
  teamSize: number;
  productDescription: string;
  targetCustomer: string;
  competitors: string;
  traction: string;
  useOfFunds: string;
  solutionStatement: string;
  uniqueInsight: string;
  founderBios: string;

  // CRM
  investors: InvestorRecord[];

  // App state
  presets: Preset[];
  dailySnapshots: DailySnapshot[];
  checklist: ChecklistItem[];
  timeline: TimelineMilestone[];

  // Undo/redo stack
  history: AppState[];
  future: AppState[];

  lastSaved: string | null;
  onboardingComplete: boolean;
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
  // Core metrics
  capital: number;
  burn: number;
  revenue: number;
  growth: number;
  headcount: number;
  cac: number;
  arpu: number;
  churn: number;
  pipeline: number;
  // Company basics
  companyName: string;
  idea: string;
  industry: string;
  problem: string;
  stage: string;
  founder: string;
  northStar: string;
  // Fundraising
  valuation: number;
  targetRaise: number;
  dilution: number;
  // Financial health
  grossMargin: number;
  ndr: number;
  magicNumber: number;
  // Market sizing
  tam: number;
  sam: number;
  som: number;
  revenueModel: string;
  // Narrative
  teamSize: number;
  productDescription: string;
  targetCustomer: string;
  competitors: string;
  traction: string;
  useOfFunds: string;
  solutionStatement: string;
  uniqueInsight: string;
  founderBios: string;
  // Optional extended fields
  checklist?: ChecklistItem[];
  timeline?: TimelineMilestone[];
  repoUrl?: string;
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
  | { type: 'LOAD_BUILTIN_PRESET'; preset: Preset }
  | { type: 'DELETE_PRESET'; name: string }
  | { type: 'LOG_SNAPSHOT'; snapshot: DailySnapshot };

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
  type?: ToastType;
}

export interface UseAppReturn {
  // Raw state
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  derived: DerivedMetrics;

  // Theme
  isDark: boolean;
  toggleTheme: () => void;

  // Toasts
  toasts: Toast[];
  addToast: (message: string, type?: ToastType) => void;

  // Undo/redo
  undo: () => void;
  redo: () => void;

  // Presets
  presets: Preset[];
  savePreset: (name: string) => void;
  loadPreset: (name: string) => boolean;
  deletePreset: (name: string) => void;

  // Data management
  resetDefaults: () => void;
  clearData: () => void;
  lastSaved: string | null;

  // Investors (CRM)
  investors: InvestorRecord[];
  upsertInvestor: (inv: InvestorRecord) => void;
  deleteInvestor: (id: string) => void;

  // Snapshots
  dailySnapshots: DailySnapshot[];
  logSnapshot: (snapshot: DailySnapshot) => void;

  // Company basics
  companyName: string;
  setCompanyName: (v: string) => void;
  idea: string;
  setIdea: (v: string) => void;
  industry: string;
  setIndustry: (v: string) => void;
  problem: string;
  setProblem: (v: string) => void;
  stage: string;
  setStage: (v: string) => void;
  founder: string;
  setFounder: (v: string) => void;
  northStar: string;
  setNorthStar: (v: string) => void;
  repoUrl: string;
  setRepoUrl: (v: string) => void;

  // Core metrics
  capital: number;
  setCapital: (v: number) => void;
  burn: number;
  setBurn: (v: number) => void;
  revenue: number;
  setRevenue: (v: number) => void;
  growth: number;
  setGrowth: (v: number) => void;
  headcount: number;
  setHeadcount: (v: number) => void;
  cac: number;
  setCac: (v: number) => void;
  arpu: number;
  setArpu: (v: number) => void;
  churn: number;
  setChurn: (v: number) => void;
  pipeline: number;
  setPipeline: (v: number) => void;

  // Fundraising
  valuation: number;
  setValuation: (v: number) => void;
  targetRaise: number;
  setTargetRaise: (v: number) => void;
  dilution: number;
  setDilution: (v: number) => void;

  // Financial health
  grossMargin: number;
  setGrossMargin: (v: number) => void;
  ndr: number;
  setNdr: (v: number) => void;
  magicNumber: number;
  setMagicNumber: (v: number) => void;

  // Market sizing
  tam: number;
  setTam: (v: number) => void;
  sam: number;
  setSam: (v: number) => void;
  som: number;
  setSom: (v: number) => void;
  revenueModel: string;
  setRevenueModel: (v: string) => void;

  // Narrative
  teamSize: number;
  setTeamSize: (v: number) => void;
  productDescription: string;
  setProductDescription: (v: string) => void;
  targetCustomer: string;
  setTargetCustomer: (v: string) => void;
  competitors: string;
  setCompetitors: (v: string) => void;
  traction: string;
  setTraction: (v: string) => void;
  useOfFunds: string;
  setUseOfFunds: (v: string) => void;
  solutionStatement: string;
  setSolutionStatement: (v: string) => void;
  uniqueInsight: string;
  setUniqueInsight: (v: string) => void;
  founderBios: string;
  setFounderBios: (v: string) => void;

  // Checklist & timeline
  checklist: ChecklistItem[];
  timeline: TimelineMilestone[];
  onboardingComplete: boolean;

  // Derived metrics (aliased from `derived` for convenience)
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

  // AI
  ai: UseAIReturn;
}
