import React from "react";
import { BarChart3, Globe, Users, TrendingUp } from "lucide-react";
import { useApp } from "../context/AppContext";
import { Card, SectionHeader } from "../components/Shared";

export default function MarketBench() {
  const { growth, revenue } = useApp();

  const benchmarks = [
    { metric: "MoM Growth", user: `${growth}%`, benchmark: "8-12%", status: growth >= 8 ? "Outperforming" : "Underperforming", color: growth >= 8 ? "#10b981" : "#ef4444" },
    { metric: "LTV/CAC", user: "3.2x", benchmark: ">3x", status: "Healthy", color: "#10b981" },
    { metric: "Churn Rate", user: "2.1%", benchmark: "<3%", status: "Strong", color: "#10b981" },
    { metric: "Revenue/Employee", user: `$${Math.round(revenue / 5)}k`, benchmark: "$15k", status: "Average", color: "#f59e0b" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <header>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "#f0f4ff" }}>
          Market <span style={{ background: "linear-gradient(90deg,#6366f1,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Intelligence</span>
        </h1>
        <p style={{ color: "#8798b0", marginTop: 6, fontSize: 15 }}>Benchmark your metrics against the top 1% of startups.</p>
      </header>

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
