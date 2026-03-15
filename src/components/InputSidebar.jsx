import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { ChevronRight, ChevronLeft, Settings2, Zap, Save, UploadCloud, Trash, Undo2, Redo2, BookOpen, RefreshCcw } from "lucide-react";

// Defined OUTSIDE parent to avoid focus-loss on re-render
const InputField = ({ label, value, onChange, prefix, suffix, multiline, type = "number" }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
    <label style={{ color: "#64748b", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>
    <div style={{ position: "relative" }}>
      {prefix && <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#475569", fontSize: 13, pointerEvents: "none" }}>{prefix}</span>}
      {multiline ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} rows={3}
          style={{ width: "100%", background: "#080c14", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "9px 10px", color: "#f0f4ff", fontSize: 13, fontWeight: 500, outline: "none", resize: "none", lineHeight: 1.5 }}
          onFocus={e => e.target.style.borderColor = "#6366f1"}
          onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
        />
      ) : (
        <input type={type} value={value}
          onChange={e => onChange(type === "number" ? Number(e.target.value) : e.target.value)}
          style={{ width: "100%", background: "#080c14", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: `9px 10px 9px ${prefix ? "22px" : "10px"}`, paddingRight: suffix ? "32px" : "10px", color: "#f0f4ff", fontSize: 13, fontWeight: 600, outline: "none" }}
          onFocus={e => e.target.style.borderColor = "#6366f1"}
          onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
        />
      )}
      {suffix && <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#475569", fontSize: 13, pointerEvents: "none" }}>{suffix}</span>}
    </div>
  </div>
);

export default function InputSidebar({ isOpen, setIsOpen }) {
  const {
    capital, setCapital, burn, setBurn, revenue, setRevenue, growth, setGrowth,
    headcount, setHeadcount, cac, setCac, arpu, setArpu, churn, setChurn,
    pipeline, setPipeline, idea, setIdea, industry, setIndustry,
    problem, setProblem, stage, setStage, founder, setFounder,
    northStar, setNorthStar, lastSaved, resetDefaults,
    presets, savePreset, loadPreset, deletePreset,
    repoUrl, setRepoUrl, undo, redo, dailySnapshots, addToast
  } = useApp();

  const [presetName, setPresetName] = useState("");
  const [selectedPreset, setSelectedPreset] = useState("");

  const analyzeRepo = async () => {
    const url = repoUrl.trim();
    if (!url) { addToast("Add a repo URL first."); return; }
    const match = url.match(/github\.com\/([^/\s]+)\/([^/\s#]+)/i);
    if (!match) { addToast("Enter a valid GitHub repo URL."); return; }
    const [, owner, repo] = match;
    const repoName = repo.replace(/\.git$/, "");
    let readme = "";
    for (const branch of ["main", "master"]) {
      try {
        const res = await fetch(`https://raw.githubusercontent.com/${owner}/${repoName}/${branch}/README.md`);
        if (res.ok) { readme = await res.text(); break; }
      } catch {}
    }
    if (!readme) { addToast("Could not read repo."); return; }
    const lines = readme.slice(0, 400).split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    setIdea(prev => prev || lines[0] || repoName);
    setProblem(prev => prev || lines.find(l => /problem|pain|why/i.test(l)) || `Core pain from ${repoName}.`);
    setIndustry(prev => prev || (lines.find(l => /saas|ai|ml|fintech|health|infra/i.test(l)) || "Software"));
    addToast("Repo analyzed — narrative fields enriched.");
  };

  const row2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 };

  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)} style={{
        position: "fixed", left: isOpen ? 290 : 0, top: "50%", transform: "translateY(-50%)",
        width: 22, height: 48, background: "#6366f1", border: "none",
        borderRadius: "0 8px 8px 0", cursor: "pointer", zIndex: 201,
        display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
        transition: "left 0.3s cubic-bezier(0.4,0,0.2,1)",
        boxShadow: "4px 0 12px rgba(99,102,241,0.3)"
      }}>
        {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>

      <div style={{
        position: "fixed", left: 0, top: 0, bottom: 0, width: 290,
        background: "#0d1420", borderRight: "1px solid rgba(255,255,255,0.08)",
        zIndex: 200, transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
        transform: isOpen ? "translateX(0)" : "translateX(-100%)",
        padding: "72px 20px 16px",
        display: "flex", flexDirection: "column", overflowY: "auto"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          <Settings2 size={16} color="#6366f1" />
          <h3 style={{ fontSize: 13, fontWeight: 800, color: "#f0f4ff", textTransform: "uppercase", letterSpacing: "0.05em" }}>Venture Metrics</h3>
        </div>

        {/* Presets */}
        <div style={{ padding: 12, borderRadius: 12, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", marginBottom: 16 }}>
          <div style={row2}>
            <input value={presetName} onChange={e => setPresetName(e.target.value)} placeholder="Preset name…"
              style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.08)", color: "#f0f4ff", borderRadius: 8, padding: "8px 10px", fontSize: 12, fontWeight: 600 }} />
            <button onClick={() => { if (presetName.trim()) { savePreset(presetName.trim()); setPresetName(""); addToast(`Saved: ${presetName.trim()}`); } }}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "8px", borderRadius: 8, background: "#6366f1", border: "none", color: "#fff", fontWeight: 800, cursor: "pointer", fontSize: 12 }}>
              <Save size={13} /> Save
            </button>
          </div>
          <div style={{ ...row2, marginTop: 8 }}>
            <select value={selectedPreset} onChange={e => setSelectedPreset(e.target.value)}
              style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.08)", color: "#f0f4ff", borderRadius: 8, padding: "8px 10px", fontWeight: 700, fontSize: 12 }}>
              <option value="">Load preset…</option>
              {presets.map(p => <option key={p.name} value={p.name} style={{ color: "#0f172a" }}>{p.name}</option>)}
            </select>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => { if (selectedPreset) { loadPreset(selectedPreset); addToast(`Applied: ${selectedPreset}`); } }}
                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "8px", borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#c7d2f0", fontWeight: 700, cursor: "pointer", fontSize: 12 }}>
                <UploadCloud size={13} />
              </button>
              <button onClick={() => { if (selectedPreset) { deletePreset(selectedPreset); addToast(`Deleted: ${selectedPreset}`); setSelectedPreset(""); } }}
                style={{ width: 34, display: "flex", alignItems: "center", justifyContent: "center", padding: "8px", borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#ef4444", cursor: "pointer" }}>
                <Trash size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* Fields */}
        <div style={row2}>
          <InputField label="Founder / Team" value={founder} onChange={setFounder} type="text" />
          <InputField label="Stage" value={stage} onChange={setStage} type="text" />
        </div>
        <InputField label="North Star Goal" value={northStar} onChange={setNorthStar} type="text" />
        <InputField label="Capital Raised ($)" value={capital} onChange={setCapital} prefix="$" />
        <InputField label="Monthly Gross Burn" value={burn} onChange={setBurn} prefix="$" />
        <InputField label="Monthly Revenue (MRR)" value={revenue} onChange={setRevenue} prefix="$" />
        <InputField label="MoM Growth Rate" value={growth} onChange={setGrowth} suffix="%" />
        <div style={row2}>
          <InputField label="Headcount" value={headcount} onChange={setHeadcount} />
          <InputField label="CAC" value={cac} onChange={setCac} prefix="$" />
        </div>
        <div style={row2}>
          <InputField label="ARPU / mo" value={arpu} onChange={setArpu} prefix="$" />
          <InputField label="Monthly Churn" value={churn} onChange={setChurn} suffix="%" />
        </div>
        <InputField label="Active Pipeline (12m)" value={pipeline} onChange={setPipeline} prefix="$" />
        <InputField label="Industry" value={industry} onChange={setIndustry} type="text" />
        <InputField label="Problem You Solve" value={problem} onChange={setProblem} multiline />
        <InputField label="Company Vision" value={idea} onChange={setIdea} multiline />
        <InputField label="GitHub Repo URL (optional)" value={repoUrl} onChange={setRepoUrl} type="text" />
        <button onClick={analyzeRepo} style={{
          width: "100%", padding: "10px", borderRadius: 8, background: "rgba(99,102,241,0.08)",
          border: "1px solid rgba(99,102,241,0.2)", color: "#c7d2f0", fontWeight: 700, cursor: "pointer",
          marginBottom: 12, display: "flex", alignItems: "center", gap: 6, justifyContent: "center", fontSize: 12
        }}>
          <BookOpen size={13} /> Analyze Repo (optional)
        </button>

        <div style={{ padding: 12, borderRadius: 10, background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.1)", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <Zap size={12} color="#6366f1" />
            <span style={{ fontSize: 11, fontWeight: 700, color: "#f0f4ff" }}>Quick Tip</span>
          </div>
          <p style={{ fontSize: 11, color: "#8798b0", lineHeight: 1.5 }}>
            Updating values recalculates runway, efficiency, and readiness across all modules in real time.
          </p>
        </div>

        {/* Footer */}
        <div style={{ paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981" }} />
            <span style={{ fontSize: 10, color: "#475569", fontWeight: 700 }}>AUTO-SAVE</span>
          </div>
          {lastSaved && <span style={{ fontSize: 10, color: "#475569" }}>{new Date(lastSaved).toLocaleTimeString()}</span>}
          <span style={{ fontSize: 10, color: "#475569" }}>Snaps: {dailySnapshots.length}</span>
          <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
            <button onClick={undo} title="Undo" style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 9px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#cbd5e1", fontWeight: 700, cursor: "pointer", fontSize: 11 }}><Undo2 size={12} />Undo</button>
            <button onClick={redo} title="Redo" style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 9px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#cbd5e1", fontWeight: 700, cursor: "pointer", fontSize: 11 }}><Redo2 size={12} />Redo</button>
            <button onClick={resetDefaults} title="Reset" style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 9px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#c7d2f0", fontWeight: 700, cursor: "pointer", fontSize: 11 }}><RefreshCcw size={12} /></button>
          </div>
        </div>
      </div>
    </>
  );
}
