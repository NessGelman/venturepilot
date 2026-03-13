import React, { useMemo, useState } from "react";
import { Users, Search, Filter, Plus, Mail, Linkedin, ExternalLink, CalendarClock, CheckCircle2, Send } from "lucide-react";
import { Card, SectionHeader } from "../components/Shared";
import { useApp } from "../context/AppContext";

export default function InvestorMatch() {
  const { industry, problem, revenue, runwayMonths, ltv, cac, addToast } = useApp();
  const defaults = [
    { name: "Andreessen Horowitz", focus: "Generalist/AI", stage: "Seed - Series D", contact: "Active", link: "a16z.com", note: "Warm intro via LP", next: "2026-03-20" },
    { name: "Sequoia Capital", focus: "Enterprise/SaaS", stage: "Pre-seed - IPO", contact: "Dormant", link: "sequoiacap.com", note: "Paused until Q2", next: "2026-04-05" },
    { name: "Greylock", focus: "Infrastructure/B2B", stage: "Series A", contact: "Active", link: "greylock.com", note: "Interested in data moat", next: "2026-03-28" },
    { name: "Lightspeed", focus: "Fintech/Consumer", stage: "Early - Growth", contact: "Interested", link: "lsvp.com", note: "Asked for KPI updates", next: "2026-03-18" },
  ];
  const [investors, setInvestors] = useState(defaults);
  const [query, setQuery] = useState("");
  const [contactFilter, setContactFilter] = useState("All");
  const [newInvestor, setNewInvestor] = useState({ name: "", focus: "", stage: "", contact: "Active", link: "", note: "", next: "" });
  const [status, setStatus] = useState("");

  const filteredInvestors = useMemo(() => investors.filter(inv => {
    const matchQuery = query.trim().length === 0 || [inv.name, inv.focus, inv.stage, inv.contact, inv.link, inv.note].some(field => field.toLowerCase().includes(query.toLowerCase()));
    const matchContact = contactFilter === "All" || inv.contact === contactFilter;
    return matchQuery && matchContact;
  }), [investors, query, contactFilter]);

  const addInvestor = (e) => {
    e.preventDefault();
    if (!newInvestor.name || !newInvestor.focus || !newInvestor.stage) {
      setStatus("Name, focus, and stage are required.");
      return;
    }
    setInvestors([{ ...newInvestor, link: newInvestor.link || "n/a", next: newInvestor.next || "2026-03-30" }, ...investors]);
    setNewInvestor({ name: "", focus: "", stage: "", contact: "Active", link: "", note: "", next: "" });
    setStatus("Investor added to CRM");
  };

  const updateStatus = (idx, contact) => {
    setInvestors(investors.map((inv, i) => i === idx ? { ...inv, contact } : inv));
  };

  const updateNext = (idx, date) => {
    setInvestors(investors.map((inv, i) => i === idx ? { ...inv, next: date } : inv));
  };

  const pipelineCounts = investors.reduce((acc, inv) => {
    acc[inv.contact] = (acc[inv.contact] || 0) + 1;
    return acc;
  }, {});

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "#f0f4ff" }}>
            Investor <span style={{ background: "linear-gradient(90deg,#6366f1,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>CRM</span>
          </h1>
          <p style={{ color: "#8798b0", marginTop: 6, fontSize: 15 }}>Track outreach, follow-ups, and warm intros.</p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          {["Active", "Interested", "Dormant"].map((bucket) => (
            <div key={bucket} style={{ padding: "10px 14px", borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", color: "#8798b0", fontSize: 13, fontWeight: 700 }}>
              {bucket}: {pipelineCounts[bucket] || 0}
            </div>
          ))}
        </div>
      </header>

      <Card>
        <SectionHeader icon={Users} title="Positioning Snapshot" subtitle="Remind investors why you win" />
        <p style={{ color: "#c7d2f0", fontSize: 14, lineHeight: 1.6 }}>
          Space: <strong>{industry || "Set industry in sidebar"}</strong>. Problem solved: <strong>{problem || "Add the pain point in sidebar"}</strong>. Lead with this in every intro note.
        </p>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24 }}>
        <Card>
          <form onSubmit={addInvestor} style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12, marginBottom: 16 }}>
            {[
              { key: "name", placeholder: "Firm Name" },
              { key: "focus", placeholder: "Focus" },
              { key: "stage", placeholder: "Stage" },
              { key: "link", placeholder: "Website or link" },
              { key: "note", placeholder: "Notes (warm intro, thesis...)" }
            ].map((field) => (
              <input
                key={field.key}
                value={newInvestor[field.key]}
                onChange={(e) => setNewInvestor({ ...newInvestor, [field.key]: e.target.value })}
                placeholder={field.placeholder}
                style={{
                  width: "100%", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 12, padding: "10px 12px", color: "#f0f4ff", fontSize: 13, fontWeight: 500,
                  outline: "none"
                }}
              />
            ))}
            <input
              type="date"
              value={newInvestor.next}
              onChange={(e) => setNewInvestor({ ...newInvestor, next: e.target.value })}
              style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.08)", color: "#f0f4ff", borderRadius: 12, padding: "10px 12px", fontSize: 13, fontWeight: 600 }}
            />
            <select
              value={newInvestor.contact}
              onChange={(e) => setNewInvestor({ ...newInvestor, contact: e.target.value })}
              style={{
                background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.08)", color: "#f0f4ff",
                borderRadius: 12, padding: "10px 12px", fontSize: 13, fontWeight: 700
              }}
            >
              {["Active", "Interested", "Dormant"].map(opt => (
                <option key={opt} value={opt} style={{ color: "#0f172a" }}>{opt}</option>
              ))}
            </select>
            <button
              type="submit"
              style={{
                padding: "12px 16px", borderRadius: 12, background: "#10b981", border: "none",
                color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                boxShadow: "0 4px 12px rgba(16,185,129,0.3)"
              }}
            >
              <Plus size={16} /> Save Investor
            </button>
          </form>

          <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 240 }}>
              <Search size={18} color="#475569" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search investors, firms, or sectors..."
                style={{
                  width: "100%", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 12, padding: "12px 16px 12px 48px", color: "#f0f4ff", fontSize: 14, fontWeight: 500,
                  outline: "none"
                }}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Filter size={16} color="#8798b0" />
              <select
                value={contactFilter}
                onChange={(e) => setContactFilter(e.target.value)}
                style={{
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#f0f4ff",
                  borderRadius: 12, padding: "12px 12px", fontSize: 13, fontWeight: 700
                }}
              >
                {["All", "Active", "Interested", "Dormant"].map(opt => (
                  <option key={opt} value={opt} style={{ color: "#0f172a" }}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 8px" }}>
            <thead>
              <tr style={{ color: "#475569", fontSize: 11, fontWeight: 700, textTransform: "uppercase", textAlign: "left" }}>
                <th style={{ padding: "0 16px" }}>Firm Name</th>
                <th>Focus Area</th>
                <th>Standard Stage</th>
                <th>Outreach Status</th>
                <th>Next Touch</th>
                <th style={{ textAlign: "right", paddingRight: 16 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvestors.map((inv, i) => (
                <tr key={i} style={{ background: "rgba(255,255,255,0.02)", borderRadius: 12 }}>
                  <td style={{ padding: "16px", borderRadius: "12px 0 0 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(99,102,241,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#6366f1", fontWeight: 800, fontSize: 14 }}>
                        {inv.name.charAt(0)}
                      </div>
                      <div>
                        <p style={{ color: "#f0f4ff", fontWeight: 700, fontSize: 14 }}>{inv.name}</p>
                        <p style={{ color: "#475569", fontSize: 12 }}>{inv.link}</p>
                        {inv.note && <p style={{ color: "#8798b0", fontSize: 12 }}>{inv.note}</p>}
                      </div>
                    </div>
                  </td>
                  <td style={{ color: "#8798b0", fontSize: 13, fontWeight: 600 }}>{inv.focus}</td>
                  <td style={{ color: "#8798b0", fontSize: 13, fontWeight: 600 }}>{inv.stage}</td>
                  <td>
                    <select
                      value={inv.contact}
                      onChange={(e) => updateStatus(i, e.target.value)}
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#f0f4ff", padding: "8px 10px", borderRadius: 10, fontWeight: 700 }}
                    >
                      {["Active", "Interested", "Dormant"].map(opt => (
                        <option key={opt} value={opt} style={{ color: "#0f172a" }}>{opt}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <CalendarClock size={14} color="#8798b0" />
                      <input
                        type="date"
                        value={inv.next}
                        onChange={(e) => updateNext(i, e.target.value)}
                        style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.08)", color: "#f0f4ff", borderRadius: 10, padding: "8px 10px", fontWeight: 700 }}
                      />
                    </div>
                  </td>
                  <td style={{ paddingRight: 16, borderRadius: "0 12px 12px 0", textAlign: "right" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                      <button style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "none", cursor: "pointer", color: "#8798b0" }}><Mail size={14} /></button>
                      <button style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "none", cursor: "pointer", color: "#8798b0" }}><Linkedin size={14} /></button>
                      <button style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "none", cursor: "pointer", color: "#8798b0" }} onClick={() => copyTemplate(inv)}><Send size={14} /></button>
                      <button style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "none", cursor: "pointer", color: "#8798b0" }}><ExternalLink size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {status && <p style={{ color: "#10b981", fontSize: 12, fontWeight: 700, marginTop: 12 }}>{status}</p>}
        </Card>
      </div>
    </div>
  );
}
  const copyTemplate = (inv) => {
    const intro = `Hi ${inv.name},\n\nWe’re building in ${industry || "our market"} to solve: ${problem || "a core customer pain"}. Traction: $${(revenue || 0).toLocaleString()} MRR, ${runwayMonths} months runway, ${(ltv / cac).toFixed(1)}x LTV/CAC. Would love to share a quick update.\n\n`;
    try {
      navigator.clipboard.writeText(intro);
      setStatus("Intro template copied");
      addToast("Intro copied to clipboard");
    } catch (err) {
      setStatus("Clipboard blocked — copy manually");
    }
  };
