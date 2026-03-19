import React, { useState } from 'react';

export const Card = React.memo(function Card({ children, style = {}, padding = '1.5rem', glow, className = '' }: any) {
  return (
    <div
      className={`bg-[var(--bg-card)] border border-[rgba(255,255,255,0.07)] rounded-[var(--radius-xl)] p-6 shadow-card relative overflow-hidden card-hover hover:shadow-elevated ${glow ? `shadow-[0_0_32px_${glow}]` : ''} ${className}`}
      style={{ padding, ...style }}
    >
      {children}
    </div>
  );
});

export const SectionHeader = React.memo(function SectionHeader({ icon: Icon, title, subtitle, color = 'var(--accent)' }: any) {
  return (
    <div className="flex items-center gap-3.5 mb-6">
      <div
        className="w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center"
        style={{
          backgroundColor: `${color}18`,
          border: `1px solid ${color}35`
        }}
      >
        <Icon size={18} color={color} />
      </div>
      <div>
        <h2 className="text-[var(--text-primary)] text-xl font-bold [-letter-spacing:-0.01em]">
          {title}
        </h2>
        {subtitle && <p className="text-[var(--text-muted)] text-sm mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
});

export const StatCard = React.memo(function StatCard({ icon: Icon, label, value, sub, color = 'var(--accent)', glow, className = '' }: any) {
  return (
    <div
      className={`bg-[var(--bg-card)] border border-[rgba(255,255,255,0.08)] rounded-[var(--radius-xl)] p-6 flex flex-col gap-3 relative overflow-hidden shadow-card card-hover hover:shadow-elevated hover:-translate-y-[2px] transition-all duration-150 ${glow ? `shadow-[0_0_40px_${glow}]` : ''} ${className}`}
    >
      <div
        className="w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center"
        style={{
          backgroundColor: `${color}18`,
          border: `1px solid ${color}35`
        }}
      >
        <Icon size={20} color={color} />
      </div>
      <div>
        <p className="text-[#64748b] text-xs font-bold uppercase tracking-[0.08em]">
          {label}
        </p>
        <p className="text-[#f8fafc] text-2xl font-black leading-tight mt-1 [-letter-spacing:-0.02em] font-mono">
          {value}
        </p>
        {sub && (
          <p className="text-[#475569] text-xs font-medium mt-1.5">{sub}</p>
        )}
      </div>
    </div>
  );
});

export const Badge = React.memo(function Badge({ children, color = '#6366f1' }: any) {
  return (
    <span
      style={{
        background: `${color}18`,
        color,
        border: `1px solid ${color}35`,
        padding: '3px 10px',
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 700,
        textTransform: 'uppercase',
      }}
    >
      {children}
    </span>
  );
});

export const InputField = React.memo(function InputField({ label, value, onChange, prefix, suffix, multiline, type = 'number', annotation, slider, options }: any) {
  const displayValue = type === 'number' && prefix === '$' 
    ? Number(value).toLocaleString() 
    : value;

  return (
    <div className="flex flex-col gap-1.5 mb-4 relative z-10 w-full">
      <label className="text-[var(--text-muted)] text-xs font-bold uppercase tracking-[0.05em] flex justify-between items-end">
        <span>{label}</span>
        {annotation && <span className="text-[var(--accent-light)] font-mono text-[10px] normal-case">{annotation}</span>}
      </label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] text-sm pointer-events-none">
            {prefix}
          </span>
        )}
        {multiline ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={3}
            className="w-full h-20 bg-[var(--bg-surface)] border border-[rgba(255,255,255,0.1)] rounded-[var(--radius-md)] p-3 text-[var(--text-primary)] text-sm font-medium focus:outline-none focus:border-[var(--border-accent)] focus:ring-2 focus:ring-[var(--accent)]/20 resize-none leading-6"
          />
        ) : type === 'select' && options ? (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-[var(--bg-base)] border border-[rgba(255,255,255,0.1)] rounded-[var(--radius-md)] px-2.5 py-2.5 text-[var(--text-primary)] text-sm font-semibold focus:outline-none focus:border-[var(--border-accent)]"
          >
            {options.map((opt: string) => <option key={opt} value={opt} className="text-black dark:text-gray-900">{opt}</option>)}
          </select>
        ) : (
          <input
            type={type === 'number' ? 'text' : type}
            value={displayValue} 
            onChange={(e) => {
              if (type === 'number') {
                const valStr = e.target.value.replace(/,/g, '');
                if (valStr === '') {
                  onChange(0);
                } else if (!isNaN(Number(valStr))) {
                  onChange(Number(valStr));
                }
              } else {
                onChange(e.target.value);
              }
            }}
            className={`w-full bg-[var(--bg-base)] border border-[rgba(255,255,255,0.1)] rounded-[var(--radius-md)] px-2.5 py-2.5 text-[var(--text-primary)] text-sm font-semibold focus:outline-none focus:border-[var(--border-accent)] ${prefix ? 'pl-8' : ''} ${suffix ? 'pr-8' : ''}`}
          />
        )}
        {suffix && (
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] text-sm pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
      {slider && type === 'number' && (
        <input 
          type="range" 
          min={slider.min} 
          max={slider.max} 
          step={slider.step || 1}
          value={value}
          onChange={(e)=> onChange(Number(e.target.value))}
          className="w-full mt-1.5 accent-[var(--accent)] cursor-pointer h-1 bg-[var(--bg-surface)] rounded-xl appearance-none" 
        />
      )}
    </div>
  );
});

export const MetricTooltip = React.memo(function MetricTooltip({ term, children }: any) {
  const [show, setShow] = useState(false);
  
  const dict: Record<string, {full: string, form: string, range: string}> = {
    'LTV': { full: 'Lifetime Value', form: 'ARPU / Churn Rate', range: '> 3x CAC' },
    'CAC': { full: 'Customer Acquisition Cost', form: 'S&M Spend / New Customers', range: '< 12mo payback' },
    'ARR': { full: 'Annual Recurring Revenue', form: 'MRR * 12', range: 'Growing MoM' },
    'MRR': { full: 'Monthly Recurring Revenue', form: 'Sum of active subscriptions', range: 'Growing MoM' },
    'NDR': { full: 'Net Dollar Retention', form: '(Starting + Expansion - Contraction - Churn) / Starting', range: '> 100% (SaaS)' },
    'Burn Multiple': { full: 'Burn Multiple', form: 'Net Burn / Net New ARR', range: '< 2.0x' },
    'Rule of 40': { full: 'Rule of 40', form: 'Growth Rate + Profit Margin', range: '> 40%' },
  };
  
  const info = dict[term];

  return (
    <span 
      className="relative inline-flex items-center cursor-help"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <span className="border-b border-dashed border-[var(--text-secondary)] tracking-wider">{children || term}</span>
      {info && show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-md)] shadow-elevated z-[9999] pointer-events-none">
          <p className="font-bold text-sm text-[var(--text-primary)] mb-1.5">{info.full}</p>
          <p className="text-xs text-[var(--text-muted)] mb-1"><strong>Formula:</strong> {info.form}</p>
          <p className="text-xs text-[var(--text-muted)] mb-1"><strong>Healthy:</strong> <span className="text-[var(--accent-light)] font-mono">{info.range}</span></p>
          <p className="text-[10px] text-[var(--text-muted)] mt-2 opacity-60">Learn more on industry benchmarks</p>
        </div>
      )}
    </span>
  );
});
