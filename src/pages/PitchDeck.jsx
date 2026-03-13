import React, { useState } from "react";
import { Zap, Copy, Check, FileText, Layout, Presentation, Lightbulb } from "lucide-react";
import { useApp } from "../context/AppContext";
import { Card, SectionHeader } from "../components/Shared";

export default function PitchDeck() {
  const { idea, setIdea, revenue, growth, runwayMonths } = useApp();
  const [copied, setCopied] = useState(false);

  const pitch = `🚀 ${idea}

PROBLEM
Founders waste months navigating fragmented funding options without expert guidance.

SOLUTION
VenturePilot uses AI to recommend the optimal capital strategy for each startup's stage, metrics, and goals.

TRACTION
Monthly Revenue: $${revenue.toLocaleString()} · Growth: ${growth}%/mo · Runway: ${runwayMonths} months

BUSINESS MODEL
SaaS subscription for founders + white-label API for accelerators and VCs.`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(pitch);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const slides = [
    { title: "The Problem", description: "Founders struggle with complex funding landscapes.", icon: Lightbulb },
    { title: "Our Solution", description: "AI-driven capital strategy modeling.", icon: Zap },
    { title: "Market Size", description: "25M+ startups globally seeking funding.", icon: Layout },
    { title: "The Team", description: "Domain experts in fintech and AI.", icon: Presentation },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <header>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "#f0f4ff" }}>
          Pitch <span style={{ background: "linear-gradient(90deg,#6366f1,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Generator</span>
        </h1>
        <p style={{ color: "#8798b0", marginTop: 6, fontSize: 15 }}>Craft narratives that win over investors.</p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <Card>
            <SectionHeader icon={FileText} title="Narrative Generator" subtitle="AI-powered investor script" />
            <div style={{ marginBottom: 20 }}>
              <label style={{ color: "#64748b", fontSize: 11, fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Your Vision</label>
              <textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                style={{
                  width: "100%", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 12, padding: "16px", color: "#f0f4ff", fontSize: 15, fontWeight: 500,
                  minHeight: 100, outline: "none", resize: "none"
                }}
              />
            </div>
            <div style={{ background: "#0a1220", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 24, position: "relative" }}>
              <button
                onClick={copyToClipboard}
                style={{
                  position: "absolute", top: 16, right: 16, border: "none", cursor: "pointer",
                  background: copied ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.05)",
                  color: copied ? "#10b981" : "#8798b0", padding: "8px 12px", borderRadius: 8,
                  fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 6
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copied" : "Copy"}
              </button>
              <pre style={{ color: "#8798b0", fontSize: 14, lineHeight: 1.8, whiteSpace: "pre-wrap", fontFamily: "inherit" }}>
                {pitch}
              </pre>
            </div>
          </Card>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <Card>
            <SectionHeader icon={Presentation} title="Deck Skeleton" subtitle="Recommended slide order" color="#f59e0b" />
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {slides.map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, background: "rgba(245,158,11,0.1)",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                  }}>
                    <s.icon size={16} color="#f59e0b" />
                  </div>
                  <div>
                    <h4 style={{ color: "#f0f4ff", fontSize: 14, fontWeight: 700 }}>{i + 1}. {s.title}</h4>
                    <p style={{ color: "#64748b", fontSize: 12 }}>{s.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <button style={{
              marginTop: 24, width: "100%", padding: "12px", borderRadius: 12,
              background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)",
              color: "#f59e0b", fontSize: 13, fontWeight: 700, cursor: "pointer"
            }}>Download PDF Template</button>
          </Card>
        </div>
      </div>
    </div>
  );
}
