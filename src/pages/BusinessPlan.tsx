import React, { useState, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Download, ChevronRight,
  Users, Rocket, BarChart2,
  Globe, Lightbulb, BookOpen,
  Sparkles, RefreshCcw, AlertCircle, Loader2
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { PageHeader, Card, Button, Badge } from '../components/Shared';

const fmt = (n: number, prefix = '$') => {
  if (n >= 1e9) return `${prefix}${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${prefix}${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${prefix}${(n / 1e3).toFixed(0)}K`;
  return `${prefix}${Math.round(n)}`;
};
function fmtPct(n: number) { return `${n.toFixed(1)}%`; }

interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
}

const SECTIONS: Section[] = [
  { id: 'executive', title: 'Executive Summary', icon: <BookOpen size={15} />, color: '#3b82f6' },
  { id: 'market', title: 'Market Analysis', icon: <Globe size={15} />, color: '#14b8a6' },
  { id: 'product', title: 'Product & Technology', icon: <Lightbulb size={15} />, color: '#3b82f6' },
  { id: 'gtm', title: 'Go-to-Market Strategy', icon: <Rocket size={15} />, color: '#f59e0b' },
  { id: 'financials', title: 'Financial Projections', icon: <BarChart2 size={15} />, color: '#10b981' },
  { id: 'team', title: 'Team & Organization', icon: <Users size={15} />, color: '#ec4899' },
];

// Build a rich data snapshot string for prompts
function buildDataContext(state: any, derived: any) {
  const name = state.companyName || state.idea || 'the company';
  const mrr = state.revenue || 0;
  const arr = mrr * 12;
  const netBurnCtx = Math.max(state.burn - mrr, 0);
  const runwayMonths = netBurnCtx === 0 ? 999 : (state.capital ? Math.round(state.capital / netBurnCtx) : 0);
  const burnMultiple = arr > 0 ? ((state.burn * 12) / arr).toFixed(1) : 'N/A';
  const ltv = state.arpu ? Math.round(state.arpu / Math.max((state.churn || 1) / 100, 0.01)) : 0;
  const ltvCac = state.cac > 0 && ltv > 0 ? (ltv / state.cac).toFixed(1) : 'N/A';

  return `
Company: ${name}
Concept: ${state.idea || 'N/A'}
Stage: ${state.stage || 'Seed'}
Industry: ${state.industry || 'B2B SaaS'}
Revenue Model: ${state.revenueModel || 'SaaS'}

Problem: ${state.problem || 'N/A'}
Solution: ${state.solutionStatement || state.productDescription || 'N/A'}
Unique Insight: ${state.uniqueInsight || 'N/A'}

Financials:
- MRR: ${fmt(mrr)}, ARR: ${fmt(arr)}
- MoM Growth: ${state.growth || 0}%
- Gross Margin: ${state.grossMargin || 70}%
- NDR: ${state.ndr || 100}%
- Monthly Burn: ${fmt(state.burn || 0)}
- Capital on Hand: ${fmt(state.capital || 0)}
- Runway: ${runwayMonths} months
- Burn Multiple: ${burnMultiple}x
- Target Raise: ${fmt(state.targetRaise || 0)}
- Valuation Cap: ${fmt(state.valuation || 0)}

Unit Economics:
- CAC: ${fmt(state.cac || 0)}
- ARPU/mo: ${fmt(state.arpu || 0)}
- Monthly Churn: ${state.churn || 0}%
- LTV: ${fmt(ltv)}
- LTV:CAC: ${ltvCac}x

Market:
- TAM: ${fmt(state.tam || 0)}
- SAM: ${fmt(state.sam || 0)}
- SOM: ${fmt(state.som || 0)}

Team:
- Founders: ${state.founder || 'N/A'}
- Bios: ${state.founderBios || 'N/A'}
- Team Size: ${state.teamSize || 0}

Traction: ${state.traction || 'N/A'}
ICP: ${state.targetCustomer || 'N/A'}
Competitors: ${state.competitors || 'N/A'}
North Star: ${state.northStar || 'N/A'}
Use of Funds: ${state.useOfFunds || 'N/A'}
`.trim();
}

const SECTION_PROMPTS: Record<string, (ctx: string) => string> = {
  executive: ctx => `Write an Executive Summary for this startup business plan. Use the data below.
Write exactly 4 short paragraphs: (1) What the company does and the problem it solves, (2) The solution and unique insight, (3) Key traction and financial highlights, (4) The fundraise ask and what it unlocks.
Be specific, direct, and confident. No filler phrases. Use the actual numbers provided.
${ctx}`,

  market: ctx => `Write a Market Analysis section for this startup business plan.
Cover: (1) TAM/SAM/SOM with methodology (why these numbers), (2) Market dynamics and what's driving growth right now, (3) Why this market is underserved and where incumbents fail.
3-4 short focused paragraphs. Be specific and analytical.
${ctx}`,

  product: ctx => `Write a Product & Technology section for this startup business plan.
Cover: (1) What the product does and how it works, (2) The core technical differentiation and why it's hard to replicate, (3) Product roadmap priorities, (4) Data or network effects that compound over time.
3-4 short paragraphs. Be concrete, not abstract.
${ctx}`,

  gtm: ctx => `Write a Go-to-Market Strategy section for this startup business plan.
Cover: (1) Primary acquisition channels and why they work for this ICP, (2) Sales motion (PLG, inside sales, enterprise — whichever applies), (3) Pricing strategy and rationale, (4) 12-month revenue milestones.
3-4 short paragraphs. Tactical and specific.
${ctx}`,

  financials: ctx => `Write a Financial Projections section for this startup business plan.
Cover: (1) Current financial position and unit economics, (2) 3-year revenue projections with assumptions, (3) Path to profitability and key milestones (break-even, FCF positive, Rule of 40), (4) Use of raise proceeds with specific allocations.
3-4 short paragraphs. Reference the actual numbers provided.
${ctx}`,

  team: ctx => `Write a Team & Organization section for this startup business plan.
Cover: (1) Founder backgrounds and why they are uniquely suited to win this market, (2) Current team composition and key hires needed, (3) Hiring plan post-raise, (4) Advisors or notable investors if relevant.
3-4 short paragraphs. Confident and specific.
${ctx}`,
};

