import React, { useEffect, useMemo, useState } from "react";
import { Zap, ListChecks, Sparkles, Send, ChevronRight, ChevronLeft, Presentation, Download, Plus, Mail, RefreshCcw, LayoutTemplate } from "lucide-react";
import { motion } from "framer-motion";
import { useApp } from "../context/AppContext";
import { Card, SectionHeader } from "../components/Shared";

export default function PitchDeck() {
  const { idea, capital, revenue, growth, ltv, cac, industry, problem, founder, stage, northStar } = useApp();
  const [generating, setGenerating] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [status, setStatus] = useState("");
  const [shareEmail, setShareEmail] = useState("");

  const buildSlides = () => ([
    { title: "The Problem",      subtitle: "Fragmented Intelligence",  content: "Founders are flying blind. Existing financial tools are either overly complex spreadsheets or isolated SaaS metrics that don't provide a holistic strategic view." },
    { title: "Industry & Vision", subtitle: industry || "Category",   content: idea || "An integrated operating system that centralizes all venture data to empower founders with real-time strategic intelligence." },
    { title: "What We Solve",    subtitle: "Customer Pain",           content: problem || "We eliminate the manual, fragmented capital planning process founders struggle with." },
    { title: "Market Traction",  subtitle: "Exponential Growth",      content: `Scaling at ${growth}% MoM with $${(revenue * 12 / 1000).toFixed(0)}k ARR within 6 months of launch.` },
    { title: "Financial Engine", subtitle: "Efficiency at Scale",     content: `Operating with $${capital.toLocaleString()} in capital. LTV/CAC is ${(ltv / cac).toFixed(1)}x — top decile efficiency.` },
    { title: "Team & Stage",     subtitle: "Why Us",                  content: `${founder || "Founding team"} at ${stage || "current stage"} executing toward: ${northStar || "our north star goal"}.` },
  ]);

  const initialSlides = useMemo(buildSlides, [idea, capital, revenue, growth, ltv, cac, industry, problem, founder, stage, northStar]);
  const [slides, setSlides] = useState(initialSlides);

  useEffect(() => {
    setSlides(prev => prev.map((s, i) => initialSlides[i] || s));
  }, [initialSlides]);

  const nextSlide = () => setActiveSlide(p => (p + 1) % slides.length);
  const prevSlide = () => setActiveSlide(p => (p - 1 + slides.length) % slides.length);
  const updateSlide = (field, val) => setSlides(prev => prev.map((s, i) => i === activeSlide ? { ...s, [field]: val } : s));
  const addSlide = () => { setSlides(prev => [...prev, { title: "New Slide", subtitle: "Add subtitle", content: "Describe the insight here." }]); setActiveSlide(slides.length); };

  const downloadSlides = () => {
    const content = slides.map((s, i) => `Slide ${i + 1}: ${s.title}\n${s.subtitle}\n${s.content}\n`).join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), { href: url, download: "venturepilot-deck.txt" });
    a.click(); URL.revokeObjectURL(url);
    setStatus("Slide deck exported as .txt");
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}#/pitch`);
      setStatus("Private view link copied.");
    } catch { setStatus("Clipboard blocked."); }
  };

  const sendDeck = () => {
    if (!shareEmail.includes("@")) { setStatus("Add a valid email."); return; }
    setStatus(`Deck shared with ${shareEmail}`);
    setShareEmail("");
  };

  const inputSt = { width: "100%", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "11px 13px", color: "#f0f4ff", fontWeight: 600, outline: "none" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: "#f0f4ff" }}>
            Slide Deck <span style={{ background: "linear-gradient(90deg,#6366f1,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Generator</span>
          </h1>
          <p style={{ color: "#8798b0", marginTop: 6, fontSize: 15 }}>Dynamically generated from your core venture metrics.</p>
        </div>
        <button onClick={addSlide} style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 16px", borderRadius: 12, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", color: "#c7d2f0", fontWeight: 700, cursor: "pointer" }}>
          <Plus size={15} /> Add Slide
        </button>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Slide viewer */}
          <Card style={{ padding: 0, height: 480, overflow: "hidden" }}>
            <div style={{ height: "100%", background: "linear-gradient(135deg,#0d1420 0%,#080c14 100%)", display: "flex", flexDirection: "column", justifyContent: "center", padding: "48px 56px", position: "relative" }}>
              <div style={{ position: "absolute", top: 32, left: 56, display: "flex", alignItems: "center", gap: 8 }}>
                <Presentation size={16} color="#6366f1" />
                <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(99,102,241,0.5)", textTransform: "uppercase" }}>VenturePilot // Pitch</span>
              </div>
              <motion.div key={activeSlide} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <h4 style={{ color: "#6366f1", fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  {slides[activeSlide]?.subtitle}
                </h4>
                <h2 style={{ fontSize: 44, fontWeight: 800, color: "#f0f4ff", lineHeight: 1.1 }}>
                  {slides[activeSlide]?.title}
                </h2>
                <p style={{ color: "#8798b0", fontSize: 17, lineHeight: 1.65, maxWidth: 560, marginTop: 8 }}>
                  {slides[activeSlide]?.content}
                </p>
              </motion.div>
              <div style={{ position: "absolute", bottom: 32, right: 36, display: "flex", gap: 10 }}>
                <button onClick={prevSlide} style={{ width: 38, height: 38, borderRadius: 9, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#f0f4ff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><ChevronLeft size={18} /></button>
                <button onClick={nextSlide} style={{ width: 38, height: 38, borderRadius: 9, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#f0f4ff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><ChevronRight size={18} /></button>
              </div>
              <div style={{ position: "absolute", bottom: 36, left: 56, color: "#475569", fontSize: 12, fontWeight: 600 }}>
                SLIDE {activeSlide + 1} / {slides.length}
              </div>
            </div>
          </Card>

          {/* Slide thumbnails */}
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
            {slides.map((s, i) => (
              <button key={i} onClick={() => setActiveSlide(i)} style={{
                minWidth: 90, padding: "8px 10px", borderRadius: 8, cursor: "pointer",
                background: i === activeSlide ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.03)",
                border: i === activeSlide ? "1px solid rgba(99,102,241,0.5)" : "1px solid rgba(255,255,255,0.05)",
                color: i === activeSlide ? "#c7d2f0" : "#64748b", fontWeight: 700, fontSize: 11, textAlign: "left", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
              }}>
                {i + 1}. {s.title}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button onClick={downloadSlides} style={{ flex: 1, minWidth: 150, padding: "14px", borderRadius: 12, background: "#6366f1", border: "none", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Download size={16} /> Export TXT
            </button>
            <button onClick={copyLink} style={{ flex: 1, minWidth: 150, padding: "14px", borderRadius: 12, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#f0f4ff", fontWeight: 700, cursor: "pointer" }}>
              Copy Link
            </button>
            <button onClick={() => setSlides(buildSlides())} style={{ flex: 1, minWidth: 150, padding: "14px", borderRadius: 12, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", color: "#10b981", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <RefreshCcw size={15} /> Sync Metrics
            </button>
          </div>
          {status && <p style={{ color: "#10b981", fontSize: 12, fontWeight: 700 }}>{status}</p>}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* AI Narrator */}
          <Card>
            <SectionHeader icon={Sparkles} title="AI Narrator" subtitle="Core messaging refinements" color="#a855f7" />
            <div style={{ padding: 16, borderRadius: 12, background: "rgba(168,85,247,0.05)", border: "1px dashed rgba(168,85,247,0.2)", marginBottom: 12 }}>
              <p style={{ color: "#c7d2f0", fontSize: 13, lineHeight: 1.65, fontStyle: "italic" }}>
                {`"Lean into the ${industry || "market"} edge: you solve '${(problem || "").slice(0,60) || "a core pain"}…' and your LTV/CAC ${(ltv / cac).toFixed(1)}x efficiency lets you grow without burning cash."`}
              </p>
            </div>
            <button onClick={() => { setGenerating(true); setTimeout(() => setGenerating(false), 1800); }}
              style={{ width: "100%", padding: "11px", borderRadius: 9, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#f0f4ff", fontWeight: 700, cursor: "pointer" }}>
              {generating ? "Recalculating…" : "Optimize Narrative"}
            </button>
          </Card>

          {/* Slide editor */}
          <Card>
            <SectionHeader icon={LayoutTemplate} title="Slide Editor" subtitle="Edit the active slide" />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input value={slides[activeSlide]?.title || ""} onChange={e => updateSlide("title", e.target.value)} placeholder="Slide title" style={inputSt} />
              <input value={slides[activeSlide]?.subtitle || ""} onChange={e => updateSlide("subtitle", e.target.value)} placeholder="Subtitle" style={{ ...inputSt, color: "#c7d2f0" }} />
              <textarea value={slides[activeSlide]?.content || ""} onChange={e => updateSlide("content", e.target.value)} rows={5} style={{ ...inputSt, color: "#8798b0", resize: "vertical", fontWeight: 500, lineHeight: 1.55 }} />
            </div>
          </Card>

          {/* Share */}
          <Card>
            <SectionHeader icon={Mail} title="Share Deck" subtitle="Send a private copy" color="#22c55e" />
            <div style={{ display: "flex", gap: 10 }}>
              <input value={shareEmail} onChange={e => setShareEmail(e.target.value)} placeholder="investor@firm.com" style={{ ...inputSt, flex: 1 }} />
              <button onClick={sendDeck} style={{ padding: "11px 16px", borderRadius: 10, background: "#22c55e", border: "none", color: "#0b1120", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                <Send size={15} /> Send
              </button>
            </div>
          </Card>

          {/* Checklist */}
          <Card>
            <SectionHeader icon={ListChecks} title="Series A Checklist" subtitle="Required slide coverage" />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {["Solid Unit Economics","Clear Growth Roadmap","Competitive Moat","Team Background","Use of Funds"].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 16, height: 16, borderRadius: 4, border: "2px solid #6366f1", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
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
