import React, { useMemo, useState } from "react";
import { FileText, Sparkles, Download, BookOpen, Target, BarChart, Users, Shield, CheckCircle2, Plus } from "lucide-react";
import { useApp } from "../context/AppContext";
import { Card, SectionHeader } from "../components/Shared";

export default function BusinessPlan() {
  const { capital, burn, revenue, growth, idea, industry, problem, northStar } = useApp();
  const [generating, setGenerating] = useState(false);
  const [status, setStatus] = useState("");
  const [milestones, setMilestones] = useState([
    { label: "Hit $50k MRR",                done: false },
    { label: "Close 3 design partners",     done: true  },
    { label: "Ship investor dashboard",     done: false },
  ]);
  const [newMilestone, setNewMilestone] = useState("");

  const planSections = useMemo(() => [
    {
      title: "Executive Summary", icon: BookOpen,
      content: `VenturePilot is an AI-powered financial OS for the ${industry || "venture-backed"} space. We solve: ${problem || "fragmented capital planning"}. With $${capital.toLocaleString()} in capital and $${revenue.toLocaleString()} MRR, scaling at ${growth}% MoM. Vision: ${idea || "revolutionize startup financing."}`
    },
    {
      title: "Market Analysis", icon: BarChart,
      content: "The global startup financing market exceeds $400B annually. Current tools are manual or fragmented. VenturePilot consolidates this into a single Venture OS, targeting the 50k+ new VC-backed startups launched each year."
    },
    {
      title: "Operational Strategy", icon: Target,
      content: `Operating at $${burn.toLocaleString()} monthly gross burn, focused on high-efficiency user acquisition and product-led growth. North star: ${northStar || "set in sidebar"}. Roadmap includes automated investor matching and real-time runway simulation.`
    },
    {
      title: "Financial Projections", icon: Users,
      content: `Given the ${growth}% MoM growth rate, ARR is projected to scale exponentially over 12 months. We target a Readiness Score of 90+ before subsequent fundraising rounds.`
    }
  ], [capital, revenue, growth, idea, burn, industry, problem, northStar]);

  const exportPlan = () => {
    const body = planSections.map((s, i) => `# ${s.title}\nPhase ${i + 1}\n\n${s.content}\n`).join("\n---\n\n");
    const blob = new Blob([body], { type: "text/markdown" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: "venturepilot-plan.md" });
    a.click(); URL.revokeObjectURL(a.href);
    setStatus("Business plan exported as Markdown.");
  };

  const addMilestone = () => {
    if (!newMilestone.trim()) return;
    setMilestones(prev => [{ label: newMilestone, done: false }, ...prev]);
    setNewMilestone("");
  };

  const inputSt = { background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 12px", color: "#f0f4ff", fontWeight: 600, outline: "none" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: "#f0f4ff" }}>
            Business <span style={{ background: "linear-gradient(90deg,#6366f1,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Plan</span>
          </h1>
          <p style={{ color: "#8798b0", marginTop: 6, fontSize: 15 }}>Comprehensive strategic roadmap for your venture.</p>
        </div>
        <button onClick={() => { setGenerating(true); setTimeout(() => setGenerating(false), 1800); }}
          style={{ padding: "11px 20px", borderRadius: 12, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.3)", color: "#6366f1", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
          <Sparkles size={15} />{generating ? "Generating…" : "Regenerate Plan"}
        </button>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
        {planSections.map((section, i) => (
          <Card key={i}>
            <SectionHeader icon={section.icon} title={section.title} subtitle={`Phase ${i + 1} focus`} />
            <p style={{ color: "#8798b0", fontSize: 14, lineHeight: 1.75 }}>{section.content}</p>
          </Card>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 22 }}>
        <Card>
          <SectionHeader icon={FileText} title="Milestone Board" subtitle="Track execution toward the plan" />
          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            <input value={newMilestone} onChange={e => setNewMilestone(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addMilestone()}
              placeholder="Add a milestone…" style={{ ...inputSt, flex: 1 }} />
            <button onClick={addMilestone} style={{ padding: "10px 14px", borderRadius: 10, background: "#6366f1", border: "none", color: "#fff", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
              <Plus size={13} /> Add
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {milestones.map((m, idx) => (
              <button key={idx} onClick={() => setMilestones(milestones.map((x, i) => i === idx ? { ...x, done: !x.done } : x))}
                style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "12px 14px", borderRadius: 12, cursor: "pointer",
                  background: m.done ? "rgba(16,185,129,0.08)" : "rgba(255,255,255,0.03)",
                  border: m.done ? "1px solid rgba(16,185,129,0.25)" : "1px solid rgba(255,255,255,0.05)",
                  color: m.done ? "#10b981" : "#8798b0", fontWeight: 700, textAlign: "left"
                }}>
                {m.label}
                {m.done && <CheckCircle2 size={15} color="#10b981" />}
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <SectionHeader icon={Shield} title="Risk Register" subtitle="Mitigations you own" color="#10b981" />
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { t: "Capital Preservation", d: "Strict treasury management to extend runway beyond 18 months." },
              { t: "Market Resilience",    d: "Diversified revenue streams to mitigate sector-specific downturns." },
              { t: "Operational Audit",   d: "Quarterly reviews of unit economics and burn efficiency." },
            ].map((item, i) => (
              <div key={i} style={{ padding: 14, borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <h4 style={{ color: "#f0f4ff", fontSize: 13, fontWeight: 700, marginBottom: 5 }}>{item.t}</h4>
                <p style={{ color: "#64748b", fontSize: 12, lineHeight: 1.6 }}>{item.d}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
        <button onClick={exportPlan} style={{
          padding: "15px 40px", borderRadius: 14, background: "#6366f1", border: "none",
          color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer",
          display: "flex", alignItems: "center", gap: 10, boxShadow: "0 8px 28px rgba(99,102,241,0.4)"
        }}>
          <Download size={17} /> Export Full Business Plan (MD)
        </button>
        {status && <p style={{ color: "#10b981", fontSize: 12, fontWeight: 700 }}>{status}</p>}
      </div>
    </div>
  );
}
