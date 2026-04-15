import{a as e}from"./rolldown-runtime-COnpUsM8.js";import{x as t}from"./vendor-charts-B57OzyGs.js";import{r as n,t as r}from"./vendor-motion-jVER81Ic.js";import{a as i,f as ee,g as te,i as a,r as ne}from"./Shared-DX5XOSxL.js";import{Fr as o,Gn as s,Pr as re,Sr as c,Zn as ie,nr as l,ur as ae,yr as u}from"./vendor-shared-CdB0QKpY.js";import{t as d}from"./format-BQc9NhsY.js";var f=e(t(),1),p=n(),m=`vp_investor_update_history`,h={professional:{label:`Professional`,desc:`Formal, investor-grade language`},founder:{label:`Founder Voice`,desc:`Authentic, direct, transparent`},concise:{label:`Concise`,desc:`TL;DR format — 5 bullets max`}};function g(){let{state:e,derived:t,addToast:n}=te(),g=e?.companyName||e?.idea||`Your Startup`,_=e?.revenue??0,v=t?.arr??_*12,y=e?.burn??0,b=e?.growth??0,x=t?.runwayMonths??0,S=e?.ndr??100,oe=e?.grossMargin??70,C=e?.teamSize??3,w=e?.founder??``,T=e?.targetRaise??0,E=e?.stage??`Seed`,[D,se]=(0,f.useState)(`founder`),[O,ce]=(0,f.useState)(`monthly`),[k,A]=(0,f.useState)(!1),[j,M]=(0,f.useState)(!1),[N,P]=(0,f.useState)(``),[F,I]=(0,f.useState)([]),[L,R]=(0,f.useState)(!1),z=(0,f.useRef)(null),[B,V]=(0,f.useState)([{id:`w1`,category:`wins`,text:`Closed 3 new enterprise contracts (+$12K MRR)`},{id:`w2`,category:`wins`,text:`Shipped v2.0 with 40% faster onboarding`},{id:`w3`,category:`wins`,text:`NPS improved to 62 (+8 points MoM)`},{id:`c1`,category:`challenges`,text:`Enterprise sales cycles extending 30+ days`},{id:`c2`,category:`challenges`,text:`Hiring senior engineer proving difficult`},{id:`a1`,category:`asks`,text:`Intros to Series A investors with B2B SaaS experience`},{id:`a2`,category:`asks`,text:`CFO candidates with SaaS experience`}]),[H,U]=(0,f.useState)(``),[W,le]=(0,f.useState)(`wins`),G=new Date().toLocaleString(`default`,{month:`long`,year:`numeric`});(0,f.useEffect)(()=>{try{let e=localStorage.getItem(m);if(e){let t=JSON.parse(e);t.length>0&&(I(t),P(t[0].text),M(!0),n(`Draft restored`,`info`))}}catch{}},[]);let K=B.filter(e=>e.category===`wins`),q=B.filter(e=>e.category===`challenges`),J=B.filter(e=>e.category===`asks`),Y=(0,f.useMemo)(()=>{let e=v||_*12,t=`Hi [Investor Name],`,n=`[${g}] ${O===`monthly`?G:`Q${Math.ceil((new Date().getMonth()+1)/3)} ${new Date().getFullYear()}`} Investor Update`,r=[{label:`MRR`,value:d(_),trend:b>0?`up`:`flat`},{label:`ARR`,value:d(e),trend:`up`},{label:`MoM Growth`,value:`${b.toFixed(1)}%`,trend:b>=10?`up`:`flat`},{label:`Runway`,value:x>=999?`∞ (profitable)`:`${x}mo`,trend:x>=12?`up`:`down`},{label:`Burn/mo`,value:d(y),trend:`flat`},{label:`NDR`,value:`${S.toFixed(0)}%`,trend:S>=100?`up`:`down`}];return D===`concise`?`Subject: ${n}

${t}

${G} TL;DR for ${g}:

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
${w||`[Your Name]`}
${g}`:D===`professional`?`Subject: ${n}

${t}

I hope this message finds you well. Please find below our ${O} business update for ${g} for the period ending ${G}.

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
Based on current trajectory, we expect to reach ${d((_||0)*(1+b/100)*3)} MRR within 90 days. ${T>0?`We are actively pursuing our ${E} raise of ${d(T)}.`:``}

Thank you for your continued support. Please do not hesitate to reach out with any questions.

Best regards,
${w||`[Your Name]`}
${g}`:`Subject: ${n}

${t}

${G} update — here's where we are.

The headline: we're ${b>=10?`growing at ${b.toFixed(1)}% MoM and`:``} at ${d(_)} MRR. ${x>=999?`We're profitable — no runway concerns.`:x>=12?`With ${x} months of runway, we have time to execute.`:x>=6?`Runway is ${x} months — we're actively fundraising.`:`Runway is ${x} months — this is urgent and we're moving fast.`}

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

${T>0?`We're raising a ${E} round of ${d(T)}. Happy to chat more if you know someone we should meet.\n\n`:``}Thanks for backing us. More next ${O===`monthly`?`month`:`quarter`}.

${w||`[Your Name]`}
${g}
${w?`
(reply directly to this email)`:``}`},[_,v,y,b,x,S,oe,C,w,g,T,E,D,O,G,K,q,J]),X=j?N:Y;(0,f.useEffect)(()=>(z.current&&clearTimeout(z.current),z.current=setTimeout(()=>{if(!X.trim())return;let e={id:Date.now().toString(),text:X,timestamp:Date.now()};I(t=>{let n=[e,...t.filter(e=>e.text!==X)].slice(0,3);try{localStorage.setItem(m,JSON.stringify(n))}catch{}return n})},1e3),()=>{z.current&&clearTimeout(z.current)}),[X]);let ue=(0,f.useCallback)(e=>{P(e.text),M(!0),R(!1),n(`Draft restored`,`info`)},[n]),Z=()=>{navigator.clipboard.writeText(X),A(!0),setTimeout(()=>A(!1),2e3)},Q=()=>{let e=new Blob([X],{type:`text/plain`}),t=URL.createObjectURL(e),n=document.createElement(`a`);n.href=t,n.download=`${g}-investor-update.txt`,n.click()},de=()=>{j||P(Y),M(e=>!e)},$=()=>{H.trim()&&(V(e=>[...e,{id:`item-${Date.now()}`,category:W,text:H.trim()}]),U(``))},fe={wins:{label:`✅ Wins`,color:`var(--green)`,bg:`var(--green-dim)`},challenges:{label:`⚠️ Challenges`,color:`var(--amber)`,bg:`var(--amber-dim)`},asks:{label:`🙏 Asks`,color:`var(--accent)`,bg:`var(--accent-dim)`}};return(0,p.jsxs)(`div`,{className:`max-w-[1400px] mx-auto space-y-6`,children:[(0,p.jsx)(ee,{icon:l,title:`Investor Update`,subtitle:`Draft your investor update in seconds`,badge:(0,p.jsx)(ne,{color:`var(--accent-light)`,size:`sm`,children:G}),actions:(0,p.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,p.jsx)(a,{variant:`ghost`,size:`sm`,icon:u,onClick:Q,children:`Download`}),(0,p.jsx)(a,{variant:`secondary`,size:`sm`,icon:k?o:c,onClick:Z,children:k?`Copied!`:`Copy Email`})]})}),(0,p.jsxs)(`div`,{className:`grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-5`,children:[(0,p.jsxs)(`div`,{className:`space-y-4`,children:[(0,p.jsxs)(i,{children:[(0,p.jsx)(`div`,{className:`font-bold text-xs text-[var(--text-muted)] uppercase tracking-widest mb-3`,children:`Tone`}),(0,p.jsx)(`div`,{className:`space-y-2`,children:Object.entries(h).map(([e,t])=>(0,p.jsxs)(`button`,{onClick:()=>{se(e),M(!1)},className:`w-full flex items-center gap-3 p-3 rounded-[var(--radius-md)] border text-left transition-all`,style:{background:D===e?`var(--accent-dim)`:`transparent`,borderColor:D===e?`var(--accent)`:`var(--border)`},children:[(0,p.jsxs)(`div`,{className:`flex-1`,children:[(0,p.jsx)(`div`,{className:`text-sm font-bold`,style:{color:D===e?`var(--accent)`:`var(--text-primary)`},children:t.label}),(0,p.jsx)(`div`,{className:`text-[10px] text-[var(--text-muted)]`,children:t.desc})]}),D===e&&(0,p.jsx)(`div`,{className:`w-2 h-2 rounded-full bg-[var(--accent)]`})]},e))})]}),(0,p.jsxs)(i,{children:[(0,p.jsx)(`div`,{className:`font-bold text-xs text-[var(--text-muted)] uppercase tracking-widest mb-3`,children:`Frequency`}),(0,p.jsx)(`div`,{className:`flex gap-2`,children:[`monthly`,`quarterly`].map(e=>(0,p.jsx)(`button`,{onClick:()=>ce(e),className:`flex-1 py-2 rounded-[var(--radius-md)] text-xs font-bold capitalize border transition-all`,style:{background:O===e?`var(--accent)`:`transparent`,borderColor:O===e?`var(--accent)`:`var(--border)`,color:O===e?`white`:`var(--text-muted)`},children:e},e))})]}),(0,p.jsxs)(i,{children:[(0,p.jsx)(`div`,{className:`font-bold text-xs text-[var(--text-muted)] uppercase tracking-widest mb-3`,children:`Update Content`}),(0,p.jsx)(`div`,{className:`space-y-4`,children:[`wins`,`challenges`,`asks`].map(e=>{let t=fe[e],n=B.filter(t=>t.category===e);return(0,p.jsxs)(`div`,{children:[(0,p.jsx)(`div`,{className:`text-xs font-bold mb-2`,style:{color:t.color},children:t.label}),(0,p.jsxs)(`div`,{className:`space-y-1.5 mb-2`,children:[n.map(e=>(0,p.jsxs)(`div`,{className:`flex items-start gap-2 group`,children:[(0,p.jsx)(`span`,{className:`text-[10px] mt-1`,style:{color:t.color},children:`→`}),(0,p.jsx)(`span`,{className:`text-xs text-[var(--text-muted)] flex-1 leading-relaxed`,children:e.text}),(0,p.jsx)(`button`,{onClick:()=>V(t=>t.filter(t=>t.id!==e.id)),className:`opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-[var(--red)] transition-all shrink-0 mt-0.5`,children:`×`})]},e.id)),n.length===0&&(0,p.jsx)(`p`,{className:`text-[10px] text-[var(--text-muted)] italic`,children:`No items yet`})]})]},e)})}),(0,p.jsxs)(`div`,{className:`pt-3 border-t border-[var(--border-subtle)] space-y-2`,children:[(0,p.jsxs)(`select`,{value:W,onChange:e=>le(e.target.value),className:`w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]`,children:[(0,p.jsx)(`option`,{value:`wins`,children:`Win`}),(0,p.jsx)(`option`,{value:`challenges`,children:`Challenge`}),(0,p.jsx)(`option`,{value:`asks`,children:`Ask`})]}),(0,p.jsxs)(`div`,{className:`flex gap-2`,children:[(0,p.jsx)(`input`,{type:`text`,value:H,onChange:e=>U(e.target.value),onKeyDown:e=>e.key===`Enter`&&$(),placeholder:`Add bullet point…`,className:`flex-1 bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-1.5 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]`}),(0,p.jsx)(a,{variant:`primary`,size:`sm`,onClick:$,children:`+`})]})]})]})]}),(0,p.jsxs)(i,{className:`flex flex-col`,children:[(0,p.jsxs)(`div`,{className:`flex items-center justify-between mb-4 pb-3 border-b border-[var(--border)]`,children:[(0,p.jsxs)(`div`,{className:`flex items-center gap-3`,children:[(0,p.jsx)(`div`,{className:`w-8 h-8 rounded-[var(--radius-md)] bg-[var(--accent-dim)] flex items-center justify-center`,children:(0,p.jsx)(l,{size:15,style:{color:`var(--accent)`}})}),(0,p.jsxs)(`div`,{children:[(0,p.jsx)(`div`,{className:`font-bold text-sm`,children:`Email Preview`}),(0,p.jsxs)(`div`,{className:`text-[10px] text-[var(--text-muted)]`,children:[h[D].label,` · `,O]})]})]}),(0,p.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,p.jsx)(a,{variant:`ghost`,size:`sm`,icon:ie,onClick:de,children:j?`Auto-generate`:`Edit`}),(0,p.jsx)(a,{variant:`ghost`,size:`sm`,icon:s,onClick:()=>M(!1),children:`Refresh`}),F.length>0&&(0,p.jsxs)(`div`,{className:`relative`,children:[(0,p.jsxs)(`button`,{onClick:()=>R(e=>!e),className:`flex items-center gap-1.5 px-2.5 py-1.5 rounded-[var(--radius-md)] text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.05)] transition-colors border border-[var(--border)]`,title:`Draft history`,children:[(0,p.jsx)(ae,{size:12}),(0,p.jsx)(re,{size:10,style:{transform:L?`rotate(180deg)`:`none`,transition:`transform 0.15s`}})]}),L&&(0,p.jsxs)(`div`,{className:`absolute right-0 top-full mt-1 w-72 bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-elevated)] z-50 overflow-hidden`,children:[(0,p.jsx)(`div`,{className:`px-3 py-2 border-b border-[var(--border)] text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest`,children:`Saved Drafts`}),F.map(e=>(0,p.jsxs)(`button`,{onClick:()=>ue(e),className:`w-full text-left px-3 py-2.5 hover:bg-[rgba(255,255,255,0.04)] transition-colors border-b border-[var(--border-subtle)] last:border-0`,children:[(0,p.jsxs)(`div`,{className:`text-xs font-medium text-[var(--text-primary)] truncate`,children:[e.text.slice(0,60),`…`]}),(0,p.jsx)(`div`,{className:`text-[10px] text-[var(--text-muted)] mt-0.5`,children:new Date(e.timestamp).toLocaleString(void 0,{month:`short`,day:`numeric`,hour:`2-digit`,minute:`2-digit`})})]},e.id))]})]})]})]}),j?(0,p.jsx)(`textarea`,{value:N,onChange:e=>P(e.target.value),className:`flex-1 min-h-[500px] bg-[var(--bg-base)] border border-[var(--border)] rounded-[var(--radius-lg)] p-4 text-sm font-mono text-[var(--text-primary)] resize-none focus:outline-none focus:border-[var(--accent)] leading-relaxed`}):(0,p.jsx)(r.div,{initial:{opacity:0},animate:{opacity:1},className:`flex-1 min-h-[500px] bg-[var(--bg-base)] rounded-[var(--radius-lg)] p-5 overflow-y-auto custom-scrollbar`,children:(0,p.jsx)(`pre`,{className:`text-sm font-mono text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed`,children:Y})},D+O+B.length),(0,p.jsxs)(`div`,{className:`flex items-center gap-3 mt-4 pt-3 border-t border-[var(--border)]`,children:[(0,p.jsx)(a,{variant:`primary`,icon:k?o:c,onClick:Z,children:k?`Copied to clipboard!`:`Copy Email`}),(0,p.jsx)(a,{variant:`secondary`,icon:u,onClick:Q,children:`Download .txt`}),(0,p.jsxs)(`span`,{className:`text-xs text-[var(--text-muted)] ml-auto`,children:[Y.split(/\s+/).length,` words`]})]})]})]}),(0,p.jsxs)(i,{children:[(0,p.jsx)(`div`,{className:`font-bold text-sm mb-4`,children:`Investor Update Best Practices`}),(0,p.jsx)(`div`,{className:`grid grid-cols-1 md:grid-cols-3 gap-4`,children:[{icon:`📅`,title:`Cadence`,tips:[`Send monthly at minimum`,`Quarterly for angels/advisors`,`Consistency builds trust`,`Never go dark — even bad news`]},{icon:`📊`,title:`Content`,tips:[`Lead with the single best metric`,`Be specific — numbers over adjectives`,`Name challenges before investors ask`,`"Ask" section drives actual help`]},{icon:`💬`,title:`Tone`,tips:[`Write like a founder, not a PR team`,`Transparency builds long-term trust`,`Short is better — respect their time`,`Include a clear, specific ask`]}].map((e,t)=>(0,p.jsxs)(`div`,{className:`space-y-2`,children:[(0,p.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,p.jsx)(`span`,{className:`text-xl`,children:e.icon}),(0,p.jsx)(`span`,{className:`font-bold text-sm`,children:e.title})]}),(0,p.jsx)(`ul`,{className:`space-y-1.5`,children:e.tips.map((e,t)=>(0,p.jsxs)(`li`,{className:`flex items-start gap-2 text-xs text-[var(--text-muted)]`,children:[(0,p.jsx)(`span`,{className:`text-[var(--green)] mt-0.5`,children:`✓`}),e]},t))})]},t))})]})]})}export{g as default};