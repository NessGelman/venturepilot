import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";
import { Clock, DollarSign, TrendingUp, BarChart2, Target, Cpu, Users, Gauge, Download } from "lucide-react";
import { useApp } from "../context/AppContext";
import { StatCard, Card, SectionHeader } from "../components/Shared";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#a855f7"];

export default function Dashboard() {
  const {
    capital, burn, revenue, growth,
    headcount, cac, arpu, churn, pipeline,
    runwayMonths, netBurn, readinessScore,
    ltv, payback, revenuePerEmployee, pipelineCoverage, arr, mrr
  } = useApp();

  const chartData = Array.from({ length: 24 }).map((_, i) => ({
    month: i + 1,
    cash: Math.max(capital - (burn - revenue) * (i + 1), 0),
  }));

  const normalizedStack = [
    { name: "Venture Capital", value: growth > 8 ? 40 : 20 },
    { name: "Revenue Financing", value: revenue > 5000 ? 30 : 10 },
    { name: "Grants", value: 20 },
    { name: "Angel Investors", value: 10 },
  ];

  const efficiencyData = [
    { name: "LTV/CAC", value: (ltv / cac).toFixed(1) },
    { name: "Payback (mo)", value: payback },
    { name: "Rev/Employee", value: revenuePerEmployee },
    { name: "Pipeline Cover %", value: pipelineCoverage },
  ];

  const exportMetrics = () => {
    const rows = [
      ["metric", "value"],
      ["capital", capital],
      ["burn", burn],
      ["revenue_mrr", revenue],
      ["growth_percent", growth],
      ["headcount", headcount],
      ["cac", cac],
      ["arpu", arpu],
      ["churn_percent", churn],
      ["pipeline", pipeline],
      ["runway_months", runwayMonths],
      ["ltv", ltv],
      ["payback_months", payback],
      ["pipeline_coverage_percent", pipelineCoverage]
    ];
    const csv = rows.map(r => r.join(",")).join("\\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "venturepilot-metrics.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "#f0f4ff", letterSpacing: "-0.03em" }}>
            Financial <span style={{ background: "linear-gradient(90deg,#6366f1,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Overview</span>
          </h1>
          <p style={{ color: "#8798b0", marginTop: 6, fontSize: 15 }}>Real-time intelligence based on your current metrics.</p>
        </div>
        <button
          onClick={exportMetrics}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "12px 18px", borderRadius: 12,
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
            color: "#f0f4ff", fontWeight: 700, cursor: "pointer"
          }}
        >
          <Download size={16} /> Export Metrics CSV
        </button>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
        <StatCard icon={Clock} label="Runway" value={`${runwayMonths} mo`} sub="Until cash-out" color="#6366f1" glow="rgba(99,102,241,0.1)" />
        <StatCard icon={DollarSign} label="Monthly Net Burn" value={`$${netBurn.toLocaleString()}`} sub={`${Math.round((revenue / burn) * 100)}% coverage`} color="#10b981" glow="rgba(16,185,129,0.08)" />
        <StatCard icon={TrendingUp} label="Readiness Score" value={`${readinessScore}/100`} sub="Investor perspective" color="#f59e0b" glow="rgba(245,158,11,0.08)" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
        <StatCard icon={DollarSign} label="MRR" value={`$${mrr.toLocaleString()}`} sub="Recurring revenue" color="#22c55e" glow="rgba(34,197,94,0.08)" />
        <StatCard icon={Users} label="Headcount" value={headcount} sub={`$${revenuePerEmployee} rev/employee`} color="#38bdf8" glow="rgba(56,189,248,0.08)" />
        <StatCard icon={Gauge} label="Payback" value={`${payback} mo`} sub="CAC recovery" color="#a855f7" glow="rgba(168,85,247,0.08)" />
        <StatCard icon={BarChart2} label="Pipeline Cover" value={`${pipelineCoverage}%`} sub="12m / ARR" color="#f97316" glow="rgba(249,115,22,0.08)" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
        <Card>
          <SectionHeader icon={BarChart2} title="Cash Projection" subtitle="24-month forward-looking runway" />
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="month" stroke="#4a6080" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#4a6080" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value / 1000}k`} />
              <Tooltip
                contentStyle={{ background: "#0d1420", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, boxShadow: "0 10px 40px rgba(0,0,0,0.5)" }}
                itemStyle={{ color: "#f0f4ff", fontSize: 13, fontWeight: 600 }}
              />
              <Area type="monotone" dataKey="cash" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorCash)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <SectionHeader icon={Target} title="Capital Allocation" subtitle="Optimized funding mix" />
          <div style={{ height: 220, position: "relative" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={normalizedStack} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {normalizedStack.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "#0d1420", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
              <p style={{ fontSize: 11, color: "#8798b0", fontWeight: 700, textTransform: "uppercase" }}>Recommended</p>
              <p style={{ fontSize: 24, fontWeight: 800, color: "#f0f4ff" }}>Stack</p>
            </div>
          </div>
          <div style={{ marginTop: 24, display: "flex", flexWrap: "wrap", gap: 12 }}>
            {normalizedStack.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS[i] }} />
                <span style={{ fontSize: 12, color: "#8798b0", fontWeight: 600 }}>{item.name}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(168,85,247,0.1) 100%)" }}>
        <SectionHeader icon={Cpu} title="Venture AI Insights" subtitle="Financial health summary" color="#a855f7" />
        <p style={{ color: "#c7d2f0", fontSize: 15, lineHeight: 1.8, maxWidth: 800 }}>
          Your current metrics show a <strong>{runwayMonths}-month runway</strong> with a revenue growth rate of <strong>{growth}%</strong>.
          {growth > 10 ? " You are in the top tier of growth for early-stage SaaS." : " Focus on increasing MoM growth to improve investor appetite."}
          Based on your {readinessScore}/100 readiness score, we recommend initiating Series A conversations in the next 3 months.
        </p>
        <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {efficiencyData.map((item, i) => (
            <div key={i} style={{ padding: 14, borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <p style={{ color: "#64748b", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{item.name}</p>
              <p style={{ color: "#f0f4ff", fontSize: 18, fontWeight: 800 }}>{item.value}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
