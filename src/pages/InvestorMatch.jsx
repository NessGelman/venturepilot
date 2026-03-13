import React from "react";
import { Users, Search, Filter, Plus, Mail, Linkedin, ExternalLink } from "lucide-react";
import { Card, SectionHeader } from "../components/Shared";

export default function InvestorMatch() {
  const investors = [
    { name: "Andreessen Horowitz", focus: "Generalist/AI", stage: "Seed - Series D", contact: "Active", link: "a16z.com" },
    { name: "Sequoia Capital", focus: "Enterprise/SaaS", stage: "Pre-seed - IPO", contact: "Dormant", link: "sequoiacap.com" },
    { name: "Greylock", focus: "Infrastructure/B2B", stage: "Series A", contact: "Active", link: "greylock.com" },
    { name: "Lightspeed", focus: "Fintech/Consumer", stage: "Early - Growth", contact: "Interested", link: "lsvp.com" },
  ];

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
          <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
            <div style={{ position: "relative", flex: 1 }}>
              <Search size={18} color="#475569" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }} />
              <input
                placeholder="Search investors, firms, or sectors..."
                style={{
                  width: "100%", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 12, padding: "12px 16px 12px 48px", color: "#f0f4ff", fontSize: 14, fontWeight: 500,
                  outline: "none"
                }}
              />
            </div>
            <button style={{
              padding: "0 16px", borderRadius: 12, background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)", color: "#8798b0", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 8
            }}>
              <Filter size={16} />
              Filters
            </button>
          </div>

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
