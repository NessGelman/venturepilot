import React, { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Area, AreaChart, CartesianGrid,
} from "recharts";
import {
  Rocket, TrendingUp, DollarSign, Clock, Target, Zap,
  ChevronRight, BarChart2, Cpu, Copy, Check,
} from "lucide-react";

/* ─── Design tokens (mirror CSS vars for chart usage) ─── */
const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#a855f7"];

/* ─── Custom tooltip for recharts ─── */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#111927",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 10,
      padding: "10px 14px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
    }}>
      <p style={{ color: "#8ba3c7", fontSize: 12, marginBottom: 4 }}>
        Month {label}
      </p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || "#6366f1", fontWeight: 600, fontSize: 14 }}>
          ${Number(p.value).toLocaleString()}
        </p>
      ))}
    </div>
  );
};

const PieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#111927",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 10,
      padding: "8px 12px",
    }}>
      <p style={{ color: "#f0f4ff", fontSize: 13, fontWeight: 600 }}>{payload[0].name}</p>
      <p style={{ color: "#8ba3c7", fontSize: 12 }}>{payload[0].value}%</p>
    </div>
  );
};

/* ─── Reusable components ─── */
function StatCard({ icon: Icon, label, value, sub, color = "#6366f1", glow }) {
  return (
    <div style={{
      background: "#111927",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 16,
      padding: "20px 24px",
      display: "flex",
      flexDirection: "column",
      gap: 8,
      position: "relative",
      overflow: "hidden",
      transition: "border-color 0.2s, transform 0.2s",
      boxShadow: glow ? `0 0 32px ${glow}` : "0 4px 24px rgba(0,0,0,0.4)",
    }}
    onMouseEnter={e => {
      e.currentTarget.style.borderColor = color + "60";
      e.currentTarget.style.transform = "translateY(-2px)";
    }}
    onMouseLeave={e => {
      e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
      e.currentTarget.style.transform = "translateY(0)";
    }}>
      {/* Background glow blob */}
      <div style={{
        position: "absolute", top: -20, right: -20, width: 80, height: 80,
        borderRadius: "50%", background: color + "18", filter: "blur(20px)",
        pointerEvents: "none",
      }} />

      <div style={{
        width: 38, height: 38, borderRadius: 10,
        background: color + "20",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <Icon size={18} color={color} />
      </div>
      <div>
        <p style={{ color: "#8ba3c7", fontSize: 12, fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" }}>
          {label}
        </p>
        <p style={{ color: "#f0f4ff", fontSize: 26, fontWeight: 700, lineHeight: 1.2, marginTop: 2 }}>
          {value}
        </p>
        {sub && <p style={{ color: "#4a6080", fontSize: 12, marginTop: 3 }}>{sub}</p>}
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, subtitle }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: "rgba(99,102,241,0.15)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <Icon size={16} color="#6366f1" />
      </div>
      <div>
        <h2 style={{ color: "#f0f4ff", fontSize: 18, fontWeight: 700, lineHeight: 1.2 }}>{title}</h2>
        {subtitle && <p style={{ color: "#4a6080", fontSize: 13, marginTop: 1 }}>{subtitle}</p>}
      </div>
    </div>
  );
}

function InputGroup({ label, value, onChange, prefix, suffix, min, max, step = 1000 }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ color: "#8ba3c7", fontSize: 12, fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" }}>
        {label}
      </label>
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        {prefix && (
          <span style={{
            position: "absolute", left: 12, color: "#4a6080",
            fontSize: 14, fontWeight: 600, pointerEvents: "none",
          }}>{prefix}</span>
        )}
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={e => onChange(Number(e.target.value))}
          style={{
            width: "100%",
            background: "#0a1220",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 10,
            color: "#f0f4ff",
            fontSize: 15,
            fontFamily: "inherit",
            fontWeight: 500,
            padding: `10px ${suffix ? "40px" : "12px"} 10px ${prefix ? "28px" : "12px"}`,
            outline: "none",
            transition: "border-color 0.2s, box-shadow 0.2s",
          }}
          onFocus={e => {
            e.target.style.borderColor = "rgba(99,102,241,0.5)";
            e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)";
          }}
          onBlur={e => {
            e.target.style.borderColor = "rgba(255,255,255,0.08)";
            e.target.style.boxShadow = "none";
          }}
        />
        {suffix && (
          <span style={{
            position: "absolute", right: 12, color: "#4a6080",
            fontSize: 12, pointerEvents: "none",
          }}>{suffix}</span>
        )}
      </div>
    </div>
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{
      background: "#111927",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 16,
      padding: 24,
      boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
      ...style,
    }}>
      {children}
    </div>
  );
}

