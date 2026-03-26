import React, { useState, useRef, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

// ─── Card ────────────────────────────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: string;
  glow?: string;
  hover?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}
export const Card = React.memo(function Card({ children, className = '', padding = '1.5rem', glow, hover = false, onClick, style }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-xl)] relative overflow-hidden ${hover || onClick ? 'card-interactive cursor-pointer' : ''} ${glow ? '' : 'shadow-[var(--shadow-card)]'} ${className}`}
      style={{
        padding,
        ...(glow ? { boxShadow: `0 0 32px ${glow}, var(--shadow-card)` } : {}),
        ...style,
      }}
    >
      {children}
    </div>
  );
});

// ─── GlassCard ───────────────────────────────────────────────────────────────
export const GlassCard = React.memo(function GlassCard({ children, className = '', padding = '1.5rem' }: Omit<CardProps, 'hover' | 'glow'>) {
  return (
    <div
      className={`glass-card rounded-[var(--radius-xl)] ${className}`}
      style={{ padding }}
    >
      {children}
    </div>
  );
});

// ─── SectionHeader ───────────────────────────────────────────────────────────
interface SectionHeaderProps {
  icon?: React.ElementType;
  title: string;
  subtitle?: string;
  color?: string;
  className?: string;
  actions?: React.ReactNode;
}
export const SectionHeader = React.memo(function SectionHeader({ icon: Icon, title, subtitle, color = 'var(--accent-light)', className = '', actions }: SectionHeaderProps) {
  return (
    <div className={`flex items-center justify-between mb-5 ${className}`}>
      <div className="flex items-center gap-3">
        {Icon && (
          <div
            className="w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center shrink-0"
            style={{ background: `${color}18`, border: `1px solid ${color}30` }}
          >
            <Icon size={16} color={color} />
          </div>
        )}
        <div>
          <h2 className="text-[var(--text-primary)] text-base font-bold leading-tight">
            {title}
          </h2>
          {subtitle && <p className="text-[var(--text-muted)] text-xs mt-0.5 font-medium">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
});

// ─── PageHeader ──────────────────────────────────────────────────────────────
interface PageHeaderProps {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  badge?: React.ReactNode;
}
export const PageHeader = React.memo(function PageHeader({ icon: Icon, title, subtitle, actions, badge }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-[var(--radius-lg)] flex items-center justify-center bg-[var(--accent-dim)] border border-[var(--border-accent)] shrink-0">
          <Icon size={22} className="text-[var(--accent-light)]" />
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-[var(--text-primary)] tracking-tight leading-none">
              {title}
            </h1>
            {badge}
          </div>
          {subtitle && (
            <p className="text-[var(--text-muted)] text-sm mt-1 font-medium">{subtitle}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
});

// ─── StatCard ────────────────────────────────────────────────────────────────
interface StatCardProps {
  icon?: React.ElementType;
  label: React.ReactNode;
  value: React.ReactNode;
  sub?: string;
  color?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
  onClick?: () => void;
}
export const StatCard = React.memo(function StatCard({ icon: Icon, label, value, sub, color = 'var(--accent-light)', trend, trendValue, className = '', onClick }: StatCardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'var(--green)' : trend === 'down' ? 'var(--red)' : 'var(--text-muted)';

  return (
    <div
      onClick={onClick}
      className={`bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-xl)] p-5 flex flex-col gap-3 relative overflow-hidden card-interactive ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Top row */}
      <div className="flex items-start justify-between">
        {Icon && (
          <div
            className="w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center shrink-0"
            style={{ background: `${color}15`, border: `1px solid ${color}28` }}
          >
            <Icon size={16} style={{ color }} />
          </div>
        )}
        {trend && (
          <div className="flex items-center gap-1" style={{ color: trendColor }}>
            <TrendIcon size={12} />
            <span className="text-[11px] font-bold font-mono">{trendValue}</span>
          </div>
        )}
      </div>

      {/* Value */}
      <div>
        <p className="metric-label mb-1">{label}</p>
        <p className="metric-value text-[var(--text-primary)]">{value}</p>
        {sub && <p className="text-[11px] text-[var(--text-muted)] font-medium mt-1.5">{sub}</p>}
      </div>
    </div>
  );
});

