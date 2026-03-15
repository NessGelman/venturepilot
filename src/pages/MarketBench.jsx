import React, { useEffect, useMemo, useState } from "react";
import { BarChart3, Globe, Users, TrendingUp, Filter } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useApp } from "../context/AppContext";
import { Card, SectionHeader } from "../components/Shared";

export default function MarketBench() {
  const { growth, revenue, pipelineCoverage, ltv, cac, industry } = useApp();

  const deriveSector = (text = "") => {
    const l = text.toLowerCase();
    if (/fintech|payment|bank/.test(l)) return "Fintech";
    if (/health|bio/.test(l)) return "Health";
    if (/ai|machine learning|ml/.test(l)) return "AI";
    if (/infra|cloud|dev/.test(l)) return "Infra";
    return "SaaS";
  };

  const sectorList = ["All","SaaS","AI","Fintech","Health","Infra"];
  const [sector, setSector] = useState(() => deriveSector(industry));
  const [region, setRegion] = useState("US");
  const [sectorIndex, setSectorIndex] = useState(() => sectorList.indexOf(deriveSector(industry)));

  useEffect(() => { setSector(deriveSector(industry)); }, [industry]);

  const sectorDefaults = {
    SaaS:   { growth: 10, ltv: 3.5, pipeline: 110 },
    AI:     { growth: 14, ltv: 3.2, pipeline: 120 },
    Fintech:{ growth: 9,  ltv: 3.0, pipeline: 105 },
    Health: { growth: 8,  ltv: 3.4, pipeline: 100 },
    Infra:  { growth: 11, ltv: 3.6, pipeline: 115 },
    All:    { growth: 9,  ltv: 3.2, pipeline: 105 },
  };

  const peer = sectorDefaults[sector] || sectorDefaults.All;
  const userLtv = ltv / cac;
  const userRev = Math.round(revenue / 5);

  const benchmarks = useMemo(() => [
    { metric: "MoM Growth",        user: `${growth}%`,      benchmark: `${peer.growth-2}–${peer.growth+2}%`, ok: growth >= peer.growth },
    { metric: "LTV/CAC",           user: `${userLtv.toFixed(1)}×`, benchmark: `>${peer.ltv}×`,            ok: userLtv >= peer.ltv },
    { metric: "Pipeline Cover",    user: `${pipelineCoverage}%`, benchmark: `${peer.pipeline-10}–${peer.pipeline+10}%`, ok: pipelineCoverage >= peer.pipeline },
    { metric: "Revenue/Employee",  user: `$${userRev}k`,    benchmark: "$15k",                             ok: userRev >= 15 },
  ], [growth, pipelineCoverage, userLtv, userRev, peer]);

  const competitorData = [
    { name: "You",          growth,               ltv: userLtv.toFixed(1),            pipeline: pipelineCoverage },
    { name: "Top Quartile", growth: peer.growth+2, ltv: (peer.ltv+0.3).toFixed(1),   pipeline: peer.pipeline+10 },
    { name: "Median",       growth: peer.growth,   ltv: peer.ltv.toFixed(1),          pipeline: peer.pipeline },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <header>
        <h1 style={{ fontSize: 30, fontWeight: 800, color: "#f0f4ff" }}>
          Market <span style={{ background: "linear-gradient(90deg,#6366f1,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Intelligence</span>
        </h1>
        <p style={{ color: "#8798b0", marginTop: 6, fontSize: 15 }}>Benchmark against the top 1% of startups, tuned to your industry.</p>
      </header>

      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <Filter size={14} color="#8798b0" />
        <select value={sector} onChange={e => setSector(e.target.value)} style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.08)", color: "#f0f4ff", padding: "8px 12px", borderRadius: 9, fontWeight: 700 }}>
          {sectorList.map(o => <option key={o} value={o} style={{ color: "#0f172a" }}>{o}</option>)}
        </select>
        <button onClick={() => { const next = (sectorIndex + 1) % sectorList.length; setSectorIndex(next); setSector(sectorList[next]); }}
          style={{ padding: "8px 12px", borderRadius: 9, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.06)", color: "#f0f4ff", fontWeight: 700, cursor: "pointer" }}>
          Next sector
        </button>
        <select value={region} onChange={e => setRegion(e.target.value)} style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.08)", color: "#f0f4ff", padding: "8px 12px", borderRadius: 9, fontWeight: 700 }}>
          {["US","EU","APAC"].map(o => <option key={o} value={o} style={{ color: "#0f172a" }}>{o}</option>)}
        </select>
        <p style={{ color: "#475569", fontSize: 12 }}>Showing <strong style={{ color: "#8798b0" }}>{sector}</strong> peers in <strong style={{ color: "#8798b0" }}>{region}</strong></p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
        <Card>
          <SectionHeader icon={Globe} title="Industry Benchmarks" subtitle="Comparison against Series A averages" />
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 10px" }}>
            <thead>
              <tr style={{ color: "#475569", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "left" }}>
                <th style={{ padding: "0 14px" }}>Metric</th>
                <th>Your Value</th>
                <th>Benchmark</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {benchmarks.map((b, i) => (
                <tr key={i} style={{ background: "rgba(255,255,255,0.02)" }}>
                  <td style={{ padding: "14px", borderRadius: "10px 0 0 10px", color: "#f0f4ff", fontWeight: 700, fontSize: 14 }}>{b.metric}</td>
                  <td style={{ color: "#8798b0", fontWeight: 600 }}>{b.user}</td>
                  <td style={{ color: "#8798b0", fontWeight: 600 }}>{b.benchmark}</td>
                  <td style={{ borderRadius: "0 10px 10px 0" }}>
                    <span style={{ background: `${b.ok ? "#10b981" : "#ef4444"}18`, color: b.ok ? "#10b981" : "#ef4444", padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>
                      {b.ok ? "Outperforming" : "Underperforming"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Card>
            <SectionHeader icon={BarChart3} title="Competitive Position" subtitle="You vs market percentiles" />
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={competitorData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#4a6080" fontSize={11} />
                <YAxis stroke="#4a6080" fontSize={11} />
                <Tooltip contentStyle={{ background: "#0d1420", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }} />
                <Bar dataKey="growth"   name="MoM Growth" fill="#6366f1" radius={[5,5,0,0]} />
                <Bar dataKey="ltv"      name="LTV/CAC"    fill="#10b981" radius={[5,5,0,0]} />
                <Bar dataKey="pipeline" name="Pipeline %"  fill="#f59e0b" radius={[5,5,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <SectionHeader icon={Users} title="Market Sentiment" subtitle="What VCs are saying" color="#10b981" />
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ padding: 14, borderRadius: 12, background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.12)" }}>
                <p style={{ color: "#10b981", fontSize: 13, fontWeight: 700 }}>AI/ML Sector: BULLISH</p>
                <p style={{ color: "#8798b0", fontSize: 12, marginTop: 4, lineHeight: 1.55 }}>Investors prioritizing horizontal AI apps with integrated workflows.</p>
              </div>
              <div style={{ padding: 14, borderRadius: 12, background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.12)" }}>
                <p style={{ color: "#f59e0b", fontSize: 13, fontWeight: 700 }}>Fintech: CAUTIOUS</p>
                <p style={{ color: "#8798b0", fontSize: 12, marginTop: 4, lineHeight: 1.55 }}>High-interest env leading to longer diligence for transaction-heavy models.</p>
              </div>
            </div>
          </Card>

          <Card style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <TrendingUp size={18} color="#6366f1" />
              <p style={{ color: "#f0f4ff", fontSize: 14, fontWeight: 700 }}>Market Edge Detected</p>
            </div>
            <p style={{ color: "#8798b0", fontSize: 13, lineHeight: 1.55 }}>
              Your LTV/CAC is {userLtv >= peer.ltv ? "above" : "approaching"} the {sector} peer median. Use this as a talking point in your Series A deck.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