/* ─── Score ring ─── */
function ScoreRing({ score }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const color = score >= 70 ? "#10b981" : score >= 40 ? "#f59e0b" : "#ef4444";
  return (
    <svg width={110} height={110} viewBox="0 0 110 110">
      <circle cx={55} cy={55} r={r} fill="none" stroke="#1a2a40" strokeWidth={10} />
      <circle
        cx={55} cy={55} r={r} fill="none"
        stroke={color} strokeWidth={10}
        strokeDasharray={`${fill} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 55 55)"
        style={{ transition: "stroke-dasharray 0.8s ease, stroke 0.4s" }}
      />
      <text x={55} y={52} textAnchor="middle" fill="#f0f4ff" fontSize={22} fontWeight={700} fontFamily="Inter,sans-serif">
        {score}
      </text>
      <text x={55} y={68} textAnchor="middle" fill="#4a6080" fontSize={11} fontFamily="Inter,sans-serif">
        /100
      </text>
    </svg>
  );
}

/* ─── Main App ─── */
export default function App() {
  const [capital, setCapital] = useState(250000);
  const [burn, setBurn] = useState(15000);
  const [revenue, setRevenue] = useState(5000);
  const [growth, setGrowth] = useState(8);
  const [idea, setIdea] = useState("AI startup helping founders choose the best capital sources");
  const [copied, setCopied] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    setTimeout(() => setAnimateIn(true), 50);
  }, []);

  const netBurn = Math.max(burn - revenue, 1);
  const runwayMonths = Math.max(1, Math.round(capital / netBurn));
  const readinessScore = Math.min(100, Math.round((revenue * 0.6 + growth * 50 + runwayMonths * 5) / 10));

  const chartData = Array.from({ length: 24 }).map((_, i) => ({
    month: i + 1,
    cash: Math.max(capital - burn * (i + 1) + revenue * (i + 1), 0),
  }));

  const breakEvenMonth = chartData.findIndex(d => d.cash <= 0);
  const breakEven = breakEvenMonth === -1 ? "24+" : breakEvenMonth + 1;

  const capitalStack = [
    { name: "Venture Capital", value: growth > 8 ? 40 : 20 },
    { name: "Revenue Financing", value: revenue > 5000 ? 30 : 10 },
    { name: "Grants", value: 20 },
    { name: "Angel Investors", value: 10 },
  ];
  // Normalize to 100
  const total = capitalStack.reduce((s, d) => s + d.value, 0);
  const normalizedStack = capitalStack.map(d => ({ ...d, value: Math.round((d.value / total) * 100) }));

  const strategyText =
    growth > 10
      ? "High growth trajectory — ideal for VC-led rounds. Prioritize scaling over profitability."
      : revenue > burn
        ? "Revenue exceeds burn — leverage revenue-based financing to grow without dilution."
        : "Early stage — mix of grants, angels, and seed VC will give you the best coverage.";

  const pitch = `🚀 ${idea}

PROBLEM
Founders waste months navigating fragmented funding options without expert guidance.

SOLUTION
VenturePilot uses AI to recommend the optimal capital strategy for each startup's stage, metrics, and goals.

MARKET
25M+ global startups. $300B+ in startup funding annually.

WHY NOW
AI has made intelligent, personalized funding recommendations accessible at scale.

TRACTION
Monthly Revenue: $${revenue.toLocaleString()} · Growth: ${growth}%/mo · Runway: ${runwayMonths} months

BUSINESS MODEL
SaaS subscription for founders + white-label API for accelerators and VCs.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(pitch);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fade = {
    opacity: animateIn ? 1 : 0,
    transform: animateIn ? "translateY(0)" : "translateY(12px)",
    transition: "opacity 0.5s ease, transform 0.5s ease",
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#080c14",
      backgroundImage: "radial-gradient(ellipse 60% 50% at 10% 0%, rgba(99,102,241,0.08) 0%, transparent 60%), radial-gradient(ellipse 40% 30% at 90% 80%, rgba(168,85,247,0.06) 0%, transparent 60%)",
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>

      {/* ── Navbar ── */}
      <nav style={{
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(8,12,20,0.8)",
        backdropFilter: "blur(12px)",
        position: "sticky", top: 0, zIndex: 100,
        padding: "0 32px",
      }}>
        <div style={{
          maxWidth: 1280, margin: "0 auto",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          height: 60,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: "linear-gradient(135deg,#6366f1,#a855f7)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 16px rgba(99,102,241,0.4)",
            }}>
              <Rocket size={16} color="#fff" />
            </div>
            <span style={{ fontWeight: 800, fontSize: 18, color: "#f0f4ff", letterSpacing: "-0.02em" }}>
              VenturePilot
            </span>
            <span style={{
              marginLeft: 4,
              background: "rgba(99,102,241,0.15)",
              border: "1px solid rgba(99,102,241,0.3)",
              color: "#818cf8",
              fontSize: 11, fontWeight: 600,
              padding: "2px 8px", borderRadius: 20, letterSpacing: "0.06em",
            }}>BETA</span>
          </div>

          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {["Dashboard", "Strategy", "Pitch"].map(item => (
              <button key={item} style={{
                background: "none", border: "none", cursor: "pointer",
                color: "#4a6080", fontSize: 14, fontWeight: 500,
                padding: "6px 14px", borderRadius: 8,
                transition: "color 0.2s, background 0.2s",
              }}
              onMouseEnter={e => { e.target.style.color = "#f0f4ff"; e.target.style.background = "rgba(255,255,255,0.05)"; }}
              onMouseLeave={e => { e.target.style.color = "#4a6080"; e.target.style.background = "none"; }}>
                {item}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 32px 64px" }}>

        {/* ── Page Hero ── */}
        <div style={{ ...fade, transitionDelay: "0s", marginBottom: 32 }}>
          <h1 style={{
            fontSize: 32, fontWeight: 800, color: "#f0f4ff",
            letterSpacing: "-0.03em", lineHeight: 1.2,
          }}>
            Startup Financial <span style={{
              background: "linear-gradient(90deg,#6366f1,#a855f7)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>Dashboard</span>
          </h1>
          <p style={{ color: "#4a6080", marginTop: 6, fontSize: 15 }}>
            Real-time capital strategy intelligence for founders
          </p>
        </div>

        {/* ── Main Layout: Sidebar + Content ── */}
        <div style={{ display: "flex", gap: 24, alignItems: "flex-start", ...fade, transitionDelay: "0.05s" }}>

          {/* ── Sidebar: Inputs ── */}
          <div style={{ width: 260, flexShrink: 0, display: "flex", flexDirection: "column", gap: 16 }}>

            <Card>
              <SectionHeader icon={Zap} title="Parameters" subtitle="Adjust your metrics" />
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <InputGroup
                  label="Capital Raised"
                  value={capital}
                  onChange={setCapital}
                  prefix="$" step={10000} min={0}
                />
                <InputGroup
                  label="Monthly Burn"
                  value={burn}
                  onChange={setBurn}
                  prefix="$" step={1000} min={0}
                />
                <InputGroup
                  label="Monthly Revenue"
                  value={revenue}
                  onChange={setRevenue}
                  prefix="$" step={1000} min={0}
                />
                <InputGroup
                  label="MoM Growth"
                  value={growth}
                  onChange={setGrowth}
                  suffix="%" step={1} min={0} max={100}
                />
              </div>
            </Card>

            {/* Investor Score */}
            <Card style={{ textAlign: "center" }}>
              <p style={{ color: "#8ba3c7", fontSize: 12, fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 12 }}>
                Investor Readiness
              </p>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <ScoreRing score={readinessScore} />
              </div>
              <p style={{ color: "#4a6080", fontSize: 12, marginTop: 12, lineHeight: 1.5 }}>
                {readinessScore >= 70
                  ? "Strong fundamentals — ready for outreach"
                  : readinessScore >= 40
                    ? "Improving — work on revenue & growth"
                    : "Early stage — focus on product-market fit"}
              </p>
            </Card>

          </div>

          {/* ── Main Content ── */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 24, minWidth: 0 }}>

            {/* ── Stat Cards Row ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
              <StatCard
                icon={Clock}
                label="Runway"
                value={`${runwayMonths} mo`}
                sub="at current burn rate"
                color="#6366f1"
                glow="rgba(99,102,241,0.1)"
              />
              <StatCard
                icon={DollarSign}
                label="Net Monthly Burn"
                value={`$${netBurn.toLocaleString()}`}
                sub={`Revenue covers ${Math.round((revenue / burn) * 100)}% of burn`}
                color="#10b981"
                glow="rgba(16,185,129,0.08)"
              />
              <StatCard
                icon={TrendingUp}
                label="Break-even"
                value={`Mo. ${breakEven}`}
                sub="estimated cash-out"
                color="#f59e0b"
                glow="rgba(245,158,11,0.08)"
              />
            </div>

            {/* ── Runway Chart ── */}
            <Card>
              <SectionHeader icon={BarChart2} title="Cash Runway Projection" subtitle="24-month forward view" />
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="cashGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.04)" />
                  <XAxis
                    dataKey="month" tick={{ fill: "#4a6080", fontSize: 11 }}
                    tickLine={false} axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
                    label={{ value: "Month", position: "insideBottom", offset: -2, fill: "#4a6080", fontSize: 11 }}
                  />
                  <YAxis
                    tick={{ fill: "#4a6080", fontSize: 11 }} tickLine={false}
                    axisLine={false}
                    tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
                    width={52}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone" dataKey="cash"
                    stroke="#6366f1" strokeWidth={2}
                    fill="url(#cashGrad)" dot={false}
                    activeDot={{ r: 5, fill: "#6366f1", strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            {/* ── Strategy + Pie Row ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

              {/* Capital Mix Pie */}
              <Card>
                <SectionHeader icon={Target} title="Capital Mix" subtitle="Recommended allocation" />
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <ResponsiveContainer width={170} height={170}>
                    <PieChart>
                      <Pie
                        data={normalizedStack} dataKey="value"
                        cx="50%" cy="50%"
                        innerRadius={48} outerRadius={78}
                        paddingAngle={3}
                      >
                        {normalizedStack.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {normalizedStack.map((d, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{
                          width: 10, height: 10, borderRadius: 3, flexShrink: 0,
                          background: COLORS[i % COLORS.length],
                        }} />
                        <span style={{ color: "#8ba3c7", fontSize: 12, lineHeight: 1.3 }}>{d.name}</span>
                        <span style={{ color: "#f0f4ff", fontSize: 12, fontWeight: 600, marginLeft: "auto" }}>{d.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* AI Strategy */}
              <Card>
                <SectionHeader icon={Cpu} title="AI Strategy" subtitle="Personalized recommendation" />
                <div style={{
                  background: "rgba(99,102,241,0.08)",
                  border: "1px solid rgba(99,102,241,0.2)",
                  borderRadius: 12, padding: 16,
                  marginBottom: 16,
                }}>
                  <p style={{ color: "#c7d2f0", fontSize: 14, lineHeight: 1.7 }}>
                    {strategyText}
                  </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    { label: "Dilution Risk", val: growth > 8 ? "High" : "Low", color: growth > 8 ? "#ef4444" : "#10b981" },
                    { label: "VC Appetite", val: growth > 10 ? "Strong" : growth > 5 ? "Moderate" : "Low", color: growth > 10 ? "#10b981" : growth > 5 ? "#f59e0b" : "#ef4444" },
                    { label: "Profitability", val: revenue > burn ? "Positive" : "Burning", color: revenue > burn ? "#10b981" : "#f59e0b" },
                  ].map(({ label, val, color }) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: "#4a6080", fontSize: 13 }}>{label}</span>
                      <span style={{
                        fontSize: 12, fontWeight: 600,
                        background: color + "18",
                        color,
                        padding: "2px 10px", borderRadius: 20,
                        border: `1px solid ${color}40`,
                      }}>{val}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* ── AI Pitch Generator ── */}
            <Card>
              <SectionHeader icon={Zap} title="AI Pitch Generator" subtitle="One-click investor deck narrative" />

              <div style={{ marginBottom: 16 }}>
                <label style={{ color: "#8ba3c7", fontSize: 12, fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
                  Your Startup Idea
                </label>
                <input
                  value={idea}
                  onChange={e => setIdea(e.target.value)}
                  placeholder="Describe your startup..."
                  style={{
                    width: "100%",
                    background: "#0a1220",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 10,
                    color: "#f0f4ff",
                    fontSize: 15,
                    fontFamily: "inherit",
                    padding: "11px 14px",
                    outline: "none",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = "rgba(99,102,241,0.5)";
                    e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)";
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = "rgba(255,255,255,0.08)";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              <div style={{
                background: "#0a1220",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 12,
                padding: "20px 20px 16px",
                position: "relative",
              }}>
                <button
                  onClick={handleCopy}
                  style={{
                    position: "absolute", top: 14, right: 14,
                    background: copied ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.06)",
                    border: `1px solid ${copied ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.08)"}`,
                    borderRadius: 8,
                    color: copied ? "#10b981" : "#8ba3c7",
                    cursor: "pointer",
                    padding: "5px 10px",
                    display: "flex", alignItems: "center", gap: 5,
                    fontSize: 12, fontWeight: 500,
                    transition: "all 0.2s",
                  }}>
                  {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
                </button>
                <pre style={{
                  whiteSpace: "pre-wrap",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 13,
                  lineHeight: 1.8,
                  color: "#8ba3c7",
                  margin: 0,
                  paddingRight: 60,
                }}>
                  {pitch}
                </pre>
              </div>
            </Card>

          </div>
        </div>

        {/* ── Footer ── */}
        <div style={{
          marginTop: 48,
          borderTop: "1px solid rgba(255,255,255,0.05)",
          paddingTop: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          ...fade, transitionDelay: "0.2s",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 24, height: 24, borderRadius: 7,
              background: "linear-gradient(135deg,#6366f1,#a855f7)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Rocket size={11} color="#fff" />
            </div>
            <span style={{ color: "#4a6080", fontSize: 13, fontWeight: 500 }}>VenturePilot</span>
          </div>
          <p style={{ color: "#2a3a50", fontSize: 12 }}>
            For illustrative purposes only · Not financial advice
          </p>
          <div style={{ display: "flex", gap: 16 }}>
            {["GitHub", "Docs", "Contact"].map(l => (
              <a key={l} href="#" style={{ color: "#4a6080", fontSize: 13, textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={e => e.target.style.color = "#8ba3c7"}
                onMouseLeave={e => e.target.style.color = "#4a6080"}>
                {l}
              </a>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
