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
  presets: Preset[];
  dailySnapshots: DailySnapshot[];
  history: AppState[];
  future: AppState[];
  lastSaved: string | null;
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
}

export interface DailySnapshot {
  date: string;
  runwayMonths: number;
  revenue: number;
  burn: number;
  growth: number;
}

export type AppAction = 
  | { type: 'SET_FIELD'; field: keyof Omit<AppState, 'history' | 'future' | 'lastSaved' | 'presets' | 'dailySnapshots'>; value: any }
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
  addToast: (message: string) => void;
  undo: () => void;
  redo: () => void;
  savePreset: (name: string) => void;
  loadPreset: (name: string) => boolean;
  deletePreset: (name: string) => void;
  resetDefaults: () => void;
  // Backwards compat (remove after migration)
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
  netBurn: number;
  runwayMonths: number;
  readinessScore: number;
  mrr: number;
  arr: number;
  ltv: number;
  payback: number;
  revenuePerEmployee: number;
  pipelineCoverage: number;
  lastSaved: string | null;
  presets: Preset[];
  dailySnapshots: DailySnapshot[];
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
}

export interface Toast {
  id: number;
  message: string;
}

