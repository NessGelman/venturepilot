import React, { useEffect, useMemo, useState } from "react";
import { Zap, ListChecks, Sparkles, Send, ChevronRight, ChevronLeft, Presentation, Download, Plus, Mail, RefreshCcw } from "lucide-react";
import { motion } from "framer-motion";
import { useApp } from "../context/AppContext";
import { Card, SectionHeader } from "../components/Shared";

export default function PitchDeck() {
  const { idea, capital, revenue, growth, ltv, cac } = useApp();
  const [generating, setGenerating] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [status, setStatus] = useState("");
  const [shareEmail, setShareEmail] = useState("");

  const initialSlides = useMemo(() => ([
    { title: "The Problem", subtitle: "Fragmented Intelligence", content: "Founders are flying blind. Existing financial tools are either overly complex spreadsheets or isolated SaaS metrics that don't provide a holistic strategic view." },
    { title: "The Solution", subtitle: "VenturePilot OS", content: idea || "An integrated operating system that centralizes all venture data to empower founders with real-time strategic intelligence." },
    { title: "Market Traction", subtitle: "Exponential Growth", content: `Scaling at ${growth}% MoM with $${(revenue * 12 / 1000).toFixed(0)}k ARR within 6 months of launch.` },
    { title: "Financial Engine", subtitle: "Efficiency at Scale", content: `Operating with $${capital.toLocaleString()} in capital. LTV/CAC is ${(ltv / cac).toFixed(1)}x — top decile efficiency.` },
  ]), [idea, capital, revenue, growth, ltv, cac]);

  const [slides, setSlides] = useState(initialSlides);

  // Refresh the template slides when the core metrics change
  useEffect(() => {
    setSlides((prev) => prev.map((slide, idx) => initialSlides[idx] || slide));
  }, [initialSlides]);

  const downloadSlides = () => {
    const content = slides.map((s, i) => `Slide ${i + 1}: ${s.title}\n${s.subtitle}\n${s.content}\n`).join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "venturepilot-slide-deck.txt";
    link.click();
    URL.revokeObjectURL(url);
    setStatus("Slide deck exported as .txt");
  };

  const copyPrivateLink = async () => {
    const link = `${window.location.origin}${window.location.hash || "#/pitch"}`;
    try {
      await navigator.clipboard.writeText(link);
      setStatus("Private view link copied to clipboard");
    } catch (err) {
      setStatus("Clipboard is blocked — copy manually: " + link);
    }
  };

  const sendDeck = () => {
    if (!shareEmail.includes("@")) {
      setStatus("Add a valid email to send.");
      return;
    }
    setStatus(`Deck shared with ${shareEmail}`);
    setShareEmail("");
  };

  const nextSlide = () => setActiveSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);

  const updateSlide = (field, value) => {
    setSlides((prev) => prev.map((s, i) => (i === activeSlide ? { ...s, [field]: value } : s)));
  };

  const addSlide = () => {
    setSlides((prev) => [...prev, { title: "New Slide", subtitle: "Add subtitle", content: "Describe the insight here." }]);
    setActiveSlide(slides.length);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "#f0f4ff" }}>
            Slide Deck <span style={{ background: "linear-gradient(90deg,#6366f1,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Generator</span>
          </h1>
          <p style={{ color: "#8798b0", marginTop: 6, fontSize: 15 }}>Dynamically generated slides based on your core venture metrics.</p>
        </div>
        <button
          onClick={addSlide}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "12px 16px", borderRadius: 12,
            background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.2)",
            color: "#c7d2f0", fontWeight: 700, cursor: "pointer"
          }}
        >
          <Plus size={16} /> Add Custom Slide
        </button>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <Card style={{ position: "relative", padding: 0, height: 500, overflow: "hidden", display: "flex" }}>
            <div style={{
              flex: 1,
              background: "linear-gradient(135deg, #0d1420 0%, #080c14 100%)",
              display: "flex", flexDirection: "column", justifyContent: "center", padding: 60,
              position: "relative"
            }}>
              <div style={{ position: "absolute", top: 40, left: 60, display: "flex", alignItems: "center", gap: 10 }}>
                <Presentation size={18} color="#6366f1" />
                <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(99,102,241,0.5)", textTransform: "uppercase" }}>VenturePilot // Pitch v1.3</span>
              </div>

              <motion.div
                key={activeSlide}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <h4 style={{ color: "#6366f1", fontSize: 14, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  {slides[activeSlide]?.subtitle}
                </h4>
                <h2 style={{ fontSize: 48, fontWeight: 800, color: "#f0f4ff", lineHeight: 1.1 }}>
                  {slides[activeSlide]?.title}
                </h2>
                <p style={{ color: "#8798b0", fontSize: 18, lineHeight: 1.6, maxWidth: 600, marginTop: 10 }}>
                  {slides[activeSlide]?.content}
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

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <button
              onClick={downloadSlides}
              style={{
                flex: 1, minWidth: 180, padding: "16px", borderRadius: 14, background: "#6366f1",
                border: "none", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: "0 4px 12px rgba(99,102,241,0.3)"
              }}
            >
              <Download size={18} /> Export Slide Deck (TXT)
            </button>
            <button
              onClick={copyPrivateLink}
              style={{
                flex: 1, minWidth: 180, padding: "16px", borderRadius: 14, background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)", color: "#f0f4ff", fontWeight: 700, fontSize: 14, cursor: "pointer"
              }}
            >
              Copy Private View Link
            </button>
            <button
              onClick={() => setSlides(initialSlides)}
              style={{
                flex: 1, minWidth: 180, padding: "16px", borderRadius: 14, background: "rgba(16,185,129,0.12)",
                border: "1px solid rgba(16,185,129,0.2)", color: "#10b981", fontWeight: 700, fontSize: 14, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8
              }}
            >
              <RefreshCcw size={16} /> Sync With Metrics
            </button>
          </div>
          {status && (
            <p style={{ color: "#10b981", fontSize: 12, fontWeight: 700 }}>
              {status}
            </p>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <Card>
            <SectionHeader icon={Sparkles} title="AI Narrator" subtitle="Core messaging refinements" color="#a855f7" />
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ padding: 16, borderRadius: 12, background: "rgba(168,85,247,0.05)", border: "1px dashed rgba(168,85,247,0.2)" }}>
                <p style={{ color: "#c7d2f0", fontSize: 13, lineHeight: 1.6, fontStyle: "italic" }}>
                  "Lean into the efficiency edge: LTV/CAC above 3x lets you grow aggressively without compromising runway."
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
            <SectionHeader icon={Layout} title="Slide Editor" subtitle="Edit the active slide" />
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input
                value={slides[activeSlide]?.title || ""}
                onChange={(e) => updateSlide("title", e.target.value)}
                placeholder="Slide title"
                style={{ width: "100%", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "12px 14px", color: "#f0f4ff", fontWeight: 700 }}
              />
              <input
                value={slides[activeSlide]?.subtitle || ""}
                onChange={(e) => updateSlide("subtitle", e.target.value)}
                placeholder="Subtitle"
                style={{ width: "100%", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "12px 14px", color: "#c7d2f0", fontWeight: 600 }}
              />
              <textarea
                value={slides[activeSlide]?.content || ""}
                onChange={(e) => updateSlide("content", e.target.value)}
                rows={5}
                style={{ width: "100%", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "12px 14px", color: "#8798b0", fontWeight: 500, resize: "vertical" }}
              />
            </div>
          </Card>

          <Card>
            <SectionHeader icon={Mail} title="Share Deck" subtitle="Send a private copy to investors" color="#22c55e" />
            <div style={{ display: "flex", gap: 10 }}>
              <input
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                placeholder="investor@firm.com"
                style={{ flex: 1, background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "12px 14px", color: "#f0f4ff", fontWeight: 600 }}
              />
              <button
                onClick={sendDeck}
                style={{
                  padding: "12px 16px", borderRadius: 12, background: "#22c55e", border: "none",
                  color: "#0b1120", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 8
                }}
              >
                <Send size={16} /> Send
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
                "Team Background",
                "Use of Funds"
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
