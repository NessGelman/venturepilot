import React, { useState } from "react";
import { Zap, Layout, ListChecks, MessageSquare, Sparkles, Send, ChevronRight, ChevronLeft, Presentation, Download } from "lucide-react";
import { motion } from "framer-motion";
import { useApp } from "../context/AppContext";
import { Card, SectionHeader } from "../components/Shared";

export default function PitchDeck() {
  const { idea, capital, revenue, growth } = useApp();
  const [generating, setGenerating] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    { 
      title: "The Problem", 
      subtitle: "Fragmented Intelligence",
      content: "Founders are flying blind. Existing financial tools are either overly complex spreadsheets or isolated SaaS metrics that don't provide a holistic strategic view." 
    },
    { 
      title: "The Solution", 
      subtitle: "VenturePilot OS",
      content: idea || "An integrated operating system that centralizes all venture data to empower founders with real-time strategic intelligence." 
    },
    { 
      title: "Market Traction", 
      subtitle: "Exponential Growth",
      content: `Currently scaling at ${growth}% MoM. We've reached $${(revenue * 12 / 1000).toFixed(0)}k ARR within 6 months of launch, proving product-market fit.` 
    },
    { 
      title: "Financial Engine", 
      subtitle: "Efficiency at Scale",
      content: `Operating with $${capital.toLocaleString()} in capital and a highly optimized burn rate. Our readiness for the next round is currently ranked in the top 10% of our sector.` 
    },
  ];

  const nextSlide = () => setActiveSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <header>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "#f0f4ff" }}>
          Slide Deck <span style={{ background: "linear-gradient(90deg,#6366f1,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Generator</span>
        </h1>
        <p style={{ color: "#8798b0", marginTop: 6, fontSize: 15 }}>Dynamically generated slides based on your core venture metrics.</p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Slide Preview Engine */}
          <Card style={{ position: "relative", padding: 0, height: 480, overflow: "hidden", display: "flex" }}>
            <div style={{
              flex: 1, 
              background: "linear-gradient(135deg, #0d1420 0%, #080c14 100%)",
              display: "flex", flexDirection: "column", justifyContent: "center", padding: 60,
              position: "relative"
            }}>
              <div style={{ position: "absolute", top: 40, left: 60, display: "flex", alignItems: "center", gap: 10 }}>
                <Presentation size={18} color="#6366f1" />
                <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(99,102,241,0.5)", textTransform: "uppercase" }}>VenturePilot // Pitch v1.2</span>
              </div>

              <motion.div
                key={activeSlide}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <h4 style={{ color: "#6366f1", fontSize: 14, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  {slides[activeSlide].subtitle}
                </h4>
                <h2 style={{ fontSize: 48, fontWeight: 800, color: "#f0f4ff", lineHeight: 1.1 }}>
                  {slides[activeSlide].title}
                </h2>
                <p style={{ color: "#8798b0", fontSize: 18, lineHeight: 1.6, maxWidth: 600, marginTop: 10 }}>
                  {slides[activeSlide].content}
                </p>
              </motion.div>

              <div style={{ position: "absolute", bottom: 40, right: 40, display: "flex", gap: 12 }}>
                <button onClick={prevSlide} style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#f0f4ff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ChevronLeft size={20} />
                </button>
                <button onClick={nextSlide} style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#f0f4ff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ChevronRight size={20} />
                </button>
              </div>

              <div style={{ position: "absolute", bottom: 40, left: 60, color: "#475569", fontSize: 12, fontWeight: 600 }}>
                SLIDE {activeSlide + 1} OF {slides.length}
              </div>
            </div>
          </Card>

          <div style={{ display: "flex", gap: 16 }}>
            <button style={{
              flex: 1, padding: "16px", borderRadius: 14, background: "#6366f1",
              border: "none", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: "0 4px 12px rgba(99,102,241,0.3)"
            }}>
              <Download size={18} /> Download Slide Deck (PPTX)
            </button>
            <button style={{
              flex: 1, padding: "16px", borderRadius: 14, background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)", color: "#f0f4ff", fontWeight: 700, fontSize: 14, cursor: "pointer"
            }}>
              Copy Private View Link
            </button>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <Card>
            <SectionHeader icon={Sparkles} title="AI Narrator" subtitle="Core messaging refinements" color="#a855f7" />
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ padding: 16, borderRadius: 12, background: "rgba(168,85,247,0.05)", border: "1px dashed rgba(168,85,247,0.2)" }}>
                <p style={{ color: "#c7d2f0", fontSize: 13, lineHeight: 1.6, fontStyle: "italic" }}>
                  "Focus on the market dominance angle. Your growth rate is a key outlier that investors will find compelling."
                </p>
              </div>
              <button 
                onClick={() => { setGenerating(true); setTimeout(() => setGenerating(false), 2000); }}
                style={{
                  width: "100%", padding: "12px", borderRadius: 10, background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)", color: "#f0f4ff", fontWeight: 700, fontSize: 13, cursor: "pointer"
                }}
              >
                {generating ? "Recalculating..." : "Optimize Narrative"}
              </button>
            </div>
          </Card>

          <Card>
            <SectionHeader icon={ListChecks} title="Deck Checklist" subtitle="Required for Series A" />
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                "Solid Unit Economics",
                "Clear Growth Roadmap",
                "Competitive Moat",
                "Team Background"
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 16, height: 16, borderRadius: 4, border: "2px solid #6366f1", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: 8, height: 8, borderRadius: 1, background: "#6366f1" }} />
                  </div>
                  <span style={{ color: "#8798b0", fontSize: 13, fontWeight: 500 }}>{item}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

