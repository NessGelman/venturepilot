import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";
import { Clock, DollarSign, TrendingUp, BarChart2, Target, Cpu, Users, Gauge, Download, AlertTriangle, Activity } from "lucide-react";
import { useApp } from "../context/AppContext";
import { StatCard, Card, SectionHeader } from "../components/Shared";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#a855f7"];

export default function Dashboard() {
  const {
    capital, burn, revenue, growth,
    headcount, cac, arpu, churn, pipeline,
    runwayMonths, netBurn, readinessScore,
    ltv, payback, revenuePerEmployee, pipelineCoverage, arr, mrr,
    industry, problem,
    dailySnapshots,
    addToast
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
    { name: "Problem Focus", value: problem?.slice(0, 24) || "Set in sidebar" },
  ];

  const alerts = [];
  if (runwayMonths < 6) alerts.push("Runway under 6 months — extend or raise.");
  if (growth < 8) alerts.push("Growth below 8% MoM — revisit GTM.");
  if (ltv / cac < 3) alerts.push("LTV/CAC below 3x — efficiency risk.");
  if (payback > 12) alerts.push("Payback over 12 months — tighten CAC.");

  const monteCarlo = () => {
    const trials = 200;
    let under6 = 0;
    const buckets = [0, 3, 6, 9, 12, 18, 24];
    const dist = buckets.map((b) => ({ bucket: b, count: 0 }));
    for (let i = 0; i < trials; i++) {
      const vol = 0.25; // volatility
      const g = Math.max(-20, growth + (Math.random() - 0.5) * vol * 100);
      const b = burn * (1 + (Math.random() - 0.5) * 0.15);
      const r = revenue * Math.pow(1 + g / 100, 12);
      const nb = Math.max(b - r / 12, 1);
      const rw = capital / nb;
      if (rw < 6) under6++;
      const bucketIndex = buckets.findIndex((x, idx) => rw >= x && (idx === buckets.length - 1 || rw < buckets[idx + 1]));
      if (bucketIndex >= 0) dist[bucketIndex].count += 1;
    }
    return { risk: Math.round((under6 / trials) * 100), dist: dist.map(d => ({ ...d, prob: Math.round((d.count / trials) * 100) })) };
  };
  const mc = monteCarlo();

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
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "#f0f4ff", letterSpacing: "-0.03em" }}>
            Financial <span style={{ background: "linear-gradient(90deg,#6366f1,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Overview</span>
          </h1>
          <p style={{ color: "#8798b0", marginTop: 6, fontSize: 15 }}>Real-time intelligence based on your current metrics.</p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
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
          <button
            onClick={() => {
              const summary = `Runway: ${runwayMonths} mo | Growth: ${growth}% | MRR: $${mrr} | LTV/CAC: ${(ltv / cac).toFixed(1)}x | Payback: ${payback} mo | Pipeline: ${pipelineCoverage}%`;
              navigator.clipboard.writeText(summary).then(() => addToast("Metrics summary copied"), () => addToast("Clipboard blocked"));
            }}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "12px 18px", borderRadius: 12,
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
              color: "#f0f4ff", fontWeight: 700, cursor: "pointer"
            }}
          >
            Copy Summary
          </button>
        </div>
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

      <Card>
        <SectionHeader icon={Users} title="Profile Snapshot" subtitle="Personalized for your team" color="#38bdf8" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {[
            { label: "Founder / Team", value: useApp().founder },
            { label: "Stage", value: useApp().stage },
            { label: "Industry", value: industry || "Set in sidebar" },
            { label: "North Star", value: useApp().northStar },
          ].map((item, i) => (
            <div key={i} style={{ padding: 14, borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <p style={{ color: "#64748b", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>{item.label}</p>
              <p style={{ color: "#f0f4ff", fontWeight: 800, fontSize: 15, marginTop: 6 }}>{item.value || "—"}</p>
            </div>
          ))}
        </div>
      </Card>

      {alerts.length > 0 && (
        <Card style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)" }}>
          <SectionHeader icon={AlertTriangle} title="Risk Alerts" subtitle="Priority issues detected" color="#ef4444" />
          <ul style={{ marginLeft: 18, color: "#fca5a5", display: "grid", gap: 8, paddingLeft: 4 }}>
            {alerts.map((a, i) => <li key={i} style={{ fontWeight: 700, fontSize: 13 }}>{a}</li>)}
          </ul>
        </Card>
      )}

      <Card>
        <SectionHeader icon={Activity} title="Monte Carlo Runway" subtitle="Prob. of running out < 6 months" color="#22c55e" />
        <p style={{ color: "#f0f4ff", fontSize: 26, fontWeight: 800 }}>{mc.risk}%</p>
        <p style={{ color: "#8798b0", fontSize: 13 }}>Based on 200 trials with burn/growth variance.</p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={mc.dist}>
            <XAxis dataKey="bucket" tickFormatter={(v) => `${v}m`} stroke="#4a6080" />
            <YAxis stroke="#4a6080" />
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <Tooltip contentStyle={{ background: "#0d1420", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }} />
            <Bar dataKey="prob" fill="#22c55e" radius={[6,6,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {dailySnapshots.length > 1 && (
        <Card>
          <SectionHeader icon={Activity} title="Daily Snapshots" subtitle="Auto-captured trailing 30d" color="#38bdf8" />
          <button
            onClick={() => {
              const rows = [["date","runwayMonths","revenue","burn","growth"]];
              dailySnapshots.forEach(s => rows.push([s.date, s.runwayMonths ?? "", s.revenue ?? "", s.burn ?? "", s.growth ?? ""]));
              const csv = rows.map(r => r.join(",")).join("\\n");
              const blob = new Blob([csv], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "venturepilot-snapshots.csv";
              a.click();
              URL.revokeObjectURL(url);
              addToast("Snapshots CSV exported");
            }}
            style={{ padding: "8px 12px", borderRadius: 10, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#c7d2f0", fontWeight: 700, marginBottom: 10, cursor: "pointer" }}
          >
            Export Snapshots CSV
          </button>
          <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 6 }}>
            {dailySnapshots.map((s) => (
              <div key={s.date} style={{ minWidth: 110, padding: 10, borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <p style={{ color: "#64748b", fontSize: 11, fontWeight: 700 }}>{s.date}</p>
                <p style={{ color: "#f0f4ff", fontSize: 14, fontWeight: 800 }}>RW {s.runwayMonths || "—"}m</p>
                <p style={{ color: "#8798b0", fontSize: 12 }}>Rev ${s.revenue || 0}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

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
          Operating in <strong>{industry || "your market"}</strong>, you’re tackling: {problem || "a core pain for your segment" }.
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
