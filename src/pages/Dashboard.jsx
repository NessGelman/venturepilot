import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";
import { Clock, DollarSign, TrendingUp, BarChart2, Target, Cpu, Users, Gauge, Download, AlertTriangle, Activity } from "lucide-react";
import { useApp } from "../context/AppContext";
import { StatCard, Card, SectionHeader } from "../components/Shared";

const COLORS = ["#6366f1","#10b981","#f59e0b","#a855f7"];

export default function Dashboard() {
  const {
    capital, burn, revenue, growth, headcount, cac, arpu, churn, pipeline,
    runwayMonths, netBurn, readinessScore, ltv, payback,
    revenuePerEmployee, pipelineCoverage, arr, mrr,
    industry, problem, founder, stage, northStar,
    dailySnapshots, addToast
  } = useApp();

  const chartData = Array.from({ length: 24 }).map((_, i) => ({
    month: i + 1,
    cash: Math.max(capital - (burn - revenue) * (i + 1), 0),
  }));

  const capitalStack = [
    { name: "Venture Capital",    value: growth > 8 ? 40 : 20 },
    { name: "Revenue Financing",  value: revenue > 5000 ? 30 : 10 },
    { name: "Grants",             value: 20 },
    { name: "Angel Investors",    value: 10 },
  ];

  const efficiencyItems = [
    { name: "LTV/CAC",         value: (ltv / cac).toFixed(1) },
    { name: "Payback (mo)",    value: payback },
    { name: "Rev/Employee",    value: `$${revenuePerEmployee}` },
    { name: "Pipeline Cover %",value: pipelineCoverage },
  ];

  const alerts = [];
  if (runwayMonths < 6)   alerts.push("Runway under 6 months — extend or raise.");
  if (growth < 8)          alerts.push("Growth below 8% MoM — revisit GTM.");
  if (ltv / cac < 3)      alerts.push("LTV/CAC below 3× — efficiency risk.");
  if (payback > 12)        alerts.push("Payback over 12 months — tighten CAC.");

  const monteCarlo = () => {
    const trials = 200; let under6 = 0;
    const buckets = [0,3,6,9,12,18,24];
    const dist = buckets.map(b => ({ bucket: b, count: 0 }));
    for (let i = 0; i < trials; i++) {
      const g = Math.max(-20, growth + (Math.random() - 0.5) * 25);
      const b = burn * (1 + (Math.random() - 0.5) * 0.15);
      const rw = capital / Math.max(b - revenue * Math.pow(1 + g / 100, 1), 1);
      if (rw < 6) under6++;
      const bi = buckets.findIndex((x, idx) => rw >= x && (idx === buckets.length - 1 || rw < buckets[idx + 1]));
      if (bi >= 0) dist[bi].count += 1;
    }
    return {
      risk: Math.round((under6 / trials) * 100),
      dist: dist.map(d => ({ ...d, prob: Math.round((d.count / trials) * 100) }))
    };
  };
  const mc = monteCarlo();

  const exportMetrics = () => {
    const rows = [["metric","value"],["capital",capital],["burn",burn],["revenue_mrr",revenue],["growth_percent",growth],["headcount",headcount],["cac",cac],["arpu",arpu],["churn_percent",churn],["pipeline",pipeline],["runway_months",runwayMonths],["ltv",ltv],["payback_months",payback],["pipeline_coverage_percent",pipelineCoverage]];
    const blob = new Blob([rows.map(r => r.join(",")).join("\n")], { type: "text/csv" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: "venturepilot-metrics.csv" });
    a.click(); URL.revokeObjectURL(a.href);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: "#f0f4ff", letterSpacing: "-0.03em" }}>
            Financial <span style={{ background: "linear-gradient(90deg,#6366f1,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Overview</span>
          </h1>
          <p style={{ color: "#8798b0", marginTop: 6, fontSize: 15 }}>Real-time intelligence based on your current metrics.</p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={exportMetrics} style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 16px", borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#f0f4ff", fontWeight: 700, cursor: "pointer" }}>
            <Download size={15} /> Export CSV
          </button>
          <button onClick={() => {
            const s = `Runway: ${runwayMonths}mo | Growth: ${growth}% | MRR: $${mrr.toLocaleString()} | LTV/CAC: ${(ltv/cac).toFixed(1)}x | Payback: ${payback}mo | Pipeline: ${pipelineCoverage}%`;
            navigator.clipboard.writeText(s).then(() => addToast("Summary copied"), () => addToast("Clipboard blocked"));
          }} style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 16px", borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#f0f4ff", fontWeight: 700, cursor: "pointer" }}>
            Copy Summary
          </button>
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
        <StatCard icon={Clock}     label="Runway"           value={`${runwayMonths} mo`}       sub="Until cash-out"           color="#6366f1" glow="rgba(99,102,241,0.1)" />
        <StatCard icon={DollarSign} label="Monthly Net Burn" value={`$${netBurn.toLocaleString()}`} sub={`${Math.round((revenue/burn)*100)}% coverage`} color="#10b981" glow="rgba(16,185,129,0.08)" />
        <StatCard icon={TrendingUp} label="Readiness Score"  value={`${readinessScore}/100`}   sub="Investor perspective"     color="#f59e0b" glow="rgba(245,158,11,0.08)" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
        <StatCard icon={DollarSign} label="MRR"           value={`$${mrr.toLocaleString()}`}   sub="Recurring revenue"        color="#22c55e" />
        <StatCard icon={Users}      label="Headcount"     value={headcount}                    sub={`$${revenuePerEmployee}/emp`} color="#38bdf8" />
        <StatCard icon={Gauge}      label="Payback"       value={`${payback} mo`}             sub="CAC recovery"             color="#a855f7" />
        <StatCard icon={BarChart2}  label="Pipeline Cover" value={`${pipelineCoverage}%`}     sub="12m pipeline / ARR"       color="#f97316" />
      </div>

      <Card>
        <SectionHeader icon={Users} title="Profile Snapshot" subtitle="Personalized for your team" color="#38bdf8" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
          {[["Founder / Team", founder],["Stage", stage],["Industry", industry || "Set in sidebar"],["North Star", northStar]].map(([label, value], i) => (
            <div key={i} style={{ padding: 14, borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <p style={{ color: "#64748b", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>{label}</p>
              <p style={{ color: "#f0f4ff", fontWeight: 800, fontSize: 14, marginTop: 5 }}>{value || "—"}</p>
            </div>
          ))}
        </div>
      </Card>

      {alerts.length > 0 && (
        <Card style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)" }}>
          <SectionHeader icon={AlertTriangle} title="Risk Alerts" subtitle="Priority issues detected" color="#ef4444" />
          <ul style={{ display: "grid", gap: 8, paddingLeft: 4, listStyle: "none" }}>
            {alerts.map((a, i) => (
              <li key={i} style={{ fontWeight: 700, fontSize: 13, color: "#fca5a5", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", display: "inline-block", flexShrink: 0 }} />
                {a}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card>
        <SectionHeader icon={Activity} title="Monte Carlo Runway" subtitle="Prob. of running out < 6 months (200 trials)" color="#22c55e" />
        <p style={{ color: "#f0f4ff", fontSize: 26, fontWeight: 800 }}>{mc.risk}%</p>
        <p style={{ color: "#8798b0", fontSize: 13, marginBottom: 12 }}>Based on 200 trials with burn/growth variance of ±25%.</p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={mc.dist}>
            <XAxis dataKey="bucket" tickFormatter={v => `${v}m`} stroke="#4a6080" />
            <YAxis stroke="#4a6080" />
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <Tooltip contentStyle={{ background: "#0d1420", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }} />
            <Bar dataKey="prob" name="% Trials" fill="#22c55e" radius={[6,6,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {dailySnapshots.length > 1 && (
        <Card>
          <SectionHeader icon={Activity} title="Daily Snapshots" subtitle="Auto-captured trailing 30d" color="#38bdf8" />
          <button onClick={() => {
            const rows = [["date","runwayMonths","revenue","burn","growth"],...dailySnapshots.map(s => [s.date,s.runwayMonths??"",s.revenue??"",s.burn??"",s.growth??""])];
            const blob = new Blob([rows.map(r => r.join(",")).join("\n")], { type: "text/csv" });
            const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: "snapshots.csv" });
            a.click(); addToast("Snapshots exported");
          }} style={{ padding: "8px 12px", borderRadius: 9, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#c7d2f0", fontWeight: 700, marginBottom: 12, cursor: "pointer", fontSize: 12 }}>
            Export Snapshots CSV
          </button>
          <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 6 }}>
            {dailySnapshots.map(s => (
              <div key={s.date} style={{ minWidth: 100, padding: 10, borderRadius: 9, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", flexShrink: 0 }}>
                <p style={{ color: "#64748b", fontSize: 10, fontWeight: 700 }}>{s.date}</p>
                <p style={{ color: "#f0f4ff", fontSize: 14, fontWeight: 800 }}>RW {s.runwayMonths || "—"}m</p>
                <p style={{ color: "#8798b0", fontSize: 11 }}>${(s.revenue || 0).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
        <Card>
          <SectionHeader icon={BarChart2} title="Cash Projection" subtitle="24-month forward-looking runway" />
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="month" stroke="#4a6080" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#4a6080" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: "#0d1420", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
              <Area type="monotone" dataKey="cash" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorCash)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <SectionHeader icon={Target} title="Capital Allocation" subtitle="Optimized funding mix" />
          <div style={{ height: 220, position: "relative" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={capitalStack} innerRadius={58} outerRadius={78} paddingAngle={5} dataKey="value">
                  {capitalStack.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#0d1420", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center", pointerEvents: "none" }}>
              <p style={{ fontSize: 10, color: "#8798b0", fontWeight: 700, textTransform: "uppercase" }}>Recommended</p>
              <p style={{ fontSize: 22, fontWeight: 800, color: "#f0f4ff" }}>Stack</p>
            </div>
          </div>
          <div style={{ marginTop: 20, display: "flex", flexWrap: "wrap", gap: 10 }}>
            {capitalStack.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS[i] }} />
                <span style={{ fontSize: 12, color: "#8798b0", fontWeight: 600 }}>{item.name}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card style={{ background: "linear-gradient(135deg,rgba(99,102,241,0.1) 0%,rgba(168,85,247,0.1) 100%)" }}>
        <SectionHeader icon={Cpu} title="Venture AI Insights" subtitle="Financial health summary" color="#a855f7" />
        <p style={{ color: "#c7d2f0", fontSize: 15, lineHeight: 1.8, maxWidth: 820 }}>
          Your current metrics show a <strong>{runwayMonths}-month runway</strong> with a revenue growth rate of <strong>{growth}%</strong>.
          {growth > 10 ? " You are in the top tier of growth for early-stage SaaS." : " Focus on increasing MoM growth to improve investor appetite."}
          {" "}Operating in <strong>{industry || "your market"}</strong>, you're tackling: {problem || "a core pain for your segment"}.
          Based on your {readinessScore}/100 readiness score, {readinessScore > 65 ? "initiate Series A conversations now." : "focus on hitting $15k MRR before fundraising."}
        </p>
        <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
          {efficiencyItems.map((item, i) => (
            <div key={i} style={{ padding: 14, borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <p style={{ color: "#64748b", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{item.name}</p>
              <p style={{ color: "#f0f4ff", fontSize: 18, fontWeight: 800, marginTop: 4 }}>{item.value}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
