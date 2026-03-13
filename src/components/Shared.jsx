import React from "react";

export function Card({ children, style = {}, padding = 24, glow }) {
  return (
    <div style={{
      background: "#111927",
      border: "1px solid rgba(255, 255, 255, 0.07)",
      borderRadius: 20,
      padding,
      boxShadow: glow ? `0 0 32px ${glow}` : "0 8px 32px rgba(0,0,0,0.4)",
      position: "relative",
      overflow: "hidden",
      ...style
    }}>
      {children}
    </div>
  );
}

export function SectionHeader({ icon: Icon, title, subtitle, color = "#6366f1" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: `${color}15`, border: `1px solid ${color}30`,
        display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        <Icon size={18} color={color} />
      </div>
      <div>
        <h2 style={{ color: "#f0f4ff", fontSize: 20, fontWeight: 700, letterSpacing: "-0.01em" }}>{title}</h2>
        {subtitle && <p style={{ color: "#8798b0", fontSize: 13, marginTop: 1 }}>{subtitle}</p>}
      </div>
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, sub, color = "#6366f1", glow }) {
  return (
    <div style={{
      background: "#111927",
      border: "1px solid rgba(255, 255, 255, 0.08)",
      borderRadius: 20,
      padding: 24,
      display: "flex",
      flexDirection: "column",
      gap: 12,
      position: "relative",
      overflow: "hidden",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      boxShadow: glow ? `0 0 40px ${glow}` : "0 8px 32px rgba(0,0,0,0.4)",
      cursor: "default",
    }}>
      <div style={{
        width: 42, height: 42, borderRadius: 12,
        background: color + "15", border: `1px solid ${color}30`,
        display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        <Icon size={20} color={color} />
      </div>
      <div>
        <p style={{ color: "#64748b", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</p>
        <p style={{ color: "#f8fafc", fontSize: 28, fontWeight: 800, lineHeight: 1.1, marginTop: 4, letterSpacing: "-0.02em" }}>{value}</p>
        {sub && <p style={{ color: "#475569", fontSize: 12, marginTop: 6, fontWeight: 500 }}>{sub}</p>}
      </div>
    </div>
  );
}