// ─── Badge ───────────────────────────────────────────────────────────────────
interface BadgeProps {
  children: React.ReactNode;
  color?: string;
  size?: 'sm' | 'md';
  dot?: boolean;
}
export const Badge = React.memo(function Badge({ children, color = 'var(--accent-light)', size = 'sm', dot = false }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 font-bold uppercase tracking-wider ${size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-3 py-1'} rounded-full`}
      style={{
        background: `${color}15`,
        color,
        border: `1px solid ${color}28`,
      }}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />}
      {children}
    </span>
  );
});

// ─── Button ──────────────────────────────────────────────────────────────────
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ElementType;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  loading?: boolean;
}
export const Button = React.memo(function Button({ children, onClick, variant = 'secondary', size = 'md', icon: Icon, iconPosition = 'left', disabled, className = '', type = 'button', loading }: ButtonProps) {
  const base = 'inline-flex items-center gap-2 font-bold rounded-[var(--radius-md)] transition-all duration-150 cursor-pointer select-none btn-glow disabled:opacity-40 disabled:cursor-not-allowed';
  const sizeClasses = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-6 py-2.5 text-sm' };
  const variantClasses = {
    primary: 'bg-[var(--accent)] hover:bg-[var(--accent-dark)] text-white shadow-[var(--shadow-glow-sm)] hover:shadow-[var(--shadow-glow)] hover:-translate-y-0.5',
    secondary: 'bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.08)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:-translate-y-0.5',
    ghost: 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.04)]',
    danger: 'bg-[var(--red-dim)] hover:bg-[rgba(239,68,68,0.2)] border border-[rgba(239,68,68,0.2)] text-[var(--red)] hover:-translate-y-0.5',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {loading ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        Icon && iconPosition === 'left' && <Icon size={size === 'sm' ? 12 : 14} />
      )}
      {children}
      {Icon && iconPosition === 'right' && !loading && <Icon size={size === 'sm' ? 12 : 14} />}
    </button>
  );
});

// ─── AIButton ────────────────────────────────────────────────────────────────
interface AIButtonProps {
  onClick: () => void;
  children?: React.ReactNode;
  size?: 'sm' | 'md';
}
export const AIButton = React.memo(function AIButton({ onClick, children = 'AI Insights', size = 'sm' }: AIButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 bg-[rgba(167,139,250,0.08)] hover:bg-[rgba(167,139,250,0.14)] border border-[rgba(167,139,250,0.2)] text-[var(--accent-light)] font-bold rounded-[var(--radius-md)] transition-all hover:-translate-y-0.5 ${size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'}`}
    >
      <span className="text-[11px]">✦</span>
      {children}
    </button>
  );
});

