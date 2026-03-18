import React from 'react';

export function Card({ children, style = {}, padding = '1.5rem', glow, className = '' }) {
  return (
    <div
      className={`bg-[var(--bg-card)] border border-[rgba(255,255,255,0.07)] rounded-3xl p-6 shadow-lg relative overflow-hidden ${glow ? `shadow-[0_0_32px_${glow}]` : ''} ${className}`}
      style={{ padding, ...style }}
    >
      {children}
    </div>
  );
}

export function SectionHeader({ icon: Icon, title, subtitle, color = 'var(--accent)' }) {
  return (
    <div className="flex items-center gap-3.5 mb-6">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center"
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
}

export function StatCard({ icon: Icon, label, value, sub, color = 'var(--accent)', glow, className = '' }) {
  return (
    <div
      className={`bg-[var(--bg-card)] border border-[rgba(255,255,255,0.08)] rounded-3xl p-6 flex flex-col gap-3 relative overflow-hidden shadow-xl ${glow ? `shadow-[0_0_40px_${glow}]` : ''} ${className}`}
    >
      <div
        className="w-10.5 h-10.5 rounded-xl flex items-center justify-center"
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
        <p className="text-[#f8fafc] text-2xl font-black leading-tight mt-1 [-letter-spacing:-0.02em]">
          {value}
        </p>
        {sub && (
          <p className="text-[#475569] text-xs font-medium mt-1.5">{sub}</p>
        )}
      </div>
    </div>
  );
}

export function Badge({ children, color = '#6366f1' }) {
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
}
