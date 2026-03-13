import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { X, ChevronRight, ChevronLeft, Settings2, DollarSign, TrendingUp, Zap, Info, Users, Activity } from "lucide-react";

// Move InputField OUTSIDE the main component to prevent focus loss on re-render
const InputField = ({ label, value, onChange, prefix, suffix, multiline }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
    <label style={{ color: "#64748b", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>
    <div style={{ position: "relative" }}>
      {prefix && <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#475569", fontSize: 13 }}>{prefix}</span>}
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          style={{
            width: "100%", background: "#080c14", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8, padding: "10px 12px", color: "#f0f4ff",
            fontSize: 13, fontWeight: 500, outline: "none", transition: "border-color 0.2s",
            resize: "none", lineHeight: 1.5
          }}
          onFocus={(e) => e.target.style.borderColor = "#6366f1"}
          onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
        />
      ) : (
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{
            width: "100%", background: "#080c14", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8, padding: `10px 12px 10px ${prefix ? "28px" : "12px"}`, color: "#f0f4ff",
            fontSize: 14, fontWeight: 600, outline: "none", transition: "border-color 0.2s"
          }}
          onFocus={(e) => e.target.style.borderColor = "#6366f1"}
          onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
        />
      )}
      {suffix && <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#475569", fontSize: 13 }}>{suffix}</span>}
    </div>
  </div>
);

export default function InputSidebar({ isOpen, setIsOpen }) {
  const {
    capital, setCapital,
    burn, setBurn,
    revenue, setRevenue,
    growth, setGrowth,
    headcount, setHeadcount,
    cac, setCac,
    arpu, setArpu,
    churn, setChurn,
    pipeline, setPipeline,
    idea, setIdea
  } = useApp();

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed", left: isOpen ? 280 : 0, top: "50%", transform: "translateY(-50%)",
          width: 24, height: 48, background: "#6366f1", border: "none",
          borderRadius: "0 8px 8px 0", cursor: "pointer", zIndex: 200,
          display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
          transition: "left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: "4px 0 12px rgba(99,102,241,0.2)"
        }}
      >
        {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

      <div style={{
        position: "fixed", left: 0, top: 0, bottom: 0, width: 280,
        background: "#0d1420", borderRight: "1px solid rgba(255,255,255,0.08)",
        zIndex: 199, transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: isOpen ? "translateX(0)" : "translateX(-100%)",
        padding: "80px 24px 24px",
        display: "flex", flexDirection: "column"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
          <Settings2 size={18} color="#6366f1" />
          <h3 style={{ fontSize: 14, fontWeight: 800, color: "#f0f4ff", textTransform: "uppercase", letterSpacing: "0.05em" }}>Venture Metrics</h3>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          <InputField label="Capital Raised" value={capital} onChange={setCapital} prefix="$" />
          <InputField label="Monthly Gross Burn" value={burn} onChange={setBurn} prefix="$" />
          <InputField label="Monthly Revenue (MRR)" value={revenue} onChange={setRevenue} prefix="$" />
          <InputField label="MoM Growth Rate" value={growth} onChange={setGrowth} suffix="%" />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <InputField label="Headcount" value={headcount} onChange={setHeadcount} />
            <InputField label="CAC" value={cac} onChange={setCac} prefix="$" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <InputField label="ARPU" value={arpu} onChange={setArpu} prefix="$" />
            <InputField label="Monthly Churn" value={churn} onChange={setChurn} suffix="%" />
          </div>

          <InputField label="Active Pipeline (12m)" value={pipeline} onChange={setPipeline} prefix="$" />
          <InputField label="Company Vision" value={idea} onChange={setIdea} multiline />
          
          <div style={{ padding: 16, borderRadius: 12, background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.1)", marginTop: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <Zap size={14} color="#6366f1" />
              <span style={{ fontSize: 12, fontWeight: 700, color: "#f0f4ff" }}>Quick Tip</span>
            </div>
            <p style={{ fontSize: 11, color: "#8798b0", lineHeight: 1.5 }}>
              Updating these values recalculates runway, efficiency, and readiness across all modules.
            </p>
          </div>
        </div>

        <div style={{ paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#475569" }}>
            <span style={{ fontSize: 11, fontWeight: 600 }}>AUTO-SAVE ENABLED</span>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981" }} />
          </div>
        </div>
      </div>
    </>
  );
}