// ─── MetricTooltip ───────────────────────────────────────────────────────────
interface MetricTooltipProps {
  term: string;
  definition?: string;
  children?: React.ReactNode;
}
export const MetricTooltip = React.memo(function MetricTooltip({ term, definition, children }: MetricTooltipProps) {
  const [show, setShow] = useState(false);

  const dict: Record<string, { full: string; form: string; range: string; why: string }> = {
    'LTV': { full: 'Lifetime Value', form: 'ARPU ÷ Churn Rate', range: '> 3× CAC', why: 'Measures the total revenue expected from a single customer.' },
    'CAC': { full: 'Customer Acquisition Cost', form: 'Total S&M ÷ New Customers', range: 'Payback < 12 months', why: 'The average cost to acquire one paying customer.' },
    'ARR': { full: 'Annual Recurring Revenue', form: 'MRR × 12', range: 'Growing MoM', why: 'Normalized annual subscription revenue baseline.' },
    'MRR': { full: 'Monthly Recurring Revenue', form: 'Sum of active subscriptions', range: 'Growing 8–15% MoM at seed', why: 'The heartbeat metric for subscription businesses.' },
    'NDR': { full: 'Net Dollar Retention', form: '(Start + Expansion − Churn) ÷ Start', range: '> 110% top-quartile', why: 'Revenue growth from existing customers, ex. new sales.' },
    'Burn Multiple': { full: 'Burn Multiple', form: 'Net Burn ÷ Net New ARR', range: '< 1.5× excellent', why: 'Capital efficiency: how much you spend per $1 of new ARR.' },
    'Rule of 40': { full: 'Rule of 40', form: 'Growth % + Profit Margin %', range: '> 40% investable', why: 'Balances growth speed vs. efficiency for SaaS health.' },
    'LTV/CAC': { full: 'LTV to CAC Ratio', form: 'LTV ÷ CAC', range: '> 3× healthy', why: 'Measures unit economics quality. Below 3× is dangerous.' },
    'Magic Number': { full: 'Magic Number', form: '(Q2 ARR − Q1 ARR) × 4 ÷ Q1 S&M', range: '> 0.75 efficient', why: 'Efficiency of sales & marketing spend on ARR growth.' },
  };

  const info = dict[term];
  const hasTooltip = !!info || !!definition;

  return (
    <span
      className="relative inline-flex items-center cursor-help"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <span className="border-b border-dashed border-[var(--text-muted)] opacity-70">{children || term}</span>
      {hasTooltip && show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-72 p-4 bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-elevated)] z-[9999] pointer-events-none text-left">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[var(--accent-light)] font-black text-sm">{term}</span>
            {info && <span className="text-[var(--text-muted)] font-medium text-xs">— {info.full}</span>}
          </div>
          <p className="text-xs text-[var(--text-secondary)] mb-3 leading-relaxed">{definition || info?.why}</p>
          {info && (
            <div className="space-y-1.5 border-t border-[var(--border-subtle)] pt-2.5">
              <p className="text-[10px] text-[var(--text-muted)]"><span className="font-bold text-[var(--text-secondary)]">Formula:</span> {info.form}</p>
              <p className="text-[10px] text-[var(--text-muted)]"><span className="font-bold text-[var(--green)]">Healthy:</span> {info.range}</p>
            </div>
          )}
        </div>
      )}
    </span>
  );
});

