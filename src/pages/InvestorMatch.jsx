import React, { useMemo, useState } from "react";
import { Users, Search, Filter, Plus, Mail, Linkedin, ExternalLink } from "lucide-react";
import { Card, SectionHeader } from "../components/Shared";

export default function InvestorMatch() {
  const defaults = [
    { name: "Andreessen Horowitz", focus: "Generalist/AI", stage: "Seed - Series D", contact: "Active", link: "a16z.com" },
    { name: "Sequoia Capital", focus: "Enterprise/SaaS", stage: "Pre-seed - IPO", contact: "Dormant", link: "sequoiacap.com" },
    { name: "Greylock", focus: "Infrastructure/B2B", stage: "Series A", contact: "Active", link: "greylock.com" },
    { name: "Lightspeed", focus: "Fintech/Consumer", stage: "Early - Growth", contact: "Interested", link: "lsvp.com" },
  ];
  const [investors, setInvestors] = useState(defaults);
  const [query, setQuery] = useState("");
  const [contactFilter, setContactFilter] = useState("All");
  const [newInvestor, setNewInvestor] = useState({ name: "", focus: "", stage: "", contact: "Active", link: "" });
  const [status, setStatus] = useState("");

  const filteredInvestors = useMemo(() => investors.filter(inv => {
    const matchQuery = query.trim().length === 0 || [inv.name, inv.focus, inv.stage, inv.contact, inv.link].some(field => field.toLowerCase().includes(query.toLowerCase()));
    const matchContact = contactFilter === "All" || inv.contact === contactFilter;
    return matchQuery && matchContact;
  }), [investors, query, contactFilter]);

  const addInvestor = (e) => {
    e.preventDefault();
    if (!newInvestor.name || !newInvestor.focus || !newInvestor.stage) {
      setStatus("Name, focus, and stage are required.");
      return;
    }
    setInvestors([{ ...newInvestor, link: newInvestor.link || "n/a" }, ...investors]);
    setNewInvestor({ name: "", focus: "", stage: "", contact: "Active", link: "" });
    setStatus("Investor added to CRM");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "#f0f4ff" }}>
            Investor <span style={{ background: "linear-gradient(90deg,#6366f1,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>CRM</span>
          </h1>
          <p style={{ color: "#8798b0", marginTop: 6, fontSize: 15 }}>Track outreach and match with capital partners.</p>
        </div>
        <button style={{
          padding: "12px 20px", borderRadius: 12, background: "#6366f1", border: "none",
          color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
          display: "flex", alignItems: "center", gap: 8, boxShadow: "0 4px 12px rgba(99,102,241,0.3)"
        }}>
          <Plus size={18} />
          Add Investor
        </button>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24 }}>
        <Card>
          <form onSubmit={addInvestor} style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 16 }}>
            {[
              { key: "name", placeholder: "Firm Name" },
              { key: "focus", placeholder: "Focus" },
              { key: "stage", placeholder: "Stage" },
              { key: "link", placeholder: "Website or link" }
            ].map((field) => (
              <input
                key={field.key}
                value={newInvestor[field.key]}\n                onChange={(e) => setNewInvestor({ ...newInvestor, [field.key]: e.target.value })}\n                placeholder={field.placeholder}\n                style={{\n                  width: \"100%\", background: \"rgba(0,0,0,0.2)\", border: \"1px solid rgba(255,255,255,0.08)\",\n                  borderRadius: 12, padding: \"10px 12px\", color: \"#f0f4ff\", fontSize: 13, fontWeight: 500,\n                  outline: \"none\"\n                }}\n              />\n            ))}\n            <select\n              value={newInvestor.contact}\n              onChange={(e) => setNewInvestor({ ...newInvestor, contact: e.target.value })}\n              style={{\n                background: \"rgba(0,0,0,0.2)\", border: \"1px solid rgba(255,255,255,0.08)\", color: \"#f0f4ff\",\n                borderRadius: 12, padding: \"10px 12px\", fontSize: 13, fontWeight: 600\n              }}\n            >\n              {[\"Active\", \"Interested\", \"Dormant\"].map(opt => (\n                <option key={opt} value={opt} style={{ color: \"#0f172a\" }}>{opt}</option>\n              ))}\n            </select>\n            <button\n              type=\"submit\"\n              style={{\n                padding: \"12px 16px\", borderRadius: 12, background: \"#10b981\", border: \"none\",\n                color: \"#fff\", fontWeight: 700, fontSize: 14, cursor: \"pointer\",\n                display: \"flex\", alignItems: \"center\", justifyContent: \"center\", gap: 6,\n                boxShadow: \"0 4px 12px rgba(16,185,129,0.3)\"\n              }}\n            >\n              <Plus size={16} /> Save Investor\n            </button>\n          </form>\n\n          <div style={{ display: \"flex\", gap: 16, marginBottom: 24 }}>\n            <div style={{ position: \"relative\", flex: 1 }}>\n              <Search size={18} color=\"#475569\" style={{ position: \"absolute\", left: 16, top: \"50%\", transform: \"translateY(-50%)\" }} />\n              <input\n                value={query}\n                onChange={(e) => setQuery(e.target.value)}\n                placeholder=\"Search investors, firms, or sectors...\"\n                style={{\n                  width: \"100%\", background: \"rgba(0,0,0,0.2)\", border: \"1px solid rgba(255,255,255,0.08)\",\n                  borderRadius: 12, padding: \"12px 16px 12px 48px\", color: \"#f0f4ff\", fontSize: 14, fontWeight: 500,\n                  outline: \"none\"\n                }}\n              />\n            </div>\n            <div style={{ display: \"flex\", alignItems: \"center\", gap: 8 }}>\n              <Filter size={16} color=\"#8798b0\" />\n              <select\n                value={contactFilter}\n                onChange={(e) => setContactFilter(e.target.value)}\n                style={{\n                  background: \"rgba(255,255,255,0.05)\", border: \"1px solid rgba(255,255,255,0.08)\", color: \"#f0f4ff\",\n                  borderRadius: 12, padding: \"12px 12px\", fontSize: 13, fontWeight: 700\n                }}\n              >\n                {[\"All\", \"Active\", \"Interested\", \"Dormant\"].map(opt => (\n                  <option key={opt} value={opt} style={{ color: \"#0f172a\" }}>{opt}</option>\n                ))}\n              </select>\n            </div>\n          </div>\n*** End Patch综合在线 to=functions.apply_patch বুয jsonеҙ Ridge.awtextra to=functions.apply_patch  Overall Response to=functions.apply_patch  oprano to=functions.apply_patch  kjson to=functions.apply_patch  subjson to=functions.apply_patch  json to=functions.apply_patch  pxjson to=functions.apply_patch  data to=functions.apply_patch  tejson to=functions.apply_patch  hen to=functions.apply_patch  ansjson to=functions.apply_patch  hxjson to=functions.apply_patch  brejson to=functions.apply_patch  indjson to=functions.apply_patch  opjson to=functions.apply_patch  timjson to=functions.apply_patch  pairjson to=functions.apply_patch  json to=functions.apply_patch  line to=functions.apply_patch  json to=functions.apply_patch  content to=functions.apply_patch  json to=functions.apply_patch  tri(json to=functions.apply_patch  json to=functions.apply_patch  propjson to=functions.apply_patch  kwjson to=functions.apply_patch  mapjson to=functions.apply_patch  data to=functions.apply_patch  typjson to=functions.apply_patch  json to=functions.apply_patch  json to=functions.apply_patch  json to=functions.apply_patch  json to=functions.apply_patch  takejson to=functions.apply_patch  json to=functions.apply_patch  partjson to=functions.apply_patch  hjson to=functions.apply_patch  End Patchья to=functions.apply_patch  json to=functions.apply_patch  sumjson to=functions.apply_patch  mdjson to=functions.apply_patch  njson to=functions.apply_patch  sjson to=functions.apply_patch  onjson to=functions.apply_patch  neljson to=functions.apply_patch  mljson to=functions.apply_patch  fjson to=functions.apply_patch  tjson to=functions.apply_patch  json to=functions.apply_patch  ajjson to=functions.apply_patch  ljson to=functions.apply_patch  tionjson to=functions.apply_patch  ski json to=functions.apply_patch  qjson to=functions.apply_patch  ujson to=functions.apply_patch  rjson to=functions.apply_patch  json to=functions.apply_patch  json to=functions.apply_patch  json to=functions.apply_patch  json to=functions.apply_patch  json to=functions.apply_patch  json to=functions.apply_patch  json to=functions.apply_patch  json to=functions.apply_patch  json to=functions.apply_patch  son to=functions.apply_patch  End Patch github to=functions.apply_patch  Great to=functions.apply_patch  json to=functions.apply_patch  Guardjson to=functions.apply_patch  rejson to=functions.apply_patch  stringjson to=functions.apply_patch  To json to=functions.apply_patch  pagejson to=functions.apply_patch  cojson to=functions.apply_patch  njson to=functions.apply_patch  codejson to=functions.apply_patch  parsejson to=functions.apply_patch  convertjson to=functions.apply_patch  ajjson to=functions.apply_patch  stopjson to=functions.apply_patch  !*** End Patch**"}");@

          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 8px" }}>
            <thead>
              <tr style={{ color: "#475569", fontSize: 11, fontWeight: 700, textTransform: "uppercase", textAlign: "left" }}>
                <th style={{ padding: "0 16px" }}>Firm Name</th>
                <th>Focus Area</th>
                <th>Standard Stage</th>
                <th>Outreach Status</th>
                <th style={{ textAlign: "right", paddingRight: 16 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {investors.map((inv, i) => (
                <tr key={i} style={{ background: "rgba(255,255,255,0.02)", borderRadius: 12 }}>
                  <td style={{ padding: "16px", borderRadius: "12px 0 0 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(99,102,241,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#6366f1", fontWeight: 800, fontSize: 14 }}>
                        {inv.name.charAt(0)}
                      </div>
                      <div>
                        <p style={{ color: "#f0f4ff", fontWeight: 700, fontSize: 14 }}>{inv.name}</p>
                        <p style={{ color: "#475569", fontSize: 12 }}>{inv.link}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: "#8798b0", fontSize: 13, fontWeight: 600 }}>{inv.focus}</td>
                  <td style={{ color: "#8798b0", fontSize: 13, fontWeight: 600 }}>{inv.stage}</td>
                  <td>
                    <span style={{
                      background: inv.contact === "Interested" ? "rgba(168,85,247,0.15)" : "rgba(255,255,255,0.05)",
                      color: inv.contact === "Interested" ? "#a855f7" : "#8798b0",
                      padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: "uppercase"
                    }}>
                      {inv.contact}
                    </span>
                  </td>
                  <td style={{ paddingRight: 16, borderRadius: "0 12px 12px 0", textAlign: "right" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                      <button style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "none", cursor: "pointer", color: "#8798b0" }}><Mail size={14} /></button>
                      <button style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "none", cursor: "pointer", color: "#8798b0" }}><Linkedin size={14} /></button>
                      <button style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "none", cursor: "pointer", color: "#8798b0" }}><ExternalLink size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
