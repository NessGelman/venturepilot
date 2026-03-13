import React, { useMemo, useState } from "react";
import { FileText, Sparkles, Send, Download, BookOpen, Target, BarChart, Users, Shield, CheckCircle2, Plus } from "lucide-react";
import { useApp } from "../context/AppContext";
import { Card, SectionHeader } from "../components/Shared";

export default function BusinessPlan() {
  const { capital, burn, revenue, growth, idea, industry, problem } = useApp();
  const [generating, setGenerating] = useState(false);
  const [status, setStatus] = useState("");
  const [milestones, setMilestones] = useState([
    { label: "Hit $50k MRR", done: false },
    { label: "Close 3 design partners", done: true },
    { label: "Ship investor dashboard", done: false },
  ]);
  const [newMilestone, setNewMilestone] = useState("");

  const planSections = useMemo(() => [
    {
      title: "Executive Summary",
      icon: BookOpen,
      content: `VenturePilot is an AI-powered financial operating system serving the ${industry || "venture-backed"} space. We solve: ${problem || "fragmented capital planning for founders"}. With an initial capital base of $${capital.toLocaleString()} and monthly revenue of $${revenue.toLocaleString()}, the company is scaling at ${growth}% MoM. Our vision is: ${idea || "To revolutionize startup financing strategy through real-time data intelligence."}`
    },
    {
      title: "Market Analysis",
      icon: BarChart,
      content: "The global startup financing market is worth over $400B annually. Current tools are manual (spreadsheets) or fragmented (various SaaS). VenturePilot consolidates this into a single 'Venture OS', targeting the 50,000+ new VC-backed startups launched each year."
    },
    {
      title: "Operational Strategy",
      icon: Target,
      content: `Currently operating at a $${burn.toLocaleString()} monthly gross burn, focusing on high-efficiency user acquisition and product-led growth. Our roadmap includes automated investor matching and real-time runway simulation as core retention drivers. North star: ${northStar || "set in sidebar"}.`
    },
    {
      title: "Financial Projections",
      icon: Users,
      content: `Given the ${growth}% MoM growth rate, projected ARR for the next 12 months is expected to scale exponentially. We maintain a focus on capital efficiency, targeting a Readiness Score of 90+ for subsequent funding rounds.`
    }
  ], [capital, revenue, growth, idea, burn]);

  const exportPlan = () => {
    const body = planSections
      .map((section, i) => `# ${section.title}\nPhase ${i + 1}: ${section.content}\n`)
      .join("\n");
    const blob = new Blob([body], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "venturepilot-business-plan.md";
    link.click();
    URL.revokeObjectURL(url);
    setStatus("Business plan exported as Markdown");
  };

  const addMilestone = () => {
    if (!newMilestone.trim()) return;
    setMilestones([{ label: newMilestone, done: false }, ...milestones]);
    setNewMilestone("");
  };

  const toggleMilestone = (idx) => {
    setMilestones(milestones.map((m, i) => i === idx ? { ...m, done: !m.done } : m));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "#f0f4ff" }}>
            Business <span style={{ background: "linear-gradient(90deg,#6366f1,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Plan</span>
          </h1>
          <p style={{ color: "#8798b0", marginTop: 6, fontSize: 15 }}>Comprehensive strategic roadmap for your venture.</p>
        </div>
        <button 
          onClick={() => { setGenerating(true); setTimeout(() => setGenerating(false), 2000); }}
          style={{
            padding: "12px 24px", borderRadius: 12, background: "rgba(99,102,241,0.1)",
            border: "1px solid rgba(99,102,241,0.3)", color: "#6366f1", fontWeight: 700, fontSize: 14, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s"
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(99,102,241,0.15)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(99,102,241,0.1)"}
        >
          <Sparkles size={16} />
          {generating ? "Generating..." : "Regenerate Plan"}
        </button>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {planSections.map((section, i) => (
          <Card key={i} style={{ height: "100%" }}>
            <SectionHeader icon={section.icon} title={section.title} subtitle={`Phase ${i + 1} focus`} />
            <div style={{ padding: "20px", borderRadius: 16, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", height: "calc(100% - 60px)" }}>
              <p style={{ color: "#8798b0", fontSize: 14, lineHeight: 1.8 }}>
                {section.content}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <Card style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.05) 0%, transparent 100%)" }}>
        <SectionHeader icon={Shield} title="Risk Management & Compliance" subtitle="Ensuring long-term sustainability" color="#10b981" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32, marginTop: 10 }}>
          {[
            { t: "Capital Preservation", d: "Strict treasury management to extend runway beyond 18 months." },
            { t: "Market Resilience", d: "Diversified revenue streams to mitigate sector-specific downturns." },
            { t: "Operational Audit", d: "Quarterly reviews of unit economics and burn efficiency." }
          ].map((item, i) => (
            <div key={i}>
              <h4 style={{ color: "#f0f4ff", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{item.t}</h4>
              <p style={{ color: "#64748b", fontSize: 12, lineHeight: 1.6 }}>{item.d}</p>
            </div>
          ))}
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 24 }}>
        <Card>
          <SectionHeader icon={FileText} title="Milestone Board" subtitle="Track execution toward the plan" />
          <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
            <input
              value={newMilestone}
              onChange={(e) => setNewMilestone(e.target.value)}
              placeholder="Add a milestone..."
              style={{ flex: 1, background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 12px", color: "#f0f4ff", fontWeight: 600 }}
            />
            <button
              onClick={addMilestone}
              style={{ padding: "10px 14px", borderRadius: 10, background: "#6366f1", border: "none", color: "#fff", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
            >
              <Plus size={14} /> Add
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {milestones.map((m, idx) => (
              <button
                key={idx}
                onClick={() => toggleMilestone(idx)}
                style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "12px 14px", borderRadius: 12,
                  background: m.done ? "rgba(16,185,129,0.08)" : "rgba(255,255,255,0.03)",
                  border: m.done ? "1px solid rgba(16,185,129,0.25)" : "1px solid rgba(255,255,255,0.05)",
                  color: m.done ? "#10b981" : "#8798b0", fontWeight: 700, textAlign: "left", cursor: "pointer"
                }}
              >
                {m.label}
                {m.done && <CheckCircle2 size={16} color="#10b981" />}
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <SectionHeader icon={Shield} title="Risk Register" subtitle="Mitigations you own" color="#10b981" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
            {[
              { t: "Capital Preservation", d: "Strict treasury management to extend runway beyond 18 months." },
              { t: "Market Resilience", d: "Diversified revenue streams to mitigate sector-specific downturns." },
              { t: "Operational Audit", d: "Quarterly reviews of unit economics and burn efficiency." }
            ].map((item, i) => (
              <div key={i} style={{ padding: 14, borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <h4 style={{ color: "#f0f4ff", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>{item.t}</h4>
                <p style={{ color: "#64748b", fontSize: 12, lineHeight: 1.6 }}>{item.d}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, paddingBottom: 20 }}>
        <button
          onClick={exportPlan}
          style={{
            padding: "16px 40px", borderRadius: 14, background: "#6366f1",
            border: "none", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 10, boxShadow: "0 8px 32px rgba(99,102,241,0.4)"
          }}
        >
          <Download size={18} /> Export Full Business Plan (MD)
        </button>
        {status && <p style={{ color: "#10b981", fontSize: 12, fontWeight: 700 }}>{status}</p>}
      </div>
    </div>
  );
}
