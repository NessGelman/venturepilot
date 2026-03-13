import React, { useState } from "react";
import { Zap, Play, Info, TrendingUp, TrendingDown, RefreshCcw } from "lucide-react";
import { useApp } from "../context/AppContext";
import { Card, SectionHeader } from "../components/Shared";

export default function Strategy() {
  const { capital, setCapital, burn, setBurn, revenue, setRevenue, growth, setGrowth } = useApp();
  const [scenario, setScenario] = useState("Status Quo");

  const scenarios = {
    "Status Quo": { b: burn, g: growth },
    "Aggressive Growth": { b: burn * 1.5, g: growth * 2 },
    "Lean Mode": { b: burn * 0.7, g: growth * 0.8 },
  };

  const applyScenario = (name) => {
    setScenario(name);
    setBurn(Math.round(scenarios[name].b));
    setGrowth(Math.round(scenarios[name].g));
  };

  const InputField = ({ label, value, onChange, prefix, suffix, type = "number" }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <label style={{ color: "#64748b", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>
      <div style={{ position: "relative" }}>
        {prefix && <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#475569", fontWeight: 700 }}>{prefix}</span>}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(type === "number" ? Number(e.target.value) : e.target.value)}
          style={{
            width: "100%", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12, padding: `14px 16px 14px ${prefix ? "32px" : "16px"}`, color: "#f0f4ff",
            fontSize: 15, fontWeight: 600, outline: "none", transition: "all 0.2s"
          }}
          onFocus={(e) => e.target.style.borderColor = "#6366f1"}
          onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
        />
        {suffix && <span style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", color: "#475569", fontWeight: 700 }}>{suffix}</span>}
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <header>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "#f0f4ff" }}>
          Capital <span style={{ background: "linear-gradient(90deg,#6366f1,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Modeling</span>
        </h1>
        <p style={{ color: "#8798b0", marginTop: 6, fontSize: 15 }}>Simulate growth trajectories and capital requirements.</p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <Card>
            <SectionHeader icon={Zap} title="Core Drivers" subtitle="Adjust fundamental metrics" />
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <InputField label="Capital Raised" value={capital} onChange={setCapital} prefix="$" />
              <InputField label="Gross Burn" value={burn} onChange={setBurn} prefix="$" />
              <InputField label="Monthly Revenue" value={revenue} onChange={setRevenue} prefix="$" />
              <InputField label="MoM Growth" value={growth} onChange={setGrowth} suffix="%" />
            </div>
          </Card>

          <Card>
            <SectionHeader icon={Play} title="Scenarios" subtitle="Quick strategic shifts" color="#10b981" />
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {Object.keys(scenarios).map(s => (
                <button
                  key={s}
                  onClick={() => applyScenario(s)}
                  style={{
                    padding: "16px", borderRadius: 12, textAlign: "left", cursor: "pointer",
                    background: scenario === s ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.03)",
                    border: scenario === s ? "1px solid rgba(16,185,129,0.3)" : "1px solid rgba(255,255,255,0.06)",
                    color: scenario === s ? "#10b981" : "#8798b0",
                    transition: "all 0.2s"
                  }}
                >
                  <p style={{ fontWeight: 700, fontSize: 13, textTransform: "uppercase" }}>{s}</p>
                </button>
              ))}
            </div>
          </Card>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <Card style={{ flex: 1 }}>
            <SectionHeader icon={RefreshCcw} title="Strategic Evaluation" subtitle="Impact of your current model" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {[
                { title: "Sustainability", impact: revenue > burn ? "H" : "M", color: revenue > burn ? "#10b981" : "#f59e0b", icon: TrendingUp },
                { title: "Growth Capability", impact: growth > 10 ? "H" : "M", color: growth > 10 ? "#10b981" : "#f59e0b", icon: Zap },
                { title: "Dilution Risk", impact: capital < 100000 ? "L" : "H", color: capital < 100000 ? "#10b981" : "#ef4444", icon: TrendingDown },
                { title: "Scale Efficiency", impact: "M", color: "#f59e0b", icon: Info },
              ].map((item, i) => (
                <div key={i} style={{ padding: 20, borderRadius: 16, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#8798b0", fontSize: 13, fontWeight: 600 }}>{item.title}</span>
                    <item.icon size={16} color={item.color} />
                  </div>
                  <div style={{ marginTop: 12, display: "flex", alignItems: "baseline", gap: 6 }}>
                    <span style={{ fontSize: 24, fontWeight: 800, color: "#f0f4ff" }}>{item.impact}</span>
                    <span style={{ fontSize: 12, color: item.color, fontWeight: 700 }}>{item.impact === "H" ? "OPTIMAL" : item.impact === "M" ? "MODERATE" : "CRITICAL"}</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 32, padding: 24, borderRadius: 16, background: "rgba(99,102,241,0.05)", border: "1px dashed rgba(99,102,241,0.2)" }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#6366f1", marginBottom: 12 }}>Strategic Conclusion</h3>
              <p style={{ color: "#8798b0", fontSize: 14, lineHeight: 1.6 }}>
                By switching to the <strong>{scenario}</strong> strategy, you are prioritizing {scenario === "Aggressive Growth" ? "market capture" : scenario === "Lean Mode" ? "efficiency" : "balanced progress"}.
                Given your current metrics, this path {scenario === "Aggressive Growth" && growth < 15 ? "may be risky as growth isn't fast enough to justify the burn increase" : "aligns with standard VC expectations for your stage"}.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