export default function BusinessPlan() {
  const { state, derived, ai, addToast } = useApp() as any;
  const {
    companyName = '',
    idea: ideaDesc = 'Your Startup',
    stage = 'Seed',
    revenue: mrr = 0,
    burn: burnRate = 0,
    capital: cashOnHand = 0,
    targetRaise = 0,
    cac = 0,
    ndr = 100,
    grossMargin = 70,
    growth: monthlyGrowth = 0,
    teamSize = 3,
    tam = 0,
    sam = 0,
    som = 0,
    founder: founderNames = '',
    founderBios = '',
    problem: problemStatement = '',
    solutionStatement = '',
    uniqueInsight = '',
    revenueModel = 'SaaS',
    traction = '',
  } = state || {};

  const ideaName = companyName || ideaDesc || 'Your Startup';

  const arr = mrr * 12;
  const ltv = state?.arpu ? Math.round(state.arpu / Math.max((state.churn || 0) / 100, 0.001)) : 0;
  const netBurnBP = Math.max(burnRate - mrr, 0);
  const runwayMonths = netBurnBP === 0 ? 999 : (cashOnHand ? Math.round(cashOnHand / netBurnBP) : 0);
  const burnMultiple = arr > 0 ? Number(((burnRate * 12) / arr).toFixed(2)) : 0;
  const rule40 = Number((monthlyGrowth + (mrr > 0 ? ((mrr - burnRate) / mrr) * 100 : 0)).toFixed(0));

  const [openSection, setOpenSection] = useState<string>('executive');
  const [generatedContent, setGeneratedContent] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState<Record<string, boolean>>({});
  const [generatingAll, setGeneratingAll] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const hasData = !!(problemStatement || solutionStatement || ideaDesc || mrr > 0);
  const currentSectionGenerated = !!generatedContent[openSection];

  // Build data-driven prose fallback for each section — no AI required
  const buildTemplateProse = useCallback((sectionId: string): string => {
    const name = ideaName;
    const ltvCacStr = ltv > 0 && cac > 0 ? `${(ltv / cac).toFixed(1)}×` : 'strong';
    const y1arr = arr;
    const y2arr = y1arr * Math.pow(1 + monthlyGrowth / 100, 12);
    const y3arr = y1arr * Math.pow(1 + monthlyGrowth / 100, 24);
    const raiseUse = state?.useOfFunds || 'product development, sales, and operations';
    const competitors_list = state?.competitors || 'existing solutions';
    const icp = state?.targetCustomer || 'target customers';
    const northStar = state?.northStar || '';
    const industry = state?.industry || 'B2B SaaS';

    switch (sectionId) {
      case 'executive':
        return [
          `${name} is a ${stage}-stage ${revenueModel} company${industry ? ` in the ${industry} space` : ''}.${problemStatement ? ` The company addresses a critical market gap: ${problemStatement}` : ''}`,
          solutionStatement
            ? `Our solution: ${solutionStatement}${uniqueInsight ? ` What makes us different — ${uniqueInsight}` : ''}`
            : `${name} delivers a purpose-built solution that directly addresses the pain points of ${icp}.${uniqueInsight ? ` Our core insight: ${uniqueInsight}` : ''}`,
          mrr > 0
            ? `${name} is generating ${fmt(mrr)} in monthly recurring revenue (${fmt(arr)} ARR), growing at ${monthlyGrowth.toFixed(1)}% month-over-month with ${fmtPct(grossMargin)} gross margins and ${fmtPct(ndr)} NDR.${traction ? ` ${traction}` : ''}`
            : `${name} is in the early stages of development${traction ? `, with early validation including: ${traction}` : ' and actively building its first customer relationships'}.`,
          `We are raising ${fmt(targetRaise)} at a ${fmt(state?.valuation || 0)} valuation cap to ${raiseUse}. This round extends our runway to ${runwayMonths + 18}+ months and funds the milestones required to reach ${fmt(y2arr)} ARR.${northStar ? ` Our north star: ${northStar}.` : ''}`,
        ].join('\n\n');

      case 'market':
        return [
          `${name} targets a ${fmt(tam)} total addressable market, with a serviceable addressable market of ${fmt(sam)} and an immediately obtainable market of ${fmt(som)}. ${industry ? `The ${industry} sector` : 'This market'} is experiencing rapid expansion driven by digital transformation, shifting buyer behavior, and a growing demand for purpose-built solutions.`,
          `The addressable market is underserved: ${competitors_list ? `current solutions like ${competitors_list} were built for a different era and fail to adequately serve the needs of ${icp}` : `legacy and generic solutions fail to address the specific needs of ${icp}`}. This creates a significant opportunity for a focused, modern approach.`,
          `Market timing is favorable. ${uniqueInsight ? uniqueInsight : `Buyers in this category are actively searching for better alternatives`}, and the convergence of technology, regulatory shifts, and changing customer expectations creates a clear window for ${name} to establish a dominant position. Companies that move now can capture disproportionate market share before the market consolidates.`,
          `Our SAM of ${fmt(sam)} (${sam > 0 && tam > 0 ? ((sam / tam) * 100).toFixed(0) : '~15'}% of TAM) represents the segment we can realistically serve with our current product and go-to-market motion. Our SOM of ${fmt(som)} defines our 3-year capture target, representing a ${som > 0 && sam > 0 ? ((som / sam) * 100).toFixed(0) : '~10'}% penetration of SAM — a conservative and achievable goal.`,
        ].join('\n\n');

      case 'product':
        return [
          `${name}'s product is built around a core insight: ${uniqueInsight || `${icp} need a solution that fits their specific workflow, not a generic tool adapted for their use case`}. ${solutionStatement || `The platform delivers exactly what ${icp} need, with no unnecessary complexity.`}`,
          `The product's core differentiation lies in its technical architecture and depth of focus. Unlike ${competitors_list || 'competitors'}, ${name} was designed from the ground up for ${icp}, which means features and workflows that would take competitors years of retrofitting are native to our system. This creates a structural moat that is difficult to replicate.`,
          `Network and data effects compound our advantage over time. As more customers use the platform, the system accumulates proprietary data and improves its core models, creating an intelligence flywheel that widens the gap between ${name} and alternatives. Switching costs increase as customers integrate the product more deeply into their operations.`,
          `Our current product roadmap is focused on three priorities: (1) deepening the core product to increase activation and retention among ${icp}, (2) building the integrations and APIs that make ${name} the hub of customers' workflows, and (3) developing the data layer that will power AI-driven insights and automation.`,
        ].join('\n\n');

      case 'gtm':
        return [
          `${name}'s primary go-to-market motion is focused on ${icp}. Our top acquisition channels are ${revenueModel === 'SaaS' ? 'product-led growth, content marketing, and outbound sales' : revenueModel === 'Marketplace' ? 'supply-side partnerships, demand-side SEO, and direct outreach' : 'direct sales, partnership channels, and content-driven inbound'}. Early traction validates that ${icp} respond well to a ${revenueModel === 'SaaS' ? 'bottom-up, try-before-you-buy' : 'direct value demonstration'} approach.`,
          `Our sales motion is built for efficiency. With a CAC of ${fmt(cac)} and an LTV:CAC ratio of ${ltvCacStr}, we have strong unit economics that support aggressive reinvestment in acquisition. The payback period of ${derived?.payback || Math.round(cac / Math.max(state?.arpu || 1, 1))} months means we recover customer acquisition costs quickly, creating a capital-efficient growth engine.`,
          `Pricing is designed to align with customer value. Our ${revenueModel} model means customers pay in proportion to the value they receive, reducing friction to adoption and creating natural expansion revenue. NDR of ${fmtPct(ndr)} confirms that customers find enough value to grow their spend over time — one of the strongest validation signals in SaaS.`,
          `Over the next 12 months, our go-to-market milestones are: (1) grow MRR from ${fmt(mrr)} to ${fmt(mrr * Math.pow(1 + monthlyGrowth / 100, 12))}, (2) establish 2-3 key partnership channels, (3) build a repeatable outbound motion with fully loaded CAC below ${fmt(cac * 0.8)}, and (4) achieve net revenue retention above ${fmtPct(Math.min(ndr + 5, 130))}.`,
        ].join('\n\n');

      case 'financials':
        return [
          `${name} is currently generating ${fmt(mrr)} MRR (${fmt(arr)} ARR) with ${fmtPct(grossMargin)} gross margins and ${fmtPct(ndr)} net dollar retention. Monthly burn is ${fmt(burnRate)}, net of revenue, ${runwayMonths >= 999 ? 'and the company is profitable with indefinite runway' : `providing ${runwayMonths} months of runway`} on current cash of ${fmt(cashOnHand)}.${burnMultiple > 0 ? ` Our burn multiple of ${burnMultiple}× is ${burnMultiple <= 1.5 ? 'best-in-class' : burnMultiple <= 2.5 ? 'healthy for our stage' : 'expected at this growth rate and will improve as revenue scales'}.` : ''}`,
          `Unit economics are strong and improving. LTV of ${fmt(ltv)} against a CAC of ${fmt(cac)} gives an LTV:CAC ratio of ${ltvCacStr}. At ${fmtPct(monthlyGrowth)} MoM growth, we project ARR to reach ${fmt(y2arr)} by end of Year 2 and ${fmt(y3arr)} by end of Year 3, assuming growth rates moderate as we scale.`,
          `The ${fmt(targetRaise)} raise will be deployed as follows: ${raiseUse}. This investment funds the growth milestones required to reach a Series ${stage === 'Seed' ? 'A' : stage === 'Series A' ? 'B' : 'C'}-ready profile, including demonstrating repeatable growth, improving unit economics, and expanding the team to support the next phase of scale.`,
          `Our path to profitability assumes a ${monthlyGrowth > 0 ? `${Math.min(Math.round(24 + burnRate / Math.max(mrr * monthlyGrowth / 100, 1)), 72)} month` : 'near-term (profitable or approaching breakeven)'} horizon to cash flow breakeven, achieved by continuing to grow revenue faster than costs and driving gross margin expansion through scale and automation. Rule of 40 score is currently ${rule40}, with a target of 40+ within 18 months post-raise.`,
        ].join('\n\n');

      case 'team':
        return [
          founderNames
            ? `${name} was founded by ${founderNames}.${founderBios ? ` ${founderBios}` : ` The founding team brings deep domain expertise in ${industry}, with complementary skill sets across product, technology, and go-to-market.`}`
            : `${name} is built by a ${teamSize}-person founding team with direct experience in ${industry} and a track record of building and scaling products for ${icp}.`,
          `The founding team's unfair advantages include domain expertise, existing relationships within the target customer base, and a deep understanding of the problem space developed over years of firsthand experience. This is not a team that stumbled into this market — we have lived the problem and built the solution.`,
          `The current ${teamSize}-person team covers the critical functions needed for this stage: product development, customer success, and early sales. Post-raise, we plan to make key hires in ${stage === 'Pre-seed' || stage === 'Seed' ? 'engineering, sales, and customer success' : 'sales leadership, engineering, and marketing'} to accelerate growth and prepare the organization for the next stage.`,
          `We are building a culture of ownership, speed, and customer obsession. Every hire is evaluated not just for their skills but for their ability to operate effectively in an early-stage environment and their passion for the problem we are solving. This culture is a competitive advantage that compounds as the team grows.`,
        ].join('\n\n');

      default:
        return 'Content not available for this section.';
    }
  }, [state, derived, ideaName, arr, mrr, burnRate, cashOnHand, targetRaise, cac, ndr, grossMargin,
      monthlyGrowth, teamSize, tam, sam, som, founderNames, founderBios, problemStatement,
      solutionStatement, uniqueInsight, revenueModel, traction, stage, ltv, runwayMonths,
      burnMultiple, rule40]);

  // Generate a single section — AI if available, smart template otherwise
  const generateSection = useCallback(async (sectionId: string) => {
    setGenerating(prev => ({ ...prev, [sectionId]: true }));
    try {
      const session = ai?.session;
      if (session) {
        const ctx = buildDataContext(state, derived);
        const prompt = SECTION_PROMPTS[sectionId](ctx);
        const result = await session.prompt(prompt);
        setGeneratedContent(prev => ({ ...prev, [sectionId]: result }));
      } else {
        // Use smart data-driven template — no AI needed
        await new Promise(r => setTimeout(r, 400)); // brief animation delay
        const result = buildTemplateProse(sectionId);
        setGeneratedContent(prev => ({ ...prev, [sectionId]: result }));
      }
    } catch (err: any) {
      addToast(`Failed to generate: ${err.message || 'Unknown error'}`, 'error');
    } finally {
      setGenerating(prev => ({ ...prev, [sectionId]: false }));
    }
  }, [ai, state, derived, addToast, buildTemplateProse]);

  // Generate all sections
  const generateAll = useCallback(async () => {
    setGeneratingAll(true);
    for (const section of SECTIONS) {
      setGenerating(prev => ({ ...prev, [section.id]: true }));
      try {
        const session = ai?.session;
        if (session) {
          const ctx = buildDataContext(state, derived);
          const result = await session.prompt(SECTION_PROMPTS[section.id](ctx));
          setGeneratedContent(prev => ({ ...prev, [section.id]: result }));
        } else {
          await new Promise(r => setTimeout(r, 300));
          setGeneratedContent(prev => ({ ...prev, [section.id]: buildTemplateProse(section.id) }));
        }
      } catch (err: any) {
        addToast(`${section.title} failed: ${err.message}`, 'error');
      } finally {
        setGenerating(prev => ({ ...prev, [section.id]: false }));
      }
    }
    setGeneratingAll(false);
    addToast('Business plan generated.', 'success');
  }, [ai, state, derived, addToast, buildTemplateProse]);

  const exportHTML = () => {
    const allGenerated = SECTIONS.every(s => !!generatedContent[s.id]);
    const content = allGenerated
      ? SECTIONS.map(s => `<h2>${s.title}</h2><div class="prose">${generatedContent[s.id].split('\n').map(p => p.trim() ? `<p>${p}</p>` : '').join('')}</div>`).join('\n')
      : document.getElementById('business-plan-content')?.innerHTML || '';
    const full = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>${ideaName} Business Plan</title>
<style>*{box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:900px;margin:0 auto;padding:40px 40px 80px;color:#1e293b;line-height:1.7}h1{font-size:2.4em;font-weight:900;margin-bottom:.2em;color:#0a0f1e}h2{font-size:1.4em;font-weight:700;margin:2.5em 0 .5em;border-bottom:2px solid #3b82f6;padding-bottom:.4em;color:#3b82f6}p{margin:.7em 0;color:#374151}.meta{color:#64748b;font-size:.9em;margin-bottom:2em}@media print{body{padding:20px}}</style></head>
<body><h1>${ideaName} — Business Plan</h1><p class="meta">${stage} · ${revenueModel} · ${new Date().toLocaleDateString('en-US',{year:'numeric',month:'long'})}</p>${content}</body></html>`;
    const blob = new Blob([full], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${ideaName.replace(/\s+/g,'-')}-business-plan.html`; a.click();
    URL.revokeObjectURL(url);
  };

  const exportDocx = async () => {
    try {
      const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = await import('docx');

      const children: any[] = [
        new Paragraph({
          children: [new TextRun({ text: `${ideaName} — Business Plan`, bold: true, size: 52 })],
          heading: HeadingLevel.TITLE,
        }),
        new Paragraph({
          children: [new TextRun({ text: `${stage} · ${revenueModel} · ${new Date().toLocaleDateString('en-US',{year:'numeric',month:'long'})}`, color: '64748b', size: 22 })],
          spacing: { after: 400 },
        }),
      ];

      const sectionsToExport = SECTIONS.filter(s => generatedContent[s.id]);

      if (sectionsToExport.length === 0) {
        // Export structured template if no AI content
        for (const section of SECTIONS) {
          children.push(new Paragraph({ children: [new TextRun({ text: section.title, bold: true, size: 36 })], heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }));
          children.push(new Paragraph({ children: [new TextRun({ text: '[Fill in this section]', color: '94a3b8', italics: true, size: 22 })], spacing: { after: 200 } }));
        }
      } else {
        for (const section of sectionsToExport) {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: section.title, bold: true, size: 36 })],
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 480, after: 200 },
            })
          );
          const lines = generatedContent[section.id].split('\n').filter(l => l.trim());
          for (const line of lines) {
            children.push(
              new Paragraph({
                children: [new TextRun({ text: line, size: 22 })],
                spacing: { after: 160 },
                alignment: AlignmentType.JUSTIFIED,
              })
            );
          }
        }
      }

      // Metrics appendix
      children.push(
        new Paragraph({ children: [new TextRun({ text: 'Key Metrics', bold: true, size: 36 })], heading: HeadingLevel.HEADING_1, spacing: { before: 480, after: 200 } }),
        ...[
          `ARR: ${fmt(arr)}`, `MRR: ${fmt(mrr)}`, `MoM Growth: ${fmtPct(monthlyGrowth)}`,
          `Gross Margin: ${fmtPct(grossMargin)}`, `NDR: ${fmtPct(ndr)}`, `Runway: ${runwayMonths} months`,
          `Burn Multiple: ${burnMultiple}x`, `Rule of 40: ${rule40}`,
          `LTV: ${fmt(ltv)}`, `CAC: ${fmt(cac)}`, `LTV:CAC: ${ltv > 0 && cac > 0 ? (ltv/cac).toFixed(1) : 'N/A'}x`,
          `Target Raise: ${fmt(targetRaise)}`, `TAM: ${fmt(tam)}`, `SAM: ${fmt(sam)}`,
        ].map(line => new Paragraph({ children: [new TextRun({ text: `• ${line}`, size: 22 })], spacing: { after: 100 } }))
      );

      const doc = new Document({ sections: [{ children }] });
      const buffer = await Packer.toBuffer(doc);
      const blob = new Blob([buffer as unknown as BlobPart], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${ideaName.replace(/\s+/g, '-')}-business-plan.docx`;
      a.click();
      URL.revokeObjectURL(url);
      addToast('Business plan downloaded.', 'success');
    } catch (err: any) {
      addToast(`Download failed: ${err.message}`, 'error');
    }
  };

  const exportBriefing = async () => {
    try {
      const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = await import('docx');

      const ctx = buildDataContext(state, derived);
      const session = ai?.session;
      let briefingText = '';

      if (session) {
        addToast('Generating briefing...', 'info');
        briefingText = await session.prompt(
          `Write a one-page investor briefing document for this startup.
          Cover: company overview, problem & solution, traction, market opportunity, team, and fundraise ask.
          Format as clear paragraphs with bold headers. Be specific with numbers. Professional VC-ready tone.
          ${ctx}`
        );
      }

      const children: any[] = [
        new Paragraph({ children: [new TextRun({ text: `${ideaName}`, bold: true, size: 56 })], heading: HeadingLevel.TITLE }),
        new Paragraph({ children: [new TextRun({ text: `Investor Briefing · ${new Date().toLocaleDateString('en-US',{year:'numeric',month:'long'})}`, color: '64748b', size: 22 })], spacing: { after: 400 } }),
      ];

      if (briefingText) {
        const lines = briefingText.split('\n').filter(l => l.trim());
        for (const line of lines) {
          if (line.startsWith('**') && line.endsWith('**')) {
            children.push(new Paragraph({ children: [new TextRun({ text: line.replace(/\*\*/g, ''), bold: true, size: 26 })], heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 120 } }));
          } else {
            children.push(new Paragraph({ children: [new TextRun({ text: line, size: 22 })], spacing: { after: 140 }, alignment: AlignmentType.JUSTIFIED }));
          }
        }
      } else {
        // Fallback: structured briefing from template
        const sections = [
          { title: 'Company Overview', content: `${ideaName} is a ${stage}-stage ${revenueModel} company. ${solutionStatement || ideaDesc}` },
          { title: 'The Problem', content: problemStatement || 'Significant unmet need in the target market.' },
          { title: 'Traction', content: mrr > 0 ? `${fmt(mrr)} MRR growing at ${fmtPct(monthlyGrowth)} month-over-month. ${traction || ''}` : (traction || 'Early stage — building initial traction.') },
          { title: 'Market Opportunity', content: `TAM of ${fmt(tam || 5e9)} with SAM of ${fmt(sam || 750e6)}. ${uniqueInsight || ''}` },
          { title: 'Team', content: founderNames ? `Founded by ${founderNames}. ${founderBios || ''}` : `${teamSize}-person founding team.` },
          { title: 'The Ask', content: targetRaise > 0 ? `Raising ${fmt(targetRaise)} at ${fmt(state?.valuation || 0)} cap. Use of funds: ${state?.useOfFunds || 'product, sales, operations.'}` : 'Fundraise details TBD.' },
        ];
        for (const s of sections) {
          children.push(new Paragraph({ children: [new TextRun({ text: s.title, bold: true, size: 28 })], heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 120 } }));
          children.push(new Paragraph({ children: [new TextRun({ text: s.content, size: 22 })], spacing: { after: 200 }, alignment: AlignmentType.JUSTIFIED }));
        }
      }

      const doc = new Document({ sections: [{ children }] });
      const buffer = await Packer.toBuffer(doc);
      const blob = new Blob([buffer as unknown as BlobPart], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${ideaName.replace(/\s+/g, '-')}-briefing.docx`;
      a.click();
      URL.revokeObjectURL(url);
      addToast('Briefing downloaded.', 'success');
    } catch (err: any) {
      addToast(`Briefing failed: ${err.message}`, 'error');
    }
  };

  const useOfFundsData = [
    { name: 'Engineering & Product', value: 45, color: '#3b82f6' },
    { name: 'Sales & Marketing', value: 30, color: '#60a5fa' },
    { name: 'Operations & G&A', value: 15, color: '#14b8a6' },
    { name: 'R&D / Innovation', value: 10, color: '#f59e0b' },
  ];

  const projectedArr = [
    { year: 'Y1', arr: arr || mrr * 12 },
    { year: 'Y2', arr: (arr || mrr * 12) * (1 + monthlyGrowth / 100) ** 12 },
    { year: 'Y3', arr: (arr || mrr * 12) * (1 + monthlyGrowth / 100) ** 24 },
  ];

  // ── Template fallback content per section ────────────────────────────────
  const templateContent: Record<string, React.ReactNode> = {
    executive: (
      <div className="space-y-5">
        <div className="p-5 rounded-[var(--radius-lg)] border border-[var(--accent)] border-opacity-30 bg-[var(--accent-dim)]">
          <h3 className="font-black text-base mb-2">Company Overview</h3>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            {ideaName} is a {stage}-stage {revenueModel} company{problemStatement ? ` tackling ${problemStatement}` : ''}. {solutionStatement || ideaDesc || 'Fill in your solution statement in the Narrative section of the sidebar.'}
          </p>
          {uniqueInsight && (
            <div className="mt-3 flex items-start gap-2">
              <Lightbulb size={14} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2 }} />
              <p className="text-sm text-[var(--text-secondary)] italic">{uniqueInsight}</p>
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Current ARR', value: fmt(arr || mrr * 12), color: 'var(--green)' },
            { label: 'MoM Growth', value: `${monthlyGrowth.toFixed(1)}%`, color: 'var(--blue)' },
            { label: 'Runway', value: `${runwayMonths}mo`, color: runwayMonths < 6 ? 'var(--red)' : 'var(--amber)' },
            { label: 'Target Raise', value: fmt(targetRaise), color: 'var(--accent)' },
          ].map(m => (
            <div key={m.label} className="p-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)] text-center">
              <div className="text-xl font-black" style={{ color: m.color }}>{m.value}</div>
              <div className="text-[10px] text-[var(--text-muted)] mt-1 uppercase tracking-wide">{m.label}</div>
            </div>
          ))}
        </div>
        <div>
          <h3 className="font-bold text-sm mb-3">Investment Highlights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              `${revenueModel} recurring revenue with ${fmtPct(grossMargin)} gross margins`,
              `${monthlyGrowth.toFixed(1)}% MoM growth trajectory`,
              `LTV:CAC of ${ltv > 0 && cac > 0 ? (ltv / cac).toFixed(1) : '—'}×`,
              `${teamSize}-person team with domain expertise`,
              tam > 0 ? `${fmt(tam)} TAM` : 'Large and growing market',
              `${runwayMonths >= 18 ? '18+ months runway' : `Raise extends runway to 24+ months`}`,
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                <span className="text-[var(--green)] mt-0.5">✓</span> {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    market: (
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'TAM', sublabel: 'Total Addressable Market', value: fmt(tam || 5e9), color: '#3b82f6' },
            { label: 'SAM', sublabel: 'Serviceable Addressable Market', value: fmt(sam || (tam * 0.15) || 750e6), color: '#60a5fa' },
            { label: 'SOM', sublabel: 'Serviceable Obtainable Market', value: fmt(som || (sam * 0.1) || 75e6), color: '#10b981' },
          ].map(m => (
            <div key={m.label} className="p-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)] space-y-2">
              <div className="font-black text-2xl" style={{ color: m.color }}>{m.value}</div>
              <div className="font-bold text-sm">{m.label}</div>
              <div className="text-[10px] text-[var(--text-muted)]">{m.sublabel}</div>
            </div>
          ))}
        </div>
        <div className="p-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[rgba(255,255,255,0.02)] text-sm text-[var(--text-muted)]">
          Fill in your Market section — add TAM/SAM/SOM in the Market accordion of the sidebar, and use the Narrative section to describe your market drivers and competitive positioning.
        </div>
      </div>
    ),
    product: (
      <div className="space-y-5">
        <div className="p-5 rounded-[var(--radius-lg)] bg-[var(--accent-dim)] border border-[rgba(59,130,246,0.25)]">
          <h3 className="font-bold text-sm mb-2">Core Value Proposition</h3>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            {solutionStatement || `${ideaName} — fill in your Solution Statement in the Narrative section of the sidebar.`}
          </p>
        </div>
        <div className="p-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[rgba(255,255,255,0.02)] text-sm text-[var(--text-muted)]">
          Add your product description, unique insight, and solution statement in the Narrative section of the sidebar, then click Generate to populate this section with custom content.
        </div>
      </div>
    ),
    gtm: (
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { phase: 'Phase 1', title: 'Product-Led Growth', timeline: '0-6 months', kpi: '1K MAU' },
            { phase: 'Phase 2', title: 'Sales-Assisted', timeline: '6-18 months', kpi: '$1M ARR' },
            { phase: 'Phase 3', title: 'Enterprise', timeline: '18+ months', kpi: '$10M ARR' },
          ].map((p, i) => (
            <div key={i} className="p-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)]">
              <div className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-widest mb-1">{p.phase}</div>
              <div className="font-bold text-sm mb-0.5">{p.title}</div>
              <div className="text-[10px] text-[var(--text-muted)] mb-2">{p.timeline}</div>
              <div className="px-2 py-1 rounded-full text-[10px] font-bold inline-block bg-[var(--green-dim)] text-[var(--green)]">{p.kpi}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    financials: (
      <div className="space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Current ARR', value: fmt(arr || mrr * 12), color: 'var(--green)', sub: 'Annual Recurring Revenue' },
            { label: 'Gross Margin', value: `${grossMargin.toFixed(0)}%`, color: grossMargin >= 65 ? 'var(--green)' : 'var(--amber)', sub: 'Target: 65%+' },
            { label: 'Burn Multiple', value: `${burnMultiple.toFixed(1)}×`, color: burnMultiple <= 1.5 ? 'var(--green)' : burnMultiple <= 2.5 ? 'var(--amber)' : 'var(--red)', sub: 'Target: < 1.5×' },
            { label: 'Rule of 40', value: `${rule40}`, color: rule40 >= 40 ? 'var(--green)' : rule40 >= 20 ? 'var(--amber)' : 'var(--red)', sub: 'Target: 40+' },
          ].map(m => (
            <div key={m.label} className="p-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)] text-center">
              <div className="text-xl font-black" style={{ color: m.color }}>{m.value}</div>
              <div className="text-xs font-bold text-[var(--text-primary)] mt-1">{m.label}</div>
              <div className="text-[9px] text-[var(--text-muted)] mt-0.5">{m.sub}</div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="p-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)]">
            <div className="font-bold text-sm mb-4">Revenue Projections</div>
            <div className="flex items-end gap-3" style={{ height: 120 }}>
              {projectedArr.map((d, i) => {
                const maxVal = Math.max(...projectedArr.map(p => p.arr), 1);
                const barH = Math.max(8, (d.arr / maxVal) * 100);
                const colors = ['#3b82f6', '#60a5fa', '#10b981'];
                return (
                  <div key={d.year} className="flex-1 flex flex-col items-center gap-1">
                    <div className="text-xs font-bold" style={{ color: colors[i] }}>{fmt(d.arr)}</div>
                    <div className="w-full rounded-t-sm" style={{ height: barH, background: colors[i] }} />
                    <div className="text-[10px] text-[var(--text-muted)] font-bold">{d.year}</div>
                  </div>
                );
              })}
            </div>
          </div>
          {targetRaise > 0 && (
            <div className="p-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)]">
              <div className="font-bold text-sm mb-2">Use of Funds — {fmt(targetRaise)}</div>
              <div className="flex items-center gap-4">
                <ResponsiveContainer width={110} height={110}>
                  <PieChart>
                    <Pie data={useOfFundsData} cx="50%" cy="50%" innerRadius={32} outerRadius={50} dataKey="value" strokeWidth={0}>
                      {useOfFundsData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-1.5">
                  {useOfFundsData.map((d, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                        <span className="text-xs text-[var(--text-muted)]">{d.name}</span>
                      </div>
                      <span className="text-xs font-bold" style={{ color: d.color }}>{d.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    ),
    team: (
      <div className="space-y-5">
        {founderNames ? (
          <div className="p-5 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)]">
            <h3 className="font-bold text-sm mb-3">Leadership Team</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {founderNames.split(',').map((name: string, i: number) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--accent-dim)] flex items-center justify-center text-[var(--accent)] font-black text-sm shrink-0">
                    {name.trim()[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <div className="font-bold text-sm">{name.trim()}</div>
                    <div className="text-xs text-[var(--text-muted)] mt-0.5">{founderBios?.split(',')[i]?.trim() || 'Co-Founder'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[rgba(255,255,255,0.02)] text-sm text-[var(--text-muted)]">
            Add your founder names and bios in the Company section of the sidebar.
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { phase: 'Now → Series A', headcount: teamSize },
            { phase: 'Post-Series A', headcount: teamSize + 8 },
            { phase: 'Scale 12-18mo', headcount: teamSize + 20 },
          ].map((p, i) => (
            <div key={i} className="p-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)]">
              <div className="font-bold text-xs mb-1" style={{ color: 'var(--accent)' }}>{p.phase}</div>
              <div className="text-sm font-black">{p.headcount} people</div>
            </div>
          ))}
        </div>
      </div>
    ),
  };

  // Render AI content as formatted prose
  const renderAIContent = (content: string) => (
    <div className="space-y-3">
      {content.split('\n').filter(l => l.trim()).map((line, i) => {
        const isBold = line.startsWith('**') && line.includes('**');
        const text = line.replace(/\*\*/g, '');
        return isBold ? (
          <h4 key={i} className="font-bold text-sm text-[var(--text-primary)] mt-4 first:mt-0">{text}</h4>
        ) : (
          <p key={i} className="text-sm text-[var(--text-secondary)] leading-relaxed">{text}</p>
        );
      })}
    </div>
  );

  const aiReady = !!(ai?.session);
  const generatedCount = Object.keys(generatedContent).length;

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <PageHeader
        icon={BookOpen}
        title="Business Plan"
        subtitle={`${ideaName} · ${stage} · ${new Date().getFullYear()}`}
        badge={<Badge color="var(--accent-light)" size="sm">{revenueModel}</Badge>}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            {generatedCount > 0 && (
              <Button variant="ghost" size="sm" icon={Download} onClick={exportHTML}>HTML</Button>
            )}
            <Button variant="ghost" size="sm" icon={Download} onClick={exportDocx}>
              {generatedCount > 0 ? 'Download Plan (.docx)' : 'Export (.docx)'}
            </Button>
            <Button
              variant="ghost" size="sm"
              icon={FileText}
              onClick={exportBriefing}
            >
              Briefing (.docx)
            </Button>
            <Button
              variant="primary" size="sm"
              icon={generatingAll ? Loader2 : Sparkles}
              onClick={generateAll}
              disabled={generatingAll}
            >
              {generatingAll ? 'Generating...' : generatedCount > 0 ? 'Regenerate All' : 'Generate Plan'}
            </Button>
          </div>
        }
      />

      {!aiReady && (
        <div className="flex items-start gap-3 p-4 rounded-[var(--radius-lg)] border border-[rgba(245,158,11,0.3)] bg-[rgba(245,158,11,0.08)]">
          <AlertCircle size={16} className="text-[var(--amber)] shrink-0 mt-0.5" />
          <p className="text-sm text-[var(--text-secondary)]">
            AI isn't loaded yet — sections show smart templates based on your data. Open the AI panel (✨ icon) and click <strong>Load AI</strong>, then use <strong>Generate Plan</strong> to get custom prose for each section.
          </p>
        </div>
      )}

      {!hasData && (
        <div className="flex items-start gap-3 p-4 rounded-[var(--radius-lg)] border border-[rgba(30,64,175,0.3)] bg-[rgba(30,64,175,0.08)]">
          <AlertCircle size={16} style={{ color: '#3b82f6' }} className="shrink-0 mt-0.5" />
          <p className="text-sm text-[var(--text-secondary)]">
            Fill in your company details in the sidebar first — company name, problem, solution, and financials — then generate your plan.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
        {/* Navigation sidebar */}
        <div className="space-y-1">
          {SECTIONS.map(s => {
            const isGenerated = !!generatedContent[s.id];
            const isGenerating = generating[s.id];
            return (
              <button key={s.id} onClick={() => setOpenSection(s.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] border text-left transition-all"
                style={{
                  background: openSection === s.id ? `${s.color}15` : 'transparent',
                  borderColor: openSection === s.id ? s.color : 'transparent',
                  color: openSection === s.id ? 'var(--text-primary)' : 'var(--text-muted)',
                }}>
                <span style={{ color: openSection === s.id ? s.color : 'inherit' }}>{s.icon}</span>
                <span className="text-sm font-medium flex-1">{s.title}</span>
                {isGenerating ? (
                  <Loader2 size={11} className="animate-spin text-[var(--accent)]" />
                ) : isGenerated ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--green)]" />
                ) : openSection === s.id ? (
                  <ChevronRight size={12} style={{ color: s.color }} />
                ) : null}
              </button>
            );
          })}

          {/* Section generate button */}
          <div className="pt-3 border-t border-[var(--border)] mt-3">
            <button
              onClick={() => generateSection(openSection)}
              disabled={generating[openSection]}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-[var(--radius-md)] border border-[var(--border-accent)] bg-[var(--accent-dim)] text-xs font-bold text-[var(--accent-light)] hover:bg-[rgba(59,130,246,0.15)] disabled:opacity-50 transition-all"
            >
              {generating[openSection] ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
              {generating[openSection] ? 'Writing...' : currentSectionGenerated ? 'Regenerate section' : 'Generate section'}
            </button>
            {currentSectionGenerated && (
              <button
                onClick={() => setGeneratedContent(prev => { const n = {...prev}; delete n[openSection]; return n; })}
                className="w-full flex items-center justify-center gap-2 py-1.5 mt-1 rounded-[var(--radius-md)] text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                <RefreshCcw size={10} /> Show template
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div id="business-plan-content" ref={contentRef}>
          <AnimatePresence mode="wait">
            <motion.div key={openSection} initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <Card>
                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[var(--border)]">
                  <div className="w-9 h-9 rounded-[var(--radius-lg)] flex items-center justify-center"
                    style={{ background: `${SECTIONS.find(s => s.id === openSection)?.color}20`, color: SECTIONS.find(s => s.id === openSection)?.color }}>
                    {SECTIONS.find(s => s.id === openSection)?.icon}
                  </div>
                  <div className="flex-1">
                    <h2 className="font-black text-base">{SECTIONS.find(s => s.id === openSection)?.title}</h2>
                    <p className="text-xs text-[var(--text-muted)]">{ideaName} — {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                  </div>
                  {generatedContent[openSection] && (
                    <Badge color="var(--accent-light)" size="sm">
                      <span className="flex items-center gap-1">
                        <Sparkles size={9} />AI
                      </span>
                    </Badge>
                  )}
                </div>

                {generating[openSection] ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-4">
                    <Loader2 size={28} className="animate-spin text-[var(--accent)]" />
                    <p className="text-sm text-[var(--text-muted)]">Writing {SECTIONS.find(s => s.id === openSection)?.title}…</p>
                  </div>
                ) : generatedContent[openSection] ? (
                  renderAIContent(generatedContent[openSection])
                ) : (
                  templateContent[openSection]
                )}
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
