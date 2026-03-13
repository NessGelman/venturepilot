import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { X, ChevronRight, ChevronLeft, Settings2, DollarSign, TrendingUp, Zap, Info, Users, Activity, RefreshCcw, Save, UploadCloud, Trash, Undo2, Redo2, BookOpen } from "lucide-react";

// Move InputField OUTSIDE the main component to prevent focus loss on re-render
const InputField = ({ label, value, onChange, prefix, suffix, multiline, type = "number" }) => (
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
          type={type}
          value={value}
          onChange={(e) => onChange(type === "number" ? Number(e.target.value) : e.target.value)}
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
    idea, setIdea,
    industry, setIndustry,
    problem, setProblem,
    stage, setStage,
    founder, setFounder,
    northStar, setNorthStar,
    lastSaved,
    resetDefaults,
    presets,
    savePreset,
    loadPreset,
    deletePreset,
    repoUrl, setRepoUrl,
    undo, redo,
    dailySnapshots,
    toasts, addToast
  } = useApp();
  const [presetName, setPresetName] = useState("");
  const [selectedPreset, setSelectedPreset] = useState("");
  const analyzeRepo = async () => {
    const url = repoUrl.trim();
    if (!url) {
      addToast("Add a repo URL first.");
      return;
    }
    const match = url.match(/github\.com\/([^\/\s]+)\/([^\/\s#]+)/i);
    if (!match) {
      addToast("Enter a valid GitHub repo URL (github.com/owner/repo).");
      return;
    }
    const owner = match[1];
    const repo = match[2].replace(/\.git$/, "");
    const branches = ["main", "master"];
    let readme = "";
    for (const branch of branches) {
      try {
        const res = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${branch}/README.md`);
        if (res.ok) {
          readme = await res.text();
          break;
        }
      } catch (_) {}
    }
    if (!readme) {
      addToast("Could not read repo (check URL or branch).");
      return;
    }
    // naive extraction
    const snippet = readme.slice(0, 400);
    const lines = snippet.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const title = lines[0] || repo;
    const problemGuess = lines.find(l => /problem|pain|why/i.test(l));
    const industryGuess = lines.find(l => /saas|ai|ml|fintech|health|infra|data|devops/i.test(l));
    setIdea((prev) => prev || title);
    setProblem((prev) => prev || problemGuess || `We solve a core pain surfaced in ${repo}.`);
    setIndustry((prev) => prev || (industryGuess ? industryGuess.split(/[.|-]/)[0] : "Software"));
    addToast("Repo analyzed and narrative fields enriched.");
  };

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

        <div style={{ padding: 12, borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", marginBottom: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, alignItems: "center" }}>
          <input
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            placeholder="Save current as preset"
            style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.08)", color: "#f0f4ff", borderRadius: 10, padding: "10px 12px", fontWeight: 600 }}
          />
          <button
            onClick={() => { if (presetName.trim()) { savePreset(presetName.trim()); setPresetName(""); } }}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 12px", borderRadius: 10, background: "#6366f1", border: "none", color: "#fff", fontWeight: 800, cursor: "pointer" }}
          >
            <Save size={14} /> Save
          </button>
          <select
            value={selectedPreset}
            onChange={(e) => setSelectedPreset(e.target.value)}
            style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.08)", color: "#f0f4ff", borderRadius: 10, padding: "10px 12px", fontWeight: 700 }}
          >
            <option value="">Load preset...</option>
            {presets.map((p) => <option key={p.name} value={p.name} style={{ color: "#0f172a" }}>{p.name}</option>)}
          </select>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={() => { if (selectedPreset) { loadPreset(selectedPreset); addToast(`Preset '${selectedPreset}' applied`); } }}
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#c7d2f0", fontWeight: 700, cursor: "pointer" }}
            >
              <UploadCloud size={14} /> Apply
            </button>
            <button
              onClick={() => { if (selectedPreset) { deletePreset(selectedPreset); addToast(`Preset '${selectedPreset}' deleted`); setSelectedPreset(""); } }}
              style={{ width: 44, display: "flex", alignItems: "center", justifyContent: "center", padding: "10px", borderRadius: 10, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#ef4444", cursor: "pointer" }}
              title="Delete preset"
            >
              <Trash size={14} />
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <InputField label="Founder / Team" value={founder} onChange={setFounder} type="text" />
            <InputField label="Stage" value={stage} onChange={setStage} type="text" />
          </div>
          <InputField label="North Star Goal" value={northStar} onChange={setNorthStar} type="text" />
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
          <InputField label="Industry" value={industry} onChange={setIndustry} type="text" />
          <InputField label="Problem You Solve" value={problem} onChange={setProblem} multiline />
          <InputField label="Company Vision" value={idea} onChange={setIdea} multiline />
          <InputField label="GitHub Repo URL (optional)" value={repoUrl} onChange={setRepoUrl} type="text" />
          <button
            onClick={analyzeRepo}
            style={{ width: "100%", padding: "12px", borderRadius: 10, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", color: "#c7d2f0", fontWeight: 700, cursor: "pointer", marginBottom: 12, display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}
          >
            <BookOpen size={14} /> Analyze Repo (optional)
          </button>
          
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#475569", gap: 10, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 600 }}>AUTO-SAVE ENABLED</span>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981" }} />
            </div>
            {lastSaved && <span style={{ fontSize: 11 }}>Saved: {new Date(lastSaved).toLocaleTimeString()}</span>}
            <button
              onClick={resetDefaults}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 10px", borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#c7d2f0", fontWeight: 700, cursor: "pointer" }}
            >
              <RefreshCcw size={14} /> Reset
            </button>
            <button onClick={undo} style={{ display: "flex", alignItems: "center", gap: 4, padding: "8px 10px", borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#cbd5e1", fontWeight: 700, cursor: "pointer" }}><Undo2 size={14}/>Undo</button>
            <button onClick={redo} style={{ display: "flex", alignItems: "center", gap: 4, padding: "8px 10px", borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#cbd5e1", fontWeight: 700, cursor: "pointer" }}><Redo2 size={14}/>Redo</button>
            <span style={{ fontSize: 11 }}>Snapshots (30d): {dailySnapshots.length}</span>
          </div>
        </div>
      </div>
    </>
  );
}