// ─── InputField ──────────────────────────────────────────────────────────────
interface InputFieldProps {
  label: string;
  value: any;
  onChange: (v: any) => void;
  prefix?: string;
  suffix?: string;
  multiline?: boolean;
  type?: 'number' | 'text' | 'select';
  annotation?: React.ReactNode;
  slider?: { min: number; max: number; step?: number };
  options?: string[];
  placeholder?: string;
}
export const InputField = React.memo(function InputField({ label, value, onChange, prefix, suffix, multiline, type = 'number', annotation, slider, options, placeholder }: InputFieldProps) {
  const displayValue = type === 'number' && prefix === '$'
    ? Number(value || 0).toLocaleString()
    : value;

  const inputBase = `w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-md)] text-[var(--text-primary)] text-sm font-semibold transition-colors focus:border-[var(--accent)] ${prefix ? 'pl-7' : 'pl-3'} ${suffix ? 'pr-7' : 'pr-3'} py-2.5`;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="flex justify-between items-end">
        <span className="metric-label">{label}</span>
        {annotation && <span className="text-[10px] font-mono font-bold text-[var(--accent-light)] normal-case">{annotation}</span>}
      </label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-xs pointer-events-none font-medium">{prefix}</span>
        )}
        {multiline ? (
          <textarea
            value={value}
            onChange={e => onChange(e.target.value)}
            rows={3}
            placeholder={placeholder}
            className={`w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-2.5 text-[var(--text-primary)] text-sm font-medium focus:border-[var(--accent)] resize-none leading-relaxed`}
          />
        ) : type === 'select' && options ? (
          <select
            value={value}
            onChange={e => onChange(e.target.value)}
            className={inputBase + ' appearance-none cursor-pointer'}
          >
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        ) : (
          <input
            type={type === 'number' ? 'text' : type}
            value={displayValue}
            placeholder={placeholder}
            onChange={e => {
              if (type === 'number') {
                const raw = e.target.value.replace(/,/g, '');
                if (raw === '' || raw === '-') onChange(raw === '-' ? -1 : 0);
                else if (!isNaN(Number(raw))) onChange(Number(raw));
              } else {
                onChange(e.target.value);
              }
            }}
            className={inputBase}
          />
        )}
        {suffix && (
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-xs pointer-events-none font-medium">{suffix}</span>
        )}
      </div>
      {slider && type === 'number' && (
        <input
          type="range"
          min={slider.min}
          max={slider.max}
          step={slider.step || 1}
          value={value || 0}
          onChange={e => onChange(Number(e.target.value))}
          className="w-full mt-0.5"
          style={{
            background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${Math.max(0, Math.min(100, ((value - slider.min) / (slider.max - slider.min)) * 100))}%, rgba(255,255,255,0.1) ${Math.max(0, Math.min(100, ((value - slider.min) / (slider.max - slider.min)) * 100))}%, rgba(255,255,255,0.1) 100%)`,
          }}
        />
      )}
    </div>
  );
});

// ─── Divider ─────────────────────────────────────────────────────────────────
export const Divider = ({ label }: { label?: string }) => (
  <div className="flex items-center gap-3 my-2">
    <div className="flex-1 h-px bg-[var(--border-subtle)]" />
    {label && <span className="text-[10px] uppercase tracking-widest font-bold text-[var(--text-faint)]">{label}</span>}
    <div className="flex-1 h-px bg-[var(--border-subtle)]" />
  </div>
);

// ─── Pill tabs ───────────────────────────────────────────────────────────────
interface TabItem { id: string; label: string; icon?: React.ElementType }
interface PillTabsProps { tabs: TabItem[]; active: string; onChange: (id: string) => void; className?: string }
export const PillTabs = React.memo(function PillTabs({ tabs, active, onChange, className = '' }: PillTabsProps) {
  return (
    <div className={`flex gap-1 p-1 bg-[rgba(255,255,255,0.03)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] ${className}`}>
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-bold transition-all whitespace-nowrap ${
            active === t.id
              ? 'bg-[var(--accent)] text-white shadow-[var(--shadow-glow-sm)]'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.04)]'
          }`}
        >
          {t.icon && <t.icon size={11} />}
          {t.label}
        </button>
      ))}
    </div>
  );
});

