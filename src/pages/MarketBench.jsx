import React, { useMemo, useState } from "react";
import { BarChart3, Globe, Users, TrendingUp, Filter } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useApp } from "../context/AppContext";
import { Card, SectionHeader } from "../components/Shared";

export default function MarketBench() {
  const { growth, revenue, pipelineCoverage, ltv, cac } = useApp();
  const [sector, setSector] = useState("SaaS");
  const [region, setRegion] = useState("US");

  const benchmarks = useMemo(() => ([
    { metric: "MoM Growth", user: `${growth}%`, benchmark: "8-12%", status: growth >= 8 ? "Outperforming" : "Underperforming", color: growth >= 8 ? "#10b981" : "#ef4444" },
    { metric: "LTV/CAC", user: `${(ltv / cac).toFixed(1)}x`, benchmark: ">3x", status: ltv / cac >= 3 ? "Healthy" : "Weak", color: ltv / cac >= 3 ? "#10b981" : "#ef4444" },
    { metric: "Pipeline Cover", user: `${pipelineCoverage}%`, benchmark: "90-120%", status: pipelineCoverage >= 90 ? "Ready" : "Light", color: pipelineCoverage >= 90 ? "#10b981" : "#f59e0b" },
    { metric: "Revenue/Employee", user: `$${Math.round(revenue / 5)}k`, benchmark: "$15k", status: Math.round(revenue / 5) >= 15 ? "Efficient" : "Average", color: Math.round(revenue / 5) >= 15 ? "#10b981" : "#f59e0b" },
  ]), [growth, revenue, pipelineCoverage, ltv, cac]);

  const competitorData = [
    { name: "You", growth, ltv: (ltv / cac).toFixed(1), pipeline: pipelineCoverage },
    { name: "Top Quartile", growth: 12, ltv: 3.8, pipeline: 110 },
    { name: "Median", growth: 8, ltv: 2.9, pipeline: 80 },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <header>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "#f0f4ff" }}>
          Market <span style={{ background: "linear-gradient(90deg,#6366f1,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Intelligence</span>
        </h1>
        <p style={{ color: "#8798b0", marginTop: 6, fontSize: 15 }}>Benchmark your metrics against the top 1% of startups.</p>
      </header>

      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#8798b0", fontSize: 13 }}>
          <Filter size={14} />
          <span>Filters</span>
        </div>
        <select value={sector} onChange={(e) => setSector(e.target.value)} style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.08)", color: "#f0f4ff", padding: "8px 12px", borderRadius: 10, fontWeight: 700 }}>
          {["SaaS", "Fintech", "AI"].map(opt => <option key={opt} value={opt} style={{ color: "#0f172a" }}>{opt}</option>)}
        </select>
        <select value={region} onChange={(e) => setRegion(e.target.value)} style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.08)", color: "#f0f4ff", padding: "8px 12px", borderRadius: 10, fontWeight: 700 }}>
          {["US", "EU", "APAC"].map(opt => <option key={opt} value={opt} style={{ color: "#0f172a" }}>{opt}</option>)}
        </select>
        <p style={{ color: "#475569", fontSize: 12 }}>Showing {sector} peers in {region}</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
        <Card>
          <SectionHeader icon={Globe} title="Industry Benchmarks" subtitle="Comparison against Series A averages" />
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 12px" }}>
            <thead>
              <tr style={{ color: "#475569", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "left" }}>
                <th style={{ padding: "0 16px" }}>Metric</th>
                <th>Your Value</th>
                <th>Benchmark</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {benchmarks.map((b, i) => (
                <tr key={i} style={{ background: "rgba(255,255,255,0.02)", borderRadius: 12 }}>
                  <td style={{ padding: "16px", borderRadius: "12px 0 0 12px", color: "#f0f4ff", fontWeight: 700, fontSize: 14 }}>{b.metric}</td>
                  <td style={{ color: "#8798b0", fontWeight: 600 }}>{b.user}</td>
                  <td style={{ color: "#8798b0", fontWeight: 600 }}>{b.benchmark}</td>
                  <td style={{ borderRadius: "0 12px 12px 0" }}>
                    <span style={{
                      background: `${b.color}15`, color: b.color,
                      padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: "uppercase"
                    }}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <Card>
            <SectionHeader icon={BarChart3} title="Competitive Position" subtitle="You vs market percentiles" />
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={competitorData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#4a6080" />
                <YAxis stroke="#4a6080" />
                <Tooltip contentStyle={{ background: "#0d1420", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }} />
                <Bar dataKey="growth" name="MoM Growth" fill="#6366f1" radius={[6,6,0,0]} />
                <Bar dataKey="ltv" name="LTV/CAC" fill="#10b981" radius={[6,6,0,0]} />
                <Bar dataKey="pipeline" name="Pipeline %" fill="#f59e0b" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <SectionHeader icon={Users} title="Market Sentiment" subtitle="What VCs are saying" color="#10b981" />
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ padding: 16, borderRadius: 12, background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.1)" }}>
                <p style={{ color: "#10b981", fontSize: 13, fontWeight: 700 }}>AI/ML Sector: BULLISH</p>
                <p style={{ color: "#8798b0", fontSize: 12, marginTop: 4 }}>Investors are currently prioritizing horizontal AI applications with integrated workflows.</p>
              </div>
              <div style={{ padding: 16, borderRadius: 12, background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.1)" }}>
                <p style={{ color: "#f59e0b", fontSize: 13, fontWeight: 700 }}>Fintech: CAUTIOUS</p>
                <p style={{ color: "#8798b0", fontSize: 12, marginTop: 4 }}>High-interest environment is leading to longer diligence cycles for transaction-heavy models.</p>
              </div>
            </div>
          </Card>

          <Card style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <TrendingUp size={20} color="#6366f1" />
              <p style={{ color: "#f0f4ff", fontSize: 14, fontWeight: 700 }}>Market Edge Detected</p>
            </div>
            <p style={{ color: "#8798b0", fontSize: 13, marginTop: 12, lineHeight: 1.5 }}>
              Your LTV/CAC ratio is 7% higher than industry peers in the B2B SaaS segment. This is a key talking point for your Series A deck.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
