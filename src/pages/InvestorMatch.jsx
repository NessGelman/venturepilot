import React, { useMemo, useState } from "react";
import { Users, Search, Filter, Plus, Mail, Linkedin, ExternalLink, CalendarClock, Send } from "lucide-react";
import { Card, SectionHeader } from "../components/Shared";
import { useApp } from "../context/AppContext";

export default function InvestorMatch() {
  const { industry, problem, revenue, runwayMonths, ltv, cac, addToast } = useApp();

  const defaults = [
    { name: "Andreessen Horowitz", focus: "Generalist/AI",      stage: "Seed–Series D",  contact: "Active",     link: "a16z.com",        note: "Warm intro via LP",          next: "2026-03-20" },
    { name: "Sequoia Capital",     focus: "Enterprise/SaaS",    stage: "Pre-seed–IPO",   contact: "Dormant",    link: "sequoiacap.com",  note: "Paused until Q2",            next: "2026-04-05" },
    { name: "Greylock",            focus: "Infrastructure/B2B", stage: "Series A",       contact: "Active",     link: "greylock.com",    note: "Interested in data moat",    next: "2026-03-28" },
    { name: "Lightspeed",          focus: "Fintech/Consumer",   stage: "Early–Growth",   contact: "Interested", link: "lsvp.com",        note: "Asked for KPI updates",      next: "2026-03-18" },
  ];

  const [investors, setInvestors] = useState(defaults);
  const [query, setQuery] = useState("");
  const [contactFilter, setContactFilter] = useState("All");
  const [newInv, setNewInv] = useState({ name: "", focus: "", stage: "", contact: "Active", link: "", note: "", next: "" });
  const [status, setStatus] = useState("");

  // Fixed: copyTemplate defined INSIDE the component
  const copyTemplate = (inv) => {
    const intro = `Hi ${inv.name},\n\nWe're building in ${industry || "our market"} to solve: ${problem || "a core customer pain"}. Traction: $${(revenue || 0).toLocaleString()} MRR, ${runwayMonths} months runway, ${(ltv / cac).toFixed(1)}x LTV/CAC. Would love to share a quick update.\n\n`;
    navigator.clipboard.writeText(intro).then(
      () => { setStatus("Intro template copied"); addToast("Intro copied to clipboard"); },
      () => setStatus("Clipboard blocked — copy manually")
    );
  };

  const filtered = useMemo(() => investors.filter(inv => {
    const q = query.toLowerCase();
    const matchQ = !q || [inv.name, inv.focus, inv.stage, inv.contact, inv.link, inv.note].some(f => f.toLowerCase().includes(q));
    const matchC = contactFilter === "All" || inv.contact === contactFilter;
    return matchQ && matchC;
  }), [investors, query, contactFilter]);

  const addInvestor = (e) => {
    e.preventDefault();
    if (!newInv.name || !newInv.focus || !newInv.stage) { setStatus("Name, focus, and stage required."); return; }
    setInvestors(prev => [{ ...newInv, link: newInv.link || "n/a", next: newInv.next || "2026-03-30" }, ...prev]);
    setNewInv({ name: "", focus: "", stage: "", contact: "Active", link: "", note: "", next: "" });
    setStatus("Investor added.");
  };

  const updateStatus = (idx, contact) => setInvestors(prev => prev.map((inv, i) => i === idx ? { ...inv, contact } : inv));
  const updateNext   = (idx, date)    => setInvestors(prev => prev.map((inv, i) => i === idx ? { ...inv, next: date } : inv));

  const counts = investors.reduce((acc, inv) => { acc[inv.contact] = (acc[inv.contact] || 0) + 1; return acc; }, {});

  const inputSt = { background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "9px 11px", color: "#f0f4ff", fontSize: 13, fontWeight: 500, outline: "none", width: "100%" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: "#f0f4ff" }}>
            Investor <span style={{ background: "linear-gradient(90deg,#6366f1,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>CRM</span>
          </h1>
          <p style={{ color: "#8798b0", marginTop: 6, fontSize: 15 }}>Track outreach, follow-ups, and warm intros.</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {["Active","Interested","Dormant"].map(b => (
            <div key={b} style={{ padding: "9px 14px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", color: "#8798b0", fontSize: 13, fontWeight: 700 }}>
              {b}: {counts[b] || 0}
            </div>
          ))}
        </div>
      </header>

      <Card>
        <SectionHeader icon={Users} title="Positioning Snapshot" subtitle="Lead with this in every intro" />
        <p style={{ color: "#c7d2f0", fontSize: 14, lineHeight: 1.6 }}>
          Space: <strong>{industry || "Set industry in sidebar"}</strong>. Problem solved: <strong>{problem || "Add the pain point in sidebar"}</strong>.
        </p>
      </Card>

      <Card>
        <form onSubmit={addInvestor} style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr) auto auto auto auto", gap: 10, marginBottom: 16, alignItems: "end" }}>
          {[
            { key: "name",  placeholder: "Firm Name *" },
            { key: "focus", placeholder: "Focus *" },
            { key: "stage", placeholder: "Stage *" },
            { key: "link",  placeholder: "Website" },
            { key: "note",  placeholder: "Notes" },
          ].map(f => (
            <input key={f.key} value={newInv[f.key]} onChange={e => setNewInv({ ...newInv, [f.key]: e.target.value })} placeholder={f.placeholder} style={inputSt} />
          ))}
          <input type="date" value={newInv.next} onChange={e => setNewInv({ ...newInv, next: e.target.value })} style={inputSt} />
          <select value={newInv.contact} onChange={e => setNewInv({ ...newInv, contact: e.target.value })} style={inputSt}>
            {["Active","Interested","Dormant"].map(o => <option key={o} value={o} style={{ color: "#0f172a" }}>{o}</option>)}
          </select>
          <button type="submit" style={{ padding: "9px 16px", borderRadius: 10, background: "#10b981", border: "none", color: "#fff", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13, whiteSpace: "nowrap" }}>
            <Plus size={14} /> Add
          </button>
        </form>

        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
            <Search size={16} color="#475569" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }} />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search investors…"
              style={{ ...inputSt, paddingLeft: 36 }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Filter size={14} color="#8798b0" />
            <select value={contactFilter} onChange={e => setContactFilter(e.target.value)} style={{ ...inputSt, width: "auto" }}>
              {["All","Active","Interested","Dormant"].map(o => <option key={o} value={o} style={{ color: "#0f172a" }}>{o}</option>)}
            </select>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 8px", minWidth: 700 }}>
            <thead>
              <tr style={{ color: "#475569", fontSize: 11, fontWeight: 700, textTransform: "uppercase", textAlign: "left" }}>
                <th style={{ padding: "0 14px" }}>Firm</th>
                <th>Focus</th>
                <th>Stage</th>
                <th>Status</th>
                <th>Next Touch</th>
                <th style={{ textAlign: "right", paddingRight: 14 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv, i) => (
                <tr key={i} style={{ background: "rgba(255,255,255,0.02)" }}>
                  <td style={{ padding: "14px", borderRadius: "10px 0 0 10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(99,102,241,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#6366f1", fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
                        {inv.name.charAt(0)}
                      </div>
                      <div>
                        <p style={{ color: "#f0f4ff", fontWeight: 700, fontSize: 13 }}>{inv.name}</p>
                        {inv.note && <p style={{ color: "#8798b0", fontSize: 11 }}>{inv.note}</p>}
                      </div>
                    </div>
                  </td>
                  <td style={{ color: "#8798b0", fontSize: 13, fontWeight: 600 }}>{inv.focus}</td>
                  <td style={{ color: "#8798b0", fontSize: 13, fontWeight: 600 }}>{inv.stage}</td>
                  <td>
                    <select value={inv.contact} onChange={e => updateStatus(i, e.target.value)}
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#f0f4ff", padding: "7px 9px", borderRadius: 8, fontWeight: 700, fontSize: 12 }}>
                      {["Active","Interested","Dormant"].map(o => <option key={o} value={o} style={{ color: "#0f172a" }}>{o}</option>)}
                    </select>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <CalendarClock size={13} color="#8798b0" />
                      <input type="date" value={inv.next} onChange={e => updateNext(i, e.target.value)}
                        style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.08)", color: "#f0f4ff", borderRadius: 8, padding: "7px 9px", fontWeight: 700, fontSize: 12 }} />
                    </div>
                  </td>
                  <td style={{ paddingRight: 14, borderRadius: "0 10px 10px 0", textAlign: "right" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
                      {[Mail, Linkedin, Send, ExternalLink].map((Icon, idx) => (
                        <button key={idx} onClick={idx === 2 ? () => copyTemplate(inv) : undefined}
                          style={{ width: 30, height: 30, borderRadius: 7, background: "rgba(255,255,255,0.05)", border: "none", cursor: "pointer", color: "#8798b0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Icon size={13} />
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {status && <p style={{ color: "#10b981", fontSize: 12, fontWeight: 700, marginTop: 12 }}>{status}</p>}
      </Card>
    </div>
  );
}
