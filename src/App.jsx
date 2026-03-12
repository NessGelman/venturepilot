
import React, { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Brain, BarChart3, Rocket, DollarSign, Users, FileText, Target } from "lucide-react";

export default function App() {

const [capital,setCapital]=useState(250000)
const [burn,setBurn]=useState(15000)
const [revenue,setRevenue]=useState(5000)
const [growth,setGrowth]=useState(8)
const [idea,setIdea]=useState("AI startup helping founders choose the best capital sources")

const runwayMonths=Math.max(1,Math.round(capital/burn))

const readinessScore=Math.min(100,Math.round((revenue*0.6+growth*50+runwayMonths*5)/10))

const chartData=Array.from({length:24}).map((_,i)=>({
month:i+1,
runway:Math.max(capital-burn*(i+1)+revenue*(i+1),0)
}))

const capitalStack=[
{name:"Venture Capital",value:growth>8?40:20},
{name:"Revenue Financing",value:revenue>5000?30:10},
{name:"Grants",value:20},
{name:"Angels",value:10}
]

const COLORS=["#6366f1","#22c55e","#f59e0b","#ef4444"]

const generateStrategy=()=>{
if(growth>10) return "Focus on venture capital and aggressive scaling."
if(revenue>burn) return "Consider revenue-based financing to avoid dilution."
return "Balance grants, angels, and venture capital."
}

const generatePitch=()=>{
return `
Startup: ${idea}

Problem: Founders struggle to navigate funding.

Solution: VenturePilot recommends optimal capital strategies.

Market: Millions of startups globally.

Why Now: AI enables intelligent funding recommendations.

Business Model: SaaS for founders and accelerators.
`
}

return (
<div style={{fontFamily:"system-ui",padding:30,background:"#f5f5f5",minHeight:"100vh"}}>
<div style={{maxWidth:1200,margin:"auto"}}>

<header style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
<div style={{display:"flex",gap:10,alignItems:"center"}}>
<Rocket/>
<h1>VenturePilot</h1>
</div>
</header>

<h2>Startup Dashboard</h2>
<p>Runway: {runwayMonths} months</p>
<p>Burn Rate: ${burn}</p>
<p>Investor Score: {readinessScore}/100</p>

<ResponsiveContainer width="100%" height={300}>
<LineChart data={chartData}>
<XAxis dataKey="month"/>
<YAxis/>
<Tooltip/>
<Line dataKey="runway"/>
</LineChart>
</ResponsiveContainer>

<h2>Capital Strategy</h2>

<input value={capital} onChange={(e)=>setCapital(Number(e.target.value))}/>
<input value={burn} onChange={(e)=>setBurn(Number(e.target.value))}/>
<input value={revenue} onChange={(e)=>setRevenue(Number(e.target.value))}/>
<input value={growth} onChange={(e)=>setGrowth(Number(e.target.value))}/>

<ResponsiveContainer width="100%" height={250}>
<PieChart>
<Pie data={capitalStack} dataKey="value" outerRadius={80} label>
{capitalStack.map((entry,index)=>(
<Cell key={index} fill={COLORS[index%COLORS.length]}/>
))}
</Pie>
<Tooltip/>
</PieChart>
</ResponsiveContainer>

<p>{generateStrategy()}</p>

<h2>AI Pitch Generator</h2>

<input value={idea} onChange={(e)=>setIdea(e.target.value)}/>

<pre style={{background:"#eee",padding:15}}>
{generatePitch()}
</pre>

</div>
</div>
)
}
