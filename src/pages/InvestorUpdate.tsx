import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Copy, Check, Download, RefreshCw, Mail, Edit3, Sparkles, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { PageHeader, Card, Badge, Button } from '../components/Shared';

const fmt = (n: number, prefix = '$') => {
  if (!isFinite(n) || n === 0) return `${prefix}0`;
  if (n >= 1e9) return `${prefix}${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${prefix}${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${prefix}${(n / 1e3).toFixed(0)}K`;
  return `${prefix}${Math.round(n)}`;
};

type Tone = 'professional' | 'founder' | 'concise';
type Frequency = 'monthly' | 'quarterly';

const TONE_CONFIG: Record<Tone, { label: string; desc: string }> = {
  professional: { label: 'Professional', desc: 'Formal, investor-grade language' },
  founder: { label: 'Founder Voice', desc: 'Authentic, direct, transparent' },
  concise: { label: 'Concise', desc: 'TL;DR format — 5 bullets max' },
};

interface UpdateItem {
  id: string;
  category: 'wins' | 'challenges' | 'asks';
  text: string;
}

export default function InvestorUpdate() {
  const { state, derived } = useApp() as any;
  // Correct field names from AppState
  const ideaName = state?.companyName || state?.idea || 'Your Startup';
  const mrr = state?.revenue ?? 0;
  const arr = derived?.arr ?? mrr * 12;
  const burnRate = state?.burn ?? 0;
  const monthlyGrowth = state?.growth ?? 0;
  const runwayMonths = derived?.runwayMonths ?? 0;
  const ndr = state?.ndr ?? 100;
  const grossMargin = state?.grossMargin ?? 70;
  const teamSize = state?.teamSize ?? 3;
  const founderNames = state?.founder ?? '';
  const targetRaise = state?.targetRaise ?? 0;
  const stage = state?.stage ?? 'Seed';

  const [tone, setTone] = useState<Tone>('founder');
  const [frequency, setFrequency] = useState<Frequency>('monthly');
  const [copied, setCopied] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [customContent, setCustomContent] = useState('');
  const [items, setItems] = useState<UpdateItem[]>([
    { id: 'w1', category: 'wins', text: 'Closed 3 new enterprise contracts (+$12K MRR)' },
    { id: 'w2', category: 'wins', text: 'Shipped v2.0 with 40% faster onboarding' },
    { id: 'w3', category: 'wins', text: 'NPS improved to 62 (+8 points MoM)' },
    { id: 'c1', category: 'challenges', text: 'Enterprise sales cycles extending 30+ days' },
    { id: 'c2', category: 'challenges', text: 'Hiring senior engineer proving difficult' },
    { id: 'a1', category: 'asks', text: 'Intros to Series A investors with B2B SaaS experience' },
    { id: 'a2', category: 'asks', text: 'CFO candidates with SaaS experience' },
  ]);
  const [newItemText, setNewItemText] = useState('');
  const [newItemCat, setNewItemCat] = useState<UpdateItem['category']>('wins');

  const month = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  const prevMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleString('default', { month: 'long' });

  const wins = items.filter(i => i.category === 'wins');
  const challenges = items.filter(i => i.category === 'challenges');
  const asks = items.filter(i => i.category === 'asks');

  const generateUpdate = useMemo(() => {
    const currentArr = arr || mrr * 12;
    const greeting = `Hi [Investor Name],`;
    const subjectLine = `[${ideaName}] ${frequency === 'monthly' ? month : `Q${Math.ceil((new Date().getMonth() + 1) / 3)} ${new Date().getFullYear()}`} Investor Update`;

    const metrics = [
      { label: 'MRR', value: fmt(mrr), trend: monthlyGrowth > 0 ? 'up' : 'flat' },
      { label: 'ARR', value: fmt(currentArr), trend: 'up' },
      { label: 'MoM Growth', value: `${monthlyGrowth.toFixed(1)}%`, trend: monthlyGrowth >= 10 ? 'up' : 'flat' },
      { label: 'Runway', value: runwayMonths >= 999 ? '∞ (profitable)' : `${runwayMonths}mo`, trend: runwayMonths >= 12 ? 'up' : 'down' },
      { label: 'Burn/mo', value: fmt(burnRate), trend: 'flat' },
      { label: 'NDR', value: `${ndr.toFixed(0)}%`, trend: ndr >= 100 ? 'up' : 'down' },
    ];

    if (tone === 'concise') {
      return `Subject: ${subjectLine}

${greeting}

${month} TL;DR for ${ideaName}:

📊 Numbers
${metrics.slice(0, 4).map(m => `• ${m.label}: ${m.value}`).join('\n')}

✅ Wins
${wins.map(w => `• ${w.text}`).join('\n')}

⚠️ Challenges
${challenges.map(c => `• ${c.text}`).join('\n')}

🙏 Asks
${asks.map(a => `• ${a.text}`).join('\n')}

Onward,
${founderNames || '[Your Name]'}
${ideaName}`;
    }

    if (tone === 'professional') {
      return `Subject: ${subjectLine}

${greeting}

I hope this message finds you well. Please find below our ${frequency} business update for ${ideaName} for the period ending ${month}.

KEY METRICS
${metrics.map(m => `  ${m.label.padEnd(14)} ${m.value}`).join('\n')}

HIGHLIGHTS
${wins.map((w, i) => `${i + 1}. ${w.text}`).join('\n')}

CHALLENGES & RISK FACTORS
${challenges.map((c, i) => `${i + 1}. ${c.text}`).join('\n')}

INVESTOR REQUESTS
We would greatly appreciate assistance with the following:
${asks.map((a, i) => `${i + 1}. ${a.text}`).join('\n')}

FORWARD OUTLOOK
Based on current trajectory, we expect to reach ${fmt((mrr || 0) * (1 + monthlyGrowth / 100) * 3)} MRR within 90 days. ${targetRaise > 0 ? `We are actively pursuing our ${stage} raise of ${fmt(targetRaise)}.` : ''}

Thank you for your continued support. Please do not hesitate to reach out with any questions.

Best regards,
${founderNames || '[Your Name]'}
${ideaName}`;
    }

    // Founder voice (default)
    return `Subject: ${subjectLine}

${greeting}

${month} update — here's where we are.

The headline: we're ${monthlyGrowth >= 10 ? `growing at ${monthlyGrowth.toFixed(1)}% MoM and` : ''} at ${fmt(mrr)} MRR. ${runwayMonths >= 999 ? `We're profitable — no runway concerns.` : runwayMonths >= 12 ? `With ${runwayMonths} months of runway, we have time to execute.` : runwayMonths >= 6 ? `Runway is ${runwayMonths} months — we're actively fundraising.` : `Runway is ${runwayMonths} months — this is urgent and we're moving fast.`}

THE NUMBERS

${metrics.map(m => `${m.label}: ${m.value}`).join(' · ')}

WHAT'S WORKING
${wins.map(w => `→ ${w.text}`).join('\n')}

WHAT'S HARD
${challenges.map(c => `→ ${c.text}`).join('\n')}

Being honest here — these aren't excuses, just the current reality. Here's how we're addressing them: [your plan here]

WHERE YOU CAN HELP
${asks.map(a => `✦ ${a.text}`).join('\n')}

I'll be blunt: the most valuable thing you can do is make introductions. Even a warm email saying "I want you to meet [Founder]" changes the game.

${targetRaise > 0 ? `We're raising a ${stage} round of ${fmt(targetRaise)}. Happy to chat more if you know someone we should meet.\n\n` : ''}Thanks for backing us. More next ${frequency === 'monthly' ? 'month' : 'quarter'}.

${founderNames || '[Your Name]'}
${ideaName}
${founderNames ? `\n(reply directly to this email)` : ''}`;
  }, [mrr, arr, burnRate, monthlyGrowth, runwayMonths, ndr, grossMargin, teamSize, founderNames, ideaName, targetRaise, stage, tone, frequency, month, wins, challenges, asks]);

  const content = editMode ? customContent : generateUpdate;

  const copy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${ideaName}-investor-update.txt`; a.click();
  };

  const toggleEdit = () => {
    if (!editMode) setCustomContent(generateUpdate);
    setEditMode(v => !v);
  };

  const addItem = () => {
    if (!newItemText.trim()) return;
    setItems(prev => [...prev, { id: `item-${Date.now()}`, category: newItemCat, text: newItemText.trim() }]);
    setNewItemText('');
  };

  const CAT_CONFIG = {
    wins: { label: '✅ Wins', color: 'var(--green)', bg: 'var(--green-dim)' },
    challenges: { label: '⚠️ Challenges', color: 'var(--amber)', bg: 'var(--amber-dim)' },
    asks: { label: '🙏 Asks', color: 'var(--accent)', bg: 'var(--accent-dim)' },
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <PageHeader
        icon={Mail}
        title="Investor Update"
        subtitle="Draft your investor update in seconds"
        badge={<Badge color="var(--accent-light)" size="sm">{month}</Badge>}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" icon={Download} onClick={download}>Download</Button>
            <Button variant="secondary" size="sm" icon={copied ? Check : Copy} onClick={copy}>
              {copied ? 'Copied!' : 'Copy Email'}
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-5">
        {/* Left: Controls */}
        <div className="space-y-4">
          {/* Tone */}
          <Card>
            <div className="font-bold text-xs text-[var(--text-muted)] uppercase tracking-widest mb-3">Tone</div>
            <div className="space-y-2">
              {(Object.entries(TONE_CONFIG) as [Tone, typeof TONE_CONFIG[Tone]][]).map(([key, cfg]) => (
                <button key={key} onClick={() => { setTone(key); setEditMode(false); }}
                  className="w-full flex items-center gap-3 p-3 rounded-[var(--radius-md)] border text-left transition-all"
                  style={{ background: tone === key ? 'var(--accent-dim)' : 'transparent', borderColor: tone === key ? 'var(--accent)' : 'var(--border)' }}>
                  <div className="flex-1">
                    <div className="text-sm font-bold" style={{ color: tone === key ? 'var(--accent)' : 'var(--text-primary)' }}>{cfg.label}</div>
                    <div className="text-[10px] text-[var(--text-muted)]">{cfg.desc}</div>
                  </div>
                  {tone === key && <div className="w-2 h-2 rounded-full bg-[var(--accent)]" />}
                </button>
              ))}
            </div>
          </Card>

          {/* Frequency */}
          <Card>
            <div className="font-bold text-xs text-[var(--text-muted)] uppercase tracking-widest mb-3">Frequency</div>
            <div className="flex gap-2">
              {(['monthly', 'quarterly'] as const).map(f => (
                <button key={f} onClick={() => setFrequency(f)}
                  className="flex-1 py-2 rounded-[var(--radius-md)] text-xs font-bold capitalize border transition-all"
                  style={{ background: frequency === f ? 'var(--accent)' : 'transparent', borderColor: frequency === f ? 'var(--accent)' : 'var(--border)', color: frequency === f ? 'white' : 'var(--text-muted)' }}>
                  {f}
                </button>
              ))}
            </div>
          </Card>

          {/* Bullets editor */}
          <Card>
            <div className="font-bold text-xs text-[var(--text-muted)] uppercase tracking-widest mb-3">Update Content</div>
            <div className="space-y-4">
              {(['wins', 'challenges', 'asks'] as const).map(cat => {
                const cfg = CAT_CONFIG[cat];
                const catItems = items.filter(i => i.category === cat);
                return (
                  <div key={cat}>
                    <div className="text-xs font-bold mb-2" style={{ color: cfg.color }}>{cfg.label}</div>
                    <div className="space-y-1.5 mb-2">
                      {catItems.map(item => (
                        <div key={item.id} className="flex items-start gap-2 group">
                          <span className="text-[10px] mt-1" style={{ color: cfg.color }}>→</span>
                          <span className="text-xs text-[var(--text-muted)] flex-1 leading-relaxed">{item.text}</span>
                          <button onClick={() => setItems(prev => prev.filter(i => i.id !== item.id))}
                            className="opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-[var(--red)] transition-all shrink-0 mt-0.5">×</button>
                        </div>
                      ))}
                      {catItems.length === 0 && <p className="text-[10px] text-[var(--text-muted)] italic">No items yet</p>}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-[var(--border-subtle)] space-y-2">
              <select value={newItemCat} onChange={e => setNewItemCat(e.target.value as any)}
                className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]">
                <option value="wins">Win</option>
                <option value="challenges">Challenge</option>
                <option value="asks">Ask</option>
              </select>
              <div className="flex gap-2">
                <input type="text" value={newItemText} onChange={e => setNewItemText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addItem()}
                  placeholder="Add bullet point…"
                  className="flex-1 bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-1.5 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]" />
                <Button variant="primary" size="sm" onClick={addItem}>+</Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right: Email preview */}
        <Card className="flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border)]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-[var(--radius-md)] bg-[var(--accent-dim)] flex items-center justify-center">
                <Mail size={15} style={{ color: 'var(--accent)' }} />
              </div>
              <div>
                <div className="font-bold text-sm">Email Preview</div>
                <div className="text-[10px] text-[var(--text-muted)]">{TONE_CONFIG[tone].label} · {frequency}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" icon={Edit3} onClick={toggleEdit}>
                {editMode ? 'Auto-generate' : 'Edit'}
              </Button>
              <Button variant="ghost" size="sm" icon={RefreshCw} onClick={() => setEditMode(false)}>
                Refresh
              </Button>
            </div>
          </div>

          {editMode ? (
            <textarea
              value={customContent}
              onChange={e => setCustomContent(e.target.value)}
              className="flex-1 min-h-[500px] bg-[var(--bg-base)] border border-[var(--border)] rounded-[var(--radius-lg)] p-4 text-sm font-mono text-[var(--text-primary)] resize-none focus:outline-none focus:border-[var(--accent)] leading-relaxed"
            />
          ) : (
            <motion.div
              key={tone + frequency + items.length}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 min-h-[500px] bg-[var(--bg-base)] rounded-[var(--radius-lg)] p-5 overflow-y-auto custom-scrollbar"
            >
              <pre className="text-sm font-mono text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed">{generateUpdate}</pre>
            </motion.div>
          )}

          <div className="flex items-center gap-3 mt-4 pt-3 border-t border-[var(--border)]">
            <Button variant="primary" icon={copied ? Check : Copy} onClick={copy}>
              {copied ? 'Copied to clipboard!' : 'Copy Email'}
            </Button>
            <Button variant="secondary" icon={Download} onClick={download}>Download .txt</Button>
            <span className="text-xs text-[var(--text-muted)] ml-auto">{generateUpdate.split(/\s+/).length} words</span>
          </div>
        </Card>
      </div>

      {/* Best practices */}
      <Card>
        <div className="font-bold text-sm mb-4">Investor Update Best Practices</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: '📅', title: 'Cadence', tips: ['Send monthly at minimum', 'Quarterly for angels/advisors', 'Consistency builds trust', 'Never go dark — even bad news'] },
            { icon: '📊', title: 'Content', tips: ['Lead with the single best metric', 'Be specific — numbers over adjectives', 'Name challenges before investors ask', '"Ask" section drives actual help'] },
            { icon: '💬', title: 'Tone', tips: ['Write like a founder, not a PR team', 'Transparency builds long-term trust', 'Short is better — respect their time', 'Include a clear, specific ask'] },
          ].map((s, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{s.icon}</span>
                <span className="font-bold text-sm">{s.title}</span>
              </div>
              <ul className="space-y-1.5">
                {s.tips.map((tip, j) => (
                  <li key={j} className="flex items-start gap-2 text-xs text-[var(--text-muted)]">
                    <span className="text-[var(--green)] mt-0.5">✓</span>{tip}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
