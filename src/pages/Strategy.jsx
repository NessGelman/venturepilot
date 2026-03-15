import React, { useMemo, useRef, useState } from "react";
import { Zap, Play, TrendingUp, TrendingDown, RefreshCcw, Activity, ShieldAlert, Rocket, Gauge, ClipboardList, CheckCircle2 } from "lucide-react";
import { useApp } from "../context/AppContext";
import { Card, SectionHeader } from "../components/Shared";

export default function Strategy() {
  const { capital, burn, revenue, growth, payback, runwayMonths, ltv, cac, problem, stage, northStar, setBurn, setGrowth } = useApp();
  const [scenario, setScenario] = useState("Status Quo");
  const [checklist, setChecklist] = useState([
    { label: "Cut non-core spend by 8%",     done: false },
    { label: "Spin up outbound SDR pilot",   done: false },
    { label: "Ship self-serve onboarding",   done: true  },
    { label: "Book 5 investor updates",      done: false },
  ]);
  const [burnShift, setBurnShift] = useState(0);
  const [growthShift, setGrowthShift] = useState(0);

  // FIX: useRef captures initial values once on mount — avoids stale useMemo closure
  const baselineRef = useRef({ burn, growth });
  const baseline = baselineRef.current;

  const scenarios = {
    "Status Quo":       { b: burn,          g: growth },
    "Aggressive Growth": { b: burn * 1.5,   g: growth * 2 },
    "Lean Mode":        { b: burn * 0.7,    g: growth * 0.8 },
    "Return to Baseline": { b: baseline.burn, g: baseline.growth },
  };

  const runwayFor = (b) => Math.max(1, Math.round(capital / Math.max(b - revenue, 1)));
  const recommended = runwayMonths < 6 && growth < 8 ? "Lean Mode" : growth >= 12 && runwayMonths > 10 ? "Aggressive Growth" : "Status Quo";

  const applyScenario = (name) => {
    setScenario(name);
    setBurn(Math.round(scenarios[name].b));
    setGrowth(Math.round(scenarios[name].g));
  };

  const applyTweaks = () => {
    setBurn(Math.max(0, Math.round(burn * (1 + burnShift / 100))));
    setGrowth(Math.max(0, Math.round(growth * (1 + growthShift / 100))));
  };

  const impacts = [
    { title: "Sustainability",    impact: revenue > burn ? "H" : "M", color: revenue > burn ? "#10b981" : "#f59e0b", icon: TrendingUp },
    { title: "Growth Capability", impact: growth > 10   ? "H" : "M", color: growth > 10   ? "#10b981" : "#f59e0b", icon: Zap },
    { title: "Dilution Risk",     impact: capital < 100000 ? "L" : "H", color: capital < 100000 ? "#10b981" : "#ef4444", icon: TrendingDown },
    { title: "Scale Efficiency",  impact: "M",                         color: "#f59e0b",                              icon: Rocket },
  ];
  const impactLabel = { H: "OPTIMAL", M: "MODERATE", L: "CRITICAL" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <header>
        <h1 style={{ fontSize: 30, fontWeight: 800, color: "#f0f4ff" }}>
          Strategic <span style={{ background: "linear-gradient(90deg,#6366f1,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Evaluation</span>
        </h1>
        <p style={{ color: "#8798b0", marginTop: 6, fontSize: 15 }}>Model your future based on the metrics in your sidebar.</p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Card>
            <SectionHeader icon={Play} title="Scenario Shortcuts" subtitle="Shift global metrics instantly" color="#10b981" />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {Object.keys(scenarios).map(s => (
                <button key={s} onClick={() => applyScenario(s)} style={{
                  padding: "14px", borderRadius: 12, textAlign: "left", cursor: "pointer",
                  background: scenario === s ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.03)",
                  border: scenario === s ? "1px solid rgba(16,185,129,0.3)" : "1px solid rgba(255,255,255,0.06)",
                  color: scenario === s ? "#10b981" : "#8798b0", transition: "all 0.15s"
                }}>
                  <p style={{ fontWeight: 700, fontSize: 13, textTransform: "uppercase" }}>{s}</p>
                  <p style={{ fontSize: 12, marginTop: 4, opacity: 0.7 }}>Burn ${Math.round(scenarios[s].b).toLocaleString()} · Growth {Math.round(scenarios[s].g)}%</p>
                </button>
              ))}
            </div>
          </Card>

          <Card style={{ background: "linear-gradient(135deg,rgba(239,68,68,0.05) 0%,transparent 100%)" }}>
            <SectionHeader icon={ShieldAlert} title="Risk Profile" subtitle="Potential bottlenecks" color="#ef4444" />
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[["Burn Variance", "+12.4%", "#ef4444"],["Churn Sensitivity", "MEDIUM", "#f59e0b"]].map(([k,v,c],i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", color: "#8798b0", fontSize: 13 }}>
                  <span>{k}</span><span style={{ color: c, fontWeight: 700 }}>{v}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <SectionHeader icon={ClipboardList} title="Execution Checklist" subtitle="What needs to happen next" color="#38bdf8" />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {checklist.map((item, idx) => (
                <button key={idx} onClick={() => setChecklist(checklist.map((c, i) => i === idx ? { ...c, done: !c.done } : c))}
                  style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "12px 14px", borderRadius: 12, cursor: "pointer", textAlign: "left",
                    background: item.done ? "rgba(16,185,129,0.08)" : "rgba(255,255,255,0.03)",
                    border: item.done ? "1px solid rgba(16,185,129,0.25)" : "1px solid rgba(255,255,255,0.06)",
                    color: item.done ? "#10b981" : "#8798b0", fontWeight: 600
                  }}>
                  {item.label}
                  {item.done && <CheckCircle2 size={15} color="#10b981" />}
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <SectionHeader icon={Gauge} title="Fine-Tune Levers" subtitle="Nudge burn & growth" color="#818cf8" />
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <label style={{ color: "#8798b0", fontSize: 13, fontWeight: 700 }}>Burn adjustment ({burnShift > 0 ? "+" : ""}{burnShift}%)</label>
              <input type="range" min={-30} max={30} step={1} value={burnShift} onChange={e => setBurnShift(Number(e.target.value))} style={{ width: "100%", accentColor: "#6366f1" }} />
              <label style={{ color: "#8798b0", fontSize: 13, fontWeight: 700 }}>Growth adjustment ({growthShift > 0 ? "+" : ""}{growthShift}%)</label>
              <input type="range" min={-50} max={100} step={1} value={growthShift} onChange={e => setGrowthShift(Number(e.target.value))} style={{ width: "100%", accentColor: "#6366f1" }} />
              <button onClick={applyTweaks} style={{ marginTop: 4, padding: "10px 12px", borderRadius: 10, background: "#6366f1", border: "none", color: "#fff", fontWeight: 800, cursor: "pointer" }}>
                Apply tweaks
              </button>
            </div>
          </Card>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Card style={{ flex: 1 }}>
            <SectionHeader icon={Activity} title="Impact Analysis" subtitle="Downstream effect of selected scenario" />
            <div style={{ marginBottom: 16, padding: 12, borderRadius: 10, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ color: "#10b981", fontWeight: 700, fontSize: 13 }}>Recommended: {recommended}</span>
              <button onClick={() => applyScenario(recommended)} style={{ padding: "8px 12px", borderRadius: 9, background: "#10b981", border: "none", color: "#0b1120", fontWeight: 800, cursor: "pointer", fontSize: 12 }}>
                Apply
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {impacts.map((item, i) => (
                <div key={i} style={{ padding: 18, borderRadius: 14, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#8798b0", fontSize: 13, fontWeight: 600 }}>{item.title}</span>
                    <item.icon size={15} color={item.color} />
                  </div>
                  <div style={{ marginTop: 10, display: "flex", alignItems: "baseline", gap: 6 }}>
                    <span style={{ fontSize: 24, fontWeight: 800, color: "#f0f4ff" }}>{item.impact}</span>
                    <span style={{ fontSize: 11, color: item.color, fontWeight: 700 }}>{impactLabel[item.impact]}</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 28, padding: 22, borderRadius: 14, background: "rgba(99,102,241,0.05)", border: "1px dashed rgba(99,102,241,0.2)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <RefreshCcw size={16} color="#6366f1" />
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "#6366f1" }}>Strategic Conclusion</h3>
              </div>
              <p style={{ color: "#8798b0", fontSize: 14, lineHeight: 1.65 }}>
                Switching to <strong>{scenario}</strong> prioritizes {scenario === "Aggressive Growth" ? "market capture" : scenario === "Lean Mode" ? "burn efficiency" : "balanced progress"}.
                {" "}This path {scenario === "Aggressive Growth" && growth < 15 ? "may be risky — growth isn't fast enough to justify the burn increase." : "aligns with VC expectations for your stage."}
                {" "}Keep the north star ("{northStar || "set your goal in sidebar"}") front of mind: solve "<em>{problem || "your core pain"}</em>" at every decision.
              </p>
            </div>
          </Card>

          <Card style={{ background: "rgba(99,102,241,0.04)", border: "1px dashed rgba(99,102,241,0.2)" }}>
            <SectionHeader icon={Gauge} title="Scenario Outcomes" subtitle="Real-time modeling before you commit" color="#6366f1" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
              {Object.entries(scenarios).map(([name, vals]) => (
                <div key={name} style={{ padding: 14, borderRadius: 12, background: name === scenario ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <p style={{ color: "#c7d2f0", fontWeight: 700, fontSize: 13 }}>{name}</p>
                  <p style={{ color: "#8798b0", fontSize: 12, marginTop: 4 }}>Burn: ${Math.round(vals.b).toLocaleString()} · Growth: {Math.round(vals.g)}%</p>
                  <p style={{ color: "#f0f4ff", fontSize: 15, fontWeight: 700, marginTop: 6 }}>Runway: {runwayFor(vals.b)} mo</p>
                  <p style={{ color: "#475569", fontSize: 12 }}>LTV/CAC: {(ltv / cac).toFixed(1)}×</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