// ─── EmptyState ──────────────────────────────────────────────────────────────
interface EmptyStateProps { icon?: React.ElementType; title: string; description?: string; action?: React.ReactNode }
export const EmptyState = ({ icon: Icon, title, description, action }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    {Icon && (
      <div className="w-14 h-14 rounded-[var(--radius-xl)] bg-[var(--accent-dim)] border border-[var(--border-accent)] flex items-center justify-center mb-4">
        <Icon size={24} className="text-[var(--accent-light)] opacity-60" />
      </div>
    )}
    <h3 className="text-base font-bold text-[var(--text-secondary)] mb-1">{title}</h3>
    {description && <p className="text-sm text-[var(--text-muted)] max-w-xs">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

// ─── MetricRow ───────────────────────────────────────────────────────────────
interface MetricRowProps { label: string; value: React.ReactNode; color?: string; trend?: 'good' | 'bad' | 'neutral' }
export const MetricRow = ({ label, value, color, trend }: MetricRowProps) => {
  const c = trend === 'good' ? 'var(--green)' : trend === 'bad' ? 'var(--red)' : color || 'var(--text-primary)';
  return (
    <div className="flex items-center justify-between py-2 border-b border-[var(--border-subtle)] last:border-b-0">
      <span className="text-xs font-medium text-[var(--text-muted)]">{label}</span>
      <span className="text-xs font-black font-mono" style={{ color: c }}>{value}</span>
    </div>
  );
};

// ─── GaugeMini ───────────────────────────────────────────────────────────────
interface GaugeMiniProps { value: number; max?: number; color?: string; size?: number }
export const GaugeMini = React.memo(function GaugeMini({ value, max = 100, color = 'var(--accent-light)', size = 48 }: GaugeMiniProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const r = (size / 2) - 5;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="4" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="4"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.6s ease', filter: `drop-shadow(0 0 4px ${color})` }}
      />
    </svg>
  );
});

// ─── HealthBar ────────────────────────────────────────────────────────────────
interface HealthBarProps { value: number; label: string; inverse?: boolean }
export const HealthBar = ({ value, label, inverse = false }: HealthBarProps) => {
  const isGood = inverse ? value <= 50 : value >= 60;
  const color = isGood ? 'var(--green)' : value >= 30 && !inverse ? 'var(--amber)' : value <= 80 && inverse ? 'var(--amber)' : 'var(--red)';
  const pct = inverse ? Math.max(0, 100 - value) : Math.min(100, value);

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">{label}</span>
        <span className="text-[11px] font-mono font-bold" style={{ color }}>{value}%</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${pct}%`, background: color, boxShadow: `0 0 8px ${color}40` }} />
      </div>
    </div>
  );
};

// ─── Alert Banner ────────────────────────────────────────────────────────────
interface AlertBannerProps { type: 'warning' | 'error' | 'info' | 'success'; icon?: React.ElementType; title: string; description?: string }
export const AlertBanner = ({ type, icon: Icon, title, description }: AlertBannerProps) => {
  const cfg = {
    warning: { bg: 'var(--amber-dim)', border: 'rgba(245,158,11,0.3)', color: 'var(--amber)' },
    error: { bg: 'var(--red-dim)', border: 'rgba(239,68,68,0.3)', color: 'var(--red)' },
    info: { bg: 'var(--blue-dim)', border: 'rgba(59,130,246,0.3)', color: 'var(--blue)' },
    success: { bg: 'var(--green-dim)', border: 'rgba(16,185,129,0.3)', color: 'var(--green)' },
  }[type];

  return (
    <div
      className="flex items-start gap-3 px-4 py-3 rounded-[var(--radius-lg)] border mb-4"
      style={{ background: cfg.bg, borderColor: cfg.border }}
    >
      {Icon && <Icon size={16} style={{ color: cfg.color, marginTop: 2, flexShrink: 0 }} />}
      <div>
        <p className="text-sm font-bold" style={{ color: cfg.color }}>{title}</p>
        {description && <p className="text-xs font-medium mt-0.5 opacity-80" style={{ color: cfg.color }}>{description}</p>}
      </div>
    </div>
  );
};

// ─── Spinner ──────────────────────────────────────────────────────────────────
export const Spinner = ({ size = 16 }: { size?: number }) => (
  <span
    className="border-2 border-current border-t-transparent rounded-full animate-spin inline-block"
    style={{ width: size, height: size }}
  />
);

// ─── CountUp number animation ─────────────────────────────────────────────────
interface CountUpProps { value: number; prefix?: string; suffix?: string; decimals?: number; duration?: number }
export function CountUp({ value, prefix = '', suffix = '', decimals = 0, duration = 1200 }: CountUpProps) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number>();
  const startRef = useRef<number>();
  const fromRef = useRef(0);

  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    const start = performance.now();
    startRef.current = start;

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = from + (to - from) * ease;
      setDisplay(current);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [value, duration]);

  const formatted = decimals > 0
    ? display.toFixed(decimals)
    : Math.round(display).toLocaleString();

  return <>{prefix}{formatted}{suffix}</>;
}
