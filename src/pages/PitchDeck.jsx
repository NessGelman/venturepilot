import React, { useState } from "react";
import { Zap, Layout, ListChecks, MessageSquare, Sparkles, Send } from "lucide-react";
import { useApp } from "../context/AppContext";
import { Card, SectionHeader } from "../components/Shared";

export default function PitchDeck() {
  const { idea } = useApp();
  const [generating, setGenerating] = useState(false);

  const slides = [
    { title: "The Problem", content: "Current solutions are fragmented, manual, and lack real-time intelligence for high-growth founders." },
    { title: "The Solution", content: idea || "Enter VenturePilot: The integrated OS for startup financing and strategic growth." },
    { title: "Market Traction", content: "15% MoM growth with $500k ARR target reached within 6 months of private beta." },
    { title: "Business Model", content: "Tiered SaaS model with auxiliary fees for advanced investor matching and model auditing." },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <header>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "#f0f4ff" }}>
          Pitch <span style={{ background: "linear-gradient(90deg,#6366f1,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Generator</span>
        </h1>
        <p style={{ color: "#8798b0", marginTop: 6, fontSize: 15 }}>Refine your narrative based on your global vision and metrics.</p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <Card>
          <SectionHeader icon={Sparkles} title="AI Narrative" subtitle="Generated from your current metrics and vision" color="#a855f7" />
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ padding: 20, borderRadius: 16, background: "rgba(168,85,247,0.05)", border: "1px dashed rgba(168,85,247,0.2)" }}>
              <p style={{ color: "#c7d2f0", fontSize: 14, lineHeight: 1.8, fontStyle: "italic" }}>
                "{idea || "Define your vision in the sidebar to generate a custom narrative..."}"
              </p>
            </div>
            <button 
              onClick={() => { setGenerating(true); setTimeout(() => setGenerating(false), 2000); }}
              style={{
                width: "100%", padding: "14px", borderRadius: 12, background: "linear-gradient(90deg,#6366f1,#a855f7)",
                border: "none", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8
              }}
            >
              {generating ? "Refining Narrative..." : <><Send size={16} /> Update Pitch</>}
            </button>
          </div>
        </Card>

        <Card>
          <SectionHeader icon={Layout} title="Slide Architecture" subtitle="Recommended deck structure" />
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {slides.map((slide, i) => (
              <div key={i} style={{ padding: 16, borderRadius: 12, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(99,102,241,0.15)", color: "#6366f1", fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{i+1}</div>
                  <h4 style={{ color: "#f0f4ff", fontSize: 13, fontWeight: 700 }}>{slide.title}</h4>
                </div>
                <p style={{ color: "#8798b0", fontSize: 12, lineHeight: 1.5 }}>{slide.content}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card style={{ background: "rgba(255,255,255,0.02)" }}>
        <SectionHeader icon={ListChecks} title="Investor Checklist" subtitle="What they are looking for right now" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginTop: 10 }}>
          {[
            { t: "Burn Transparency", d: "Clear explanation of monthly net burn and runway." },
            { t: "Growth Quality", d: "MoM growth driven by organic or efficient CAC." },
            { t: "Vision Clarity", d: "A clear 'North Star' that guides the product roadmap." },
          ].map((item, i) => (
            <div key={i}>
              <h5 style={{ color: "#f0f4ff", fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{item.t}</h5>
              <p style={{ color: "#475569", fontSize: 12, lineHeight: 1.4 }}>{item.d}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
