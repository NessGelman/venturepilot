import{a as e}from"./chunk-BEqpzyXh.js";import{a as t,b as n,f as r,g as i,i as a,r as o,v as ee,x as s}from"./Shared-e3bLhpnE.js";import{t as c}from"./proxy-DQXlqmRH.js";import{t as l}from"./copy-C587iME5.js";import{t as u}from"./download-BcECdvFY.js";import{_ as d}from"./index-v3fdj-bg.js";var f=i(`Mail`,[[`rect`,{width:`20`,height:`16`,x:`2`,y:`4`,rx:`2`,key:`18n3k1`}],[`path`,{d:`m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7`,key:`1ocrg3`}]]),p=i(`PenLine`,[[`path`,{d:`M12 20h9`,key:`t2du7b`}],[`path`,{d:`M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z`,key:`1ykcvy`}]]),m=i(`RefreshCw`,[[`path`,{d:`M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8`,key:`v9h5vc`}],[`path`,{d:`M21 3v5h-5`,key:`1q7to0`}],[`path`,{d:`M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16`,key:`3uifl3`}],[`path`,{d:`M8 16H3v5`,key:`1cv678`}]]),h=e(s(),1),g=n(),_=(e,t=`$`)=>!isFinite(e)||e===0?`${t}0`:e>=1e9?`${t}${(e/1e9).toFixed(1)}B`:e>=1e6?`${t}${(e/1e6).toFixed(1)}M`:e>=1e3?`${t}${(e/1e3).toFixed(0)}K`:`${t}${Math.round(e)}`,v={professional:{label:`Professional`,desc:`Formal, investor-grade language`},founder:{label:`Founder Voice`,desc:`Authentic, direct, transparent`},concise:{label:`Concise`,desc:`TL;DR format — 5 bullets max`}};function y(){let{state:e,derived:n}=ee(),i=e?.companyName||e?.idea||`Your Startup`,s=e?.revenue??0,y=n?.arr??s*12,b=e?.burn??0,x=e?.growth??0,S=n?.runwayMonths??0,C=e?.ndr??100,w=e?.grossMargin??70,T=e?.teamSize??3,E=e?.founder??``,D=e?.targetRaise??0,O=e?.stage??`Seed`,[k,A]=(0,h.useState)(`founder`),[j,M]=(0,h.useState)(`monthly`),[N,P]=(0,h.useState)(!1),[F,I]=(0,h.useState)(!1),[L,R]=(0,h.useState)(``),[z,B]=(0,h.useState)([{id:`w1`,category:`wins`,text:`Closed 3 new enterprise contracts (+$12K MRR)`},{id:`w2`,category:`wins`,text:`Shipped v2.0 with 40% faster onboarding`},{id:`w3`,category:`wins`,text:`NPS improved to 62 (+8 points MoM)`},{id:`c1`,category:`challenges`,text:`Enterprise sales cycles extending 30+ days`},{id:`c2`,category:`challenges`,text:`Hiring senior engineer proving difficult`},{id:`a1`,category:`asks`,text:`Intros to Series A investors with B2B SaaS experience`},{id:`a2`,category:`asks`,text:`CFO candidates with SaaS experience`}]),[V,H]=(0,h.useState)(``),[U,W]=(0,h.useState)(`wins`),G=new Date().toLocaleString(`default`,{month:`long`,year:`numeric`}),K=z.filter(e=>e.category===`wins`),q=z.filter(e=>e.category===`challenges`),J=z.filter(e=>e.category===`asks`),Y=(0,h.useMemo)(()=>{let e=y||s*12,t=`Hi [Investor Name],`,n=`[${i}] ${j===`monthly`?G:`Q${Math.ceil((new Date().getMonth()+1)/3)} ${new Date().getFullYear()}`} Investor Update`,r=[{label:`MRR`,value:_(s),trend:x>0?`up`:`flat`},{label:`ARR`,value:_(e),trend:`up`},{label:`MoM Growth`,value:`${x.toFixed(1)}%`,trend:x>=10?`up`:`flat`},{label:`Runway`,value:S>=999?`∞ (profitable)`:`${S}mo`,trend:S>=12?`up`:`down`},{label:`Burn/mo`,value:_(b),trend:`flat`},{label:`NDR`,value:`${C.toFixed(0)}%`,trend:C>=100?`up`:`down`}];return k===`concise`?`Subject: ${n}

${t}

${G} TL;DR for ${i}:

📊 Numbers
${r.slice(0,4).map(e=>`• ${e.label}: ${e.value}`).join(`
`)}

✅ Wins
${K.map(e=>`• ${e.text}`).join(`
`)}

⚠️ Challenges
${q.map(e=>`• ${e.text}`).join(`
`)}

🙏 Asks
${J.map(e=>`• ${e.text}`).join(`
`)}

Onward,
${E||`[Your Name]`}
${i}`:k===`professional`?`Subject: ${n}

${t}

I hope this message finds you well. Please find below our ${j} business update for ${i} for the period ending ${G}.

KEY METRICS
${r.map(e=>`  ${e.label.padEnd(14)} ${e.value}`).join(`
`)}

HIGHLIGHTS
${K.map((e,t)=>`${t+1}. ${e.text}`).join(`
`)}

CHALLENGES & RISK FACTORS
${q.map((e,t)=>`${t+1}. ${e.text}`).join(`
`)}

INVESTOR REQUESTS
We would greatly appreciate assistance with the following:
${J.map((e,t)=>`${t+1}. ${e.text}`).join(`
`)}

FORWARD OUTLOOK
Based on current trajectory, we expect to reach ${_((s||0)*(1+x/100)*3)} MRR within 90 days. ${D>0?`We are actively pursuing our ${O} raise of ${_(D)}.`:``}

Thank you for your continued support. Please do not hesitate to reach out with any questions.

Best regards,
${E||`[Your Name]`}
${i}`:`Subject: ${n}

${t}

${G} update — here's where we are.

The headline: we're ${x>=10?`growing at ${x.toFixed(1)}% MoM and`:``} at ${_(s)} MRR. ${S>=999?`We're profitable — no runway concerns.`:S>=12?`With ${S} months of runway, we have time to execute.`:S>=6?`Runway is ${S} months — we're actively fundraising.`:`Runway is ${S} months — this is urgent and we're moving fast.`}

THE NUMBERS

${r.map(e=>`${e.label}: ${e.value}`).join(` · `)}

WHAT'S WORKING
${K.map(e=>`→ ${e.text}`).join(`
`)}

WHAT'S HARD
${q.map(e=>`→ ${e.text}`).join(`
`)}

Being honest here — these aren't excuses, just the current reality. Here's how we're addressing them: [your plan here]

WHERE YOU CAN HELP
${J.map(e=>`✦ ${e.text}`).join(`
`)}

I'll be blunt: the most valuable thing you can do is make introductions. Even a warm email saying "I want you to meet [Founder]" changes the game.

${D>0?`We're raising a ${O} round of ${_(D)}. Happy to chat more if you know someone we should meet.\n\n`:``}Thanks for backing us. More next ${j===`monthly`?`month`:`quarter`}.

${E||`[Your Name]`}
${i}
${E?`
(reply directly to this email)`:``}`},[s,y,b,x,S,C,w,T,E,i,D,O,k,j,G,K,q,J]),X=F?L:Y,Z=()=>{navigator.clipboard.writeText(X),P(!0),setTimeout(()=>P(!1),2e3)},Q=()=>{let e=new Blob([X],{type:`text/plain`}),t=URL.createObjectURL(e),n=document.createElement(`a`);n.href=t,n.download=`${i}-investor-update.txt`,n.click()},te=()=>{F||R(Y),I(e=>!e)},$=()=>{V.trim()&&(B(e=>[...e,{id:`item-${Date.now()}`,category:U,text:V.trim()}]),H(``))},ne={wins:{label:`✅ Wins`,color:`var(--green)`,bg:`var(--green-dim)`},challenges:{label:`⚠️ Challenges`,color:`var(--amber)`,bg:`var(--amber-dim)`},asks:{label:`🙏 Asks`,color:`var(--accent)`,bg:`var(--accent-dim)`}};return(0,g.jsxs)(`div`,{className:`max-w-[1400px] mx-auto space-y-6`,children:[(0,g.jsx)(r,{icon:f,title:`Investor Update`,subtitle:`Draft your investor update in seconds`,badge:(0,g.jsx)(o,{color:`var(--accent-light)`,size:`sm`,children:G}),actions:(0,g.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,g.jsx)(a,{variant:`ghost`,size:`sm`,icon:u,onClick:Q,children:`Download`}),(0,g.jsx)(a,{variant:`secondary`,size:`sm`,icon:N?d:l,onClick:Z,children:N?`Copied!`:`Copy Email`})]})}),(0,g.jsxs)(`div`,{className:`grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-5`,children:[(0,g.jsxs)(`div`,{className:`space-y-4`,children:[(0,g.jsxs)(t,{children:[(0,g.jsx)(`div`,{className:`font-bold text-xs text-[var(--text-muted)] uppercase tracking-widest mb-3`,children:`Tone`}),(0,g.jsx)(`div`,{className:`space-y-2`,children:Object.entries(v).map(([e,t])=>(0,g.jsxs)(`button`,{onClick:()=>{A(e),I(!1)},className:`w-full flex items-center gap-3 p-3 rounded-[var(--radius-md)] border text-left transition-all`,style:{background:k===e?`var(--accent-dim)`:`transparent`,borderColor:k===e?`var(--accent)`:`var(--border)`},children:[(0,g.jsxs)(`div`,{className:`flex-1`,children:[(0,g.jsx)(`div`,{className:`text-sm font-bold`,style:{color:k===e?`var(--accent)`:`var(--text-primary)`},children:t.label}),(0,g.jsx)(`div`,{className:`text-[10px] text-[var(--text-muted)]`,children:t.desc})]}),k===e&&(0,g.jsx)(`div`,{className:`w-2 h-2 rounded-full bg-[var(--accent)]`})]},e))})]}),(0,g.jsxs)(t,{children:[(0,g.jsx)(`div`,{className:`font-bold text-xs text-[var(--text-muted)] uppercase tracking-widest mb-3`,children:`Frequency`}),(0,g.jsx)(`div`,{className:`flex gap-2`,children:[`monthly`,`quarterly`].map(e=>(0,g.jsx)(`button`,{onClick:()=>M(e),className:`flex-1 py-2 rounded-[var(--radius-md)] text-xs font-bold capitalize border transition-all`,style:{background:j===e?`var(--accent)`:`transparent`,borderColor:j===e?`var(--accent)`:`var(--border)`,color:j===e?`white`:`var(--text-muted)`},children:e},e))})]}),(0,g.jsxs)(t,{children:[(0,g.jsx)(`div`,{className:`font-bold text-xs text-[var(--text-muted)] uppercase tracking-widest mb-3`,children:`Update Content`}),(0,g.jsx)(`div`,{className:`space-y-4`,children:[`wins`,`challenges`,`asks`].map(e=>{let t=ne[e],n=z.filter(t=>t.category===e);return(0,g.jsxs)(`div`,{children:[(0,g.jsx)(`div`,{className:`text-xs font-bold mb-2`,style:{color:t.color},children:t.label}),(0,g.jsxs)(`div`,{className:`space-y-1.5 mb-2`,children:[n.map(e=>(0,g.jsxs)(`div`,{className:`flex items-start gap-2 group`,children:[(0,g.jsx)(`span`,{className:`text-[10px] mt-1`,style:{color:t.color},children:`→`}),(0,g.jsx)(`span`,{className:`text-xs text-[var(--text-muted)] flex-1 leading-relaxed`,children:e.text}),(0,g.jsx)(`button`,{onClick:()=>B(t=>t.filter(t=>t.id!==e.id)),className:`opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-[var(--red)] transition-all shrink-0 mt-0.5`,children:`×`})]},e.id)),n.length===0&&(0,g.jsx)(`p`,{className:`text-[10px] text-[var(--text-muted)] italic`,children:`No items yet`})]})]},e)})}),(0,g.jsxs)(`div`,{className:`pt-3 border-t border-[var(--border-subtle)] space-y-2`,children:[(0,g.jsxs)(`select`,{value:U,onChange:e=>W(e.target.value),className:`w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]`,children:[(0,g.jsx)(`option`,{value:`wins`,children:`Win`}),(0,g.jsx)(`option`,{value:`challenges`,children:`Challenge`}),(0,g.jsx)(`option`,{value:`asks`,children:`Ask`})]}),(0,g.jsxs)(`div`,{className:`flex gap-2`,children:[(0,g.jsx)(`input`,{type:`text`,value:V,onChange:e=>H(e.target.value),onKeyDown:e=>e.key===`Enter`&&$(),placeholder:`Add bullet point…`,className:`flex-1 bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-1.5 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]`}),(0,g.jsx)(a,{variant:`primary`,size:`sm`,onClick:$,children:`+`})]})]})]})]}),(0,g.jsxs)(t,{className:`flex flex-col`,children:[(0,g.jsxs)(`div`,{className:`flex items-center justify-between mb-4 pb-3 border-b border-[var(--border)]`,children:[(0,g.jsxs)(`div`,{className:`flex items-center gap-3`,children:[(0,g.jsx)(`div`,{className:`w-8 h-8 rounded-[var(--radius-md)] bg-[var(--accent-dim)] flex items-center justify-center`,children:(0,g.jsx)(f,{size:15,style:{color:`var(--accent)`}})}),(0,g.jsxs)(`div`,{children:[(0,g.jsx)(`div`,{className:`font-bold text-sm`,children:`Email Preview`}),(0,g.jsxs)(`div`,{className:`text-[10px] text-[var(--text-muted)]`,children:[v[k].label,` · `,j]})]})]}),(0,g.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,g.jsx)(a,{variant:`ghost`,size:`sm`,icon:p,onClick:te,children:F?`Auto-generate`:`Edit`}),(0,g.jsx)(a,{variant:`ghost`,size:`sm`,icon:m,onClick:()=>I(!1),children:`Refresh`})]})]}),F?(0,g.jsx)(`textarea`,{value:L,onChange:e=>R(e.target.value),className:`flex-1 min-h-[500px] bg-[var(--bg-base)] border border-[var(--border)] rounded-[var(--radius-lg)] p-4 text-sm font-mono text-[var(--text-primary)] resize-none focus:outline-none focus:border-[var(--accent)] leading-relaxed`}):(0,g.jsx)(c.div,{initial:{opacity:0},animate:{opacity:1},className:`flex-1 min-h-[500px] bg-[var(--bg-base)] rounded-[var(--radius-lg)] p-5 overflow-y-auto custom-scrollbar`,children:(0,g.jsx)(`pre`,{className:`text-sm font-mono text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed`,children:Y})},k+j+z.length),(0,g.jsxs)(`div`,{className:`flex items-center gap-3 mt-4 pt-3 border-t border-[var(--border)]`,children:[(0,g.jsx)(a,{variant:`primary`,icon:N?d:l,onClick:Z,children:N?`Copied to clipboard!`:`Copy Email`}),(0,g.jsx)(a,{variant:`secondary`,icon:u,onClick:Q,children:`Download .txt`}),(0,g.jsxs)(`span`,{className:`text-xs text-[var(--text-muted)] ml-auto`,children:[Y.split(/\s+/).length,` words`]})]})]})]}),(0,g.jsxs)(t,{children:[(0,g.jsx)(`div`,{className:`font-bold text-sm mb-4`,children:`Investor Update Best Practices`}),(0,g.jsx)(`div`,{className:`grid grid-cols-1 md:grid-cols-3 gap-4`,children:[{icon:`📅`,title:`Cadence`,tips:[`Send monthly at minimum`,`Quarterly for angels/advisors`,`Consistency builds trust`,`Never go dark — even bad news`]},{icon:`📊`,title:`Content`,tips:[`Lead with the single best metric`,`Be specific — numbers over adjectives`,`Name challenges before investors ask`,`"Ask" section drives actual help`]},{icon:`💬`,title:`Tone`,tips:[`Write like a founder, not a PR team`,`Transparency builds long-term trust`,`Short is better — respect their time`,`Include a clear, specific ask`]}].map((e,t)=>(0,g.jsxs)(`div`,{className:`space-y-2`,children:[(0,g.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,g.jsx)(`span`,{className:`text-xl`,children:e.icon}),(0,g.jsx)(`span`,{className:`font-bold text-sm`,children:e.title})]}),(0,g.jsx)(`ul`,{className:`space-y-1.5`,children:e.tips.map((e,t)=>(0,g.jsxs)(`li`,{className:`flex items-start gap-2 text-xs text-[var(--text-muted)]`,children:[(0,g.jsx)(`span`,{className:`text-[var(--green)] mt-0.5`,children:`✓`}),e]},t))})]},t))})]})]})}export{y as default};