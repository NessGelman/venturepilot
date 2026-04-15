// src/utils/investorMatch.ts
// Deterministic investor scoring engine — no network calls, runs in <10ms for 400 records.
// Scores each investor 0–100 based on how well they match the founder's current startup profile.

export interface InvestorDBRecord {
  id: string;
  name: string;
  firm: string;
  title: string;
  tier: 'Tier 1' | 'Tier 2' | 'Tier 3' | 'Angel';
  linkedin: string | null;
  website: string;
  sectors: string[];
  stages: string[];
  checkSizeMin: number;
  checkSizeMax: number;
  notablePortfolio: string[];
  bio: string;
  contactForm: string | null;
}

export interface MatchTag {
  label: string;
  type: 'sector' | 'stage' | 'check' | 'thesis' | 'metric';
  matched: boolean;
}

export interface MatchResult {
  investor: InvestorDBRecord;
  score: number;         // 0–100
  tags: MatchTag[];
  breakdown: {
    sector: number;
    stage: number;
    checkSize: number;
    keyword: number;
    financialBonus: number;
  };
}

export interface StartupProfile {
  industry: string;        // e.g. "B2B SaaS"
  stage: string;           // e.g. "Seed"
  targetRaise: number;     // e.g. 2_000_000
  idea: string;
  productDescription: string;
  competitors: string;
  traction: string;
  revenue: number;
  growth: number;          // MoM % growth
  runwayMonths: number;
  burnMultiple: number;
  ltvCac: number;
  teamSize: number;
}

// ─── Sector synonym map ────────────────────────────────────────────────────────
// Maps common user-entered industry strings to the sector tags used in the DB.
const SECTOR_SYNONYMS: Record<string, string[]> = {
  'b2b saas':          ['B2B SaaS', 'SaaS', 'Enterprise Software', 'Enterprise', 'Cloud', 'Developer Tools'],
  'saas':              ['B2B SaaS', 'SaaS', 'Enterprise Software', 'Cloud'],
  'enterprise':        ['Enterprise Software', 'B2B SaaS', 'SaaS', 'Enterprise'],
  'fintech':           ['Fintech', 'Payments', 'Lending', 'Banking', 'Insurance', 'Wealth Management'],
  'payments':          ['Payments', 'Fintech', 'Banking'],
  'crypto':            ['Crypto', 'Web3', 'Blockchain', 'DeFi', 'Fintech'],
  'web3':              ['Web3', 'Crypto', 'Blockchain', 'DeFi'],
  'ai':                ['AI/ML', 'AI', 'Machine Learning', 'Deep Learning', 'Infrastructure'],
  'ai/ml':             ['AI/ML', 'AI', 'Machine Learning', 'Infrastructure', 'Data'],
  'ml':                ['AI/ML', 'AI', 'Machine Learning'],
  'developer tools':   ['Developer Tools', 'Infrastructure', 'Open Source', 'DevOps', 'Cloud'],
  'devtools':          ['Developer Tools', 'Infrastructure', 'Open Source', 'DevOps'],
  'infrastructure':    ['Infrastructure', 'Cloud', 'Developer Tools', 'DevOps', 'Open Source'],
  'healthcare':        ['Healthcare', 'Digital Health', 'Biotech', 'MedTech', 'Healthcare IT'],
  'digital health':    ['Digital Health', 'Healthcare', 'Healthcare IT', 'MedTech'],
  'biotech':           ['Biotech', 'Life Sciences', 'Drug Development', 'Therapeutics', 'Healthcare'],
  'climate':           ['Climate Tech', 'Clean Energy', 'Sustainability', 'Deep Tech', 'Carbon Removal'],
  'clean energy':      ['Clean Energy', 'Climate Tech', 'Renewable Energy', 'Energy Tech'],
  'consumer':          ['Consumer', 'Social', 'Marketplace', 'E-commerce', 'D2C'],
  'marketplace':       ['Marketplace', 'Consumer', 'E-commerce', 'Network Effects'],
  'deep tech':         ['Deep Tech', 'Hardware', 'Space Tech', 'Advanced Manufacturing'],
  'hardware':          ['Hardware', 'Deep Tech', 'IoT', 'Manufacturing'],
  'edtech':            ['EdTech', 'Consumer', 'B2B SaaS', 'Enterprise'],
  'proptech':          ['PropTech', 'Real Estate Tech', 'Marketplace'],
  'insurtech':         ['InsurTech', 'Fintech', 'Insurance'],
  'legaltech':         ['LegalTech', 'B2B SaaS', 'Enterprise Software'],
  'hrtech':            ['HR Tech', 'Future of Work', 'B2B SaaS', 'Enterprise'],
  'future of work':    ['Future of Work', 'B2B SaaS', 'Enterprise Software'],
  'gaming':            ['Gaming', 'Consumer', 'Entertainment'],
  'media':             ['Media', 'Consumer', 'Entertainment', 'Creator Economy'],
  'security':          ['Cybersecurity', 'Infrastructure', 'B2B SaaS', 'Enterprise'],
  'cybersecurity':     ['Cybersecurity', 'Infrastructure', 'B2B SaaS', 'Enterprise'],
  'data':              ['Data', 'Infrastructure', 'AI/ML', 'Analytics', 'B2B SaaS'],
};

// ─── Stage adjacency ───────────────────────────────────────────────────────────
const STAGE_ORDER = ['Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C', 'Growth'];

function stageDistance(userStage: string, investorStages: string[]): number {
  const userNorm = normalizeStage(userStage);
  const userIdx = STAGE_ORDER.indexOf(userNorm);
  if (userIdx === -1) return -1; // unknown stage

  let minDist = Infinity;
  for (const s of investorStages) {
    const norm = normalizeStage(s);
    const idx = STAGE_ORDER.indexOf(norm);
    if (idx === -1) continue;
    minDist = Math.min(minDist, Math.abs(userIdx - idx));
  }
  return minDist === Infinity ? 3 : minDist;
}

function normalizeStage(s: string): string {
  const lower = s.toLowerCase().trim();
  if (lower.includes('pre') || lower.includes('pre-seed') || lower.includes('preseed')) return 'Pre-Seed';
  if (lower.includes('seed') && !lower.includes('series')) return 'Seed';
  if (lower.includes('series a') || lower === 'a') return 'Series A';
  if (lower.includes('series b') || lower === 'b') return 'Series B';
  if (lower.includes('series c') || lower === 'c') return 'Series C';
  if (lower.includes('growth') || lower.includes('later') || lower.includes('expansion')) return 'Growth';
  if (lower.includes('angel')) return 'Pre-Seed';
  return s;
}

// ─── Sector matching ───────────────────────────────────────────────────────────
function getSectorAliases(industry: string): string[] {
  const key = industry.toLowerCase().trim();
  // Direct lookup
  if (SECTOR_SYNONYMS[key]) return [industry, ...SECTOR_SYNONYMS[key]];
  // Partial match
  for (const [k, aliases] of Object.entries(SECTOR_SYNONYMS)) {
    if (key.includes(k) || k.includes(key)) {
      return [industry, ...aliases];
    }
  }
  return [industry];
}

function sectorScore(userIndustry: string, investorSectors: string[]): number {
  if (!userIndustry || investorSectors.length === 0) return 0;
  const aliases = getSectorAliases(userIndustry).map(s => s.toLowerCase());
  const invLower = investorSectors.map(s => s.toLowerCase());

  let matches = 0;
  for (const alias of aliases) {
    for (const inv of invLower) {
      if (inv === alias || inv.includes(alias) || alias.includes(inv)) {
        matches++;
        break;
      }
    }
  }

  if (matches === 0) return 0;
  if (matches >= 3) return 40;
  if (matches === 2) return 28;
  return 18;
}

// ─── Check size matching ───────────────────────────────────────────────────────
function checkSizeScore(targetRaise: number, min: number, max: number): number {
  if (!targetRaise || targetRaise <= 0 || min <= 0 || max <= 0) return 10; // neutral
  if (targetRaise >= min && targetRaise <= max) return 20;
  // Close (within 2×)
  if (targetRaise >= min * 0.5 && targetRaise <= max * 2) return 12;
  // Adjacent (within 4×)
  if (targetRaise >= min * 0.25 && targetRaise <= max * 4) return 6;
  return 0;
}

// ─── Keyword overlap ───────────────────────────────────────────────────────────
const STOP_WORDS = new Set(['and', 'the', 'for', 'are', 'with', 'this', 'that', 'have', 'from',
  'not', 'but', 'you', 'all', 'can', 'was', 'had', 'our', 'one', 'been', 'its',
  'who', 'has', 'their', 'will', 'more', 'also', 'into', 'than', 'then', 'they',
  'when', 'there', 'which', 'your', 'what', 'about', 'some', 'just', 'like']);

function tokenize(text: string): Set<string> {
  return new Set(
    text.toLowerCase()
      .replace(/[^a-z0-9 ]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 3 && !STOP_WORDS.has(w))
  );
}

function keywordScore(profile: StartupProfile, investor: InvestorDBRecord): number {
  const profileText = [
    profile.idea, profile.productDescription, profile.competitors,
    profile.traction, profile.industry
  ].join(' ');

  const investorText = [
    investor.bio,
    investor.sectors.join(' '),
    investor.notablePortfolio.join(' ')
  ].join(' ');

  const profileTokens = tokenize(profileText);
  const investorTokens = tokenize(investorText);

  let matches = 0;
  for (const token of profileTokens) {
    if (investorTokens.has(token)) matches++;
  }
  return Math.min(15, matches * 3);
}

// ─── Financial bonus ───────────────────────────────────────────────────────────
function financialBonus(profile: StartupProfile, investor: InvestorDBRecord): number {
  let bonus = 0;

  // Pre-revenue startup → boost pre-seed/seed specialists
  if (profile.revenue === 0 || !profile.revenue) {
    const stages = investor.stages.map(s => s.toLowerCase());
    if (stages.some(s => s.includes('pre-seed') || s.includes('seed'))) bonus += 8;
  }

  // Very high growth (>30% MoM) → boost Tier 1 investors who want rocketships
  if (profile.growth >= 30 && investor.tier === 'Tier 1') bonus += 8;

  // Good metrics (LTV:CAC > 3, burn multiple < 2) → boost investors focused on SaaS/unit economics
  if (profile.ltvCac >= 3 && profile.burnMultiple > 0 && profile.burnMultiple <= 2) {
    const bio = investor.bio.toLowerCase();
    if (bio.includes('saas') || bio.includes('unit economics') || bio.includes('growth')) bonus += 5;
  }

  // Critical runway (<6 months) → deprioritize investors known for long process
  if (profile.runwayMonths > 0 && profile.runwayMonths < 6) {
    if (investor.tier === 'Tier 1') bonus -= 5; // Tier 1 = slow process
    if (investor.tier === 'Angel') bonus += 8;  // Angels = faster
  }

  // Large raise (>$10M) → deprioritize angels and micro VCs
  if (profile.targetRaise > 10_000_000) {
    if (investor.tier === 'Angel') bonus -= 15;
    if (investor.checkSizeMax < 2_000_000) bonus -= 10;
  }

  // Small raise (<$500K) → deprioritize big VCs
  if (profile.targetRaise > 0 && profile.targetRaise < 500_000) {
    if (investor.checkSizeMin > 2_000_000) bonus -= 10;
  }

  // Team size 1-2 → weight angels and pre-seed more
  if (profile.teamSize <= 2) {
    if (investor.tier === 'Angel') bonus += 5;
    const stages = investor.stages.map(s => s.toLowerCase());
    if (stages.some(s => s.includes('pre-seed'))) bonus += 5;
  }

  return bonus;
}

// ─── Tag generation ────────────────────────────────────────────────────────────
function generateTags(
  profile: StartupProfile,
  investor: InvestorDBRecord,
  _breakdown: MatchResult['breakdown']
): MatchTag[] {
  const tags: MatchTag[] = [];

  // Sector tag
  const sectorAliases = getSectorAliases(profile.industry).map(s => s.toLowerCase());
  const invSectors = investor.sectors.map(s => s.toLowerCase());
  const sectorMatched = sectorAliases.some(a => invSectors.some(s => s.includes(a) || a.includes(s)));
  if (investor.sectors.length > 0) {
    const topSector = investor.sectors[0];
    tags.push({ label: `Invests in ${topSector}`, type: 'sector', matched: sectorMatched });
  }

  // Stage tag
  const stageDist = stageDistance(profile.stage, investor.stages);
  const stageMatched = stageDist === 0;
  const stageNear = stageDist <= 1;
  if (investor.stages.length > 0) {
    const stageLabel = investor.stages.length === 1
      ? investor.stages[0]
      : `${investor.stages[0]}–${investor.stages[investor.stages.length - 1]}`;
    tags.push({ label: stageLabel, type: 'stage', matched: stageMatched || stageNear });
  }

  // Check size tag
  const hasRaise = profile.targetRaise > 0;
  const checkMatched = hasRaise && investor.checkSizeMin > 0 &&
    profile.targetRaise >= investor.checkSizeMin * 0.5 &&
    profile.targetRaise <= investor.checkSizeMax * 2;
  if (investor.checkSizeMin > 0) {
    const formatM = (n: number) => n >= 1_000_000 ? `$${n / 1_000_000}M` : `$${n / 1_000}K`;
    tags.push({
      label: `${formatM(investor.checkSizeMin)}–${formatM(investor.checkSizeMax)} checks`,
      type: 'check',
      matched: checkMatched
    });
  }

  // Financial context tag
  if (profile.runwayMonths > 0 && profile.runwayMonths < 6 && investor.tier === 'Angel') {
    tags.push({ label: 'Fast decisions', type: 'metric', matched: true });
  }
  if (profile.growth >= 30 && investor.tier === 'Tier 1') {
    tags.push({ label: 'Backs high-growth', type: 'metric', matched: true });
  }
  if (profile.revenue === 0 && investor.stages.map(s => s.toLowerCase()).some(s => s.includes('seed'))) {
    tags.push({ label: 'Pre-revenue friendly', type: 'metric', matched: true });
  }

  return tags.slice(0, 4); // cap at 4 tags
}

// ─── Main scoring function ─────────────────────────────────────────────────────
export function scoreInvestor(investor: InvestorDBRecord, profile: StartupProfile): MatchResult {
  const sector  = sectorScore(profile.industry, investor.sectors);
  const stageDist = stageDistance(profile.stage, investor.stages);
  const stage   = stageDist === 0 ? 25 : stageDist === 1 ? 15 : stageDist === 2 ? 6 : 0;
  const checkSz = checkSizeScore(profile.targetRaise, investor.checkSizeMin, investor.checkSizeMax);
  const keyword = keywordScore(profile, investor);
  const finBonus = financialBonus(profile, investor);

  const raw = sector + stage + checkSz + keyword + finBonus;
  const score = Math.max(0, Math.min(100, raw));

  const breakdown = { sector, stage, checkSize: checkSz, keyword, financialBonus: finBonus };
  const tags = generateTags(profile, investor, breakdown);

  return { investor, score, tags, breakdown };
}

// ─── Batch scoring ─────────────────────────────────────────────────────────────
export function rankInvestors(
  investors: InvestorDBRecord[],
  profile: StartupProfile,
  limit = 50
): MatchResult[] {
  return investors
    .map(inv => scoreInvestor(inv, profile))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// ─── Score color helper ────────────────────────────────────────────────────────
export function scoreColor(score: number): string {
  if (score >= 70) return 'var(--green)';
  if (score >= 45) return 'var(--amber)';
  return 'var(--text-muted)';
}

export function scoreBg(score: number): string {
  if (score >= 70) return 'var(--green-dim)';
  if (score >= 45) return 'var(--amber-dim)';
  return 'rgba(255,255,255,0.04)';
}
