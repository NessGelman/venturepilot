// src/utils/ai.ts
// AI backends in priority order:
//   1. Pollinations AI  — free, no API key, GPT-4o quality, works on GitHub Pages
//   2. Chrome AI        — Gemini Nano built into Chrome 127+, instant, fully local
//   3. none             — AI unavailable (offline)
//
// GitHub Pages note: https://text.pollinations.ai must be in the CSP connect-src
// (see index.html). No server-side code required — all calls are browser-to-API.

export type AIBackend = 'pollinations' | 'chrome' | 'none';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AISession {
  backend: AIBackend;
  modelName: string;
  /**
   * Send a full conversation (system + history + current user message).
   * Returns the assistant's reply as a string.
   */
  chat: (messages: ChatMessage[], signal?: AbortSignal) => Promise<string>;
  /**
   * Same as chat() but streams partial results via onUpdate callbacks.
   * onUpdate receives the full accumulated text so far on each call.
   */
  chatStreaming?: (
    messages: ChatMessage[],
    onUpdate: (partial: string) => void,
    signal?: AbortSignal,
  ) => Promise<void>;
  destroy: () => void;
}

export interface AIStatus {
  backend: AIBackend;
  ready: boolean;
  loading: boolean;
  progress: number;
  error: string | null;
  modelName: string;
}

// ── System prompt ───────────────────────────────────────────────────────────

/** Build a context-aware system prompt tailored to the company's current situation. */
export function generateSystemPrompt(state: any, derived: any, currentPage?: string): string {
  const name = state?.companyName || state?.idea || 'the startup';
  const stage = state?.stage || 'Seed';
  const industry = state?.industry || 'B2B SaaS';
  const runway = derived?.runwayMonths ?? 0;
  const mrr = state?.revenue ?? 0;
  const growth = state?.growth ?? 0;
  const ltv = derived?.ltv ?? 0;
  const cac = state?.cac ?? 1;
  const ltvCac = cac > 0 && ltv > 0 ? ltv / cac : 0;
  const burnMultiple = derived?.burnMultiple ?? 0;
  const ruleOf40 = derived?.ruleOf40 ?? 0;
  const teamSize = state?.teamSize ?? 1;

  const isCritical = runway > 0 && runway < 6;
  const isWarning = runway >= 6 && runway < 9;
  const isHealthy = ltvCac >= 3 && burnMultiple <= 2 && runway >= 12;
  const mode = isCritical ? 'SURVIVAL MODE' : isHealthy ? 'GROWTH MODE' : 'BUILDING MODE';

  const dangerZones: string[] = [];
  if (isCritical) dangerZones.push(`CRITICAL: only ${runway} months of runway — fundraise or cut burn immediately`);
  if (isWarning) dangerZones.push(`WARNING: ${runway} months runway — begin fundraising now`);
  if (ltvCac < 1 && cac > 0) dangerZones.push(`LTV:CAC is ${ltvCac.toFixed(1)}× — below breakeven`);
  if (burnMultiple > 3) dangerZones.push(`Burn Multiple ${burnMultiple.toFixed(1)}× — very high capital inefficiency`);
  if (growth < 5 && mrr > 0) dangerZones.push(`MoM growth only ${growth}% — below investor thresholds`);

  const extras: string[] = [];
  if (state?.problem) extras.push(`Problem: ${state.problem}`);
  if (state?.traction) extras.push(`Traction: ${state.traction}`);
  if (state?.northStar) extras.push(`North Star: ${state.northStar}`);
  if (state?.targetCustomer) extras.push(`Target Customer: ${state.targetCustomer}`);
  if (state?.solutionStatement) extras.push(`Solution: ${state.solutionStatement}`);
  if (state?.competitors) extras.push(`Competitors: ${state.competitors}`);

  const pageCtx = currentPage ? `\nFOCUS AREA: Founder is currently on the ${currentPage} page.` : '';

  return `You are a sharp, direct venture capital advisor embedded in VenturePilot — a founder OS for ${name}.

COMPANY SNAPSHOT:
- Company: ${name} | Stage: ${stage} | Industry: ${industry} | Team: ${teamSize}
- MRR: $${mrr.toLocaleString()} | MoM Growth: ${growth}% | Gross Margin: ${state?.grossMargin ?? 0}% | NDR: ${state?.ndr ?? 0}%
- Runway: ${runway >= 999 ? 'profitable / infinite' : `${runway} months`}
- LTV:CAC: ${ltvCac > 0 ? `${ltvCac.toFixed(1)}×` : 'not set'} (healthy = 3×+)
- Burn Multiple: ${burnMultiple > 0 ? `${burnMultiple.toFixed(1)}×` : 'N/A'} (excellent = <1.5×)
- Rule of 40: ${ruleOf40.toFixed(0)}% (threshold = 40%+)
- Cash: $${(state?.capital ?? 0).toLocaleString()} | Target Raise: $${(state?.targetRaise ?? 0).toLocaleString()}
${extras.length > 0 ? `\nCONTEXT:\n${extras.join('\n')}` : ''}${pageCtx}

ADVISOR MODE: ${mode}
${dangerZones.length > 0 ? `\nDANGER ZONES:\n${dangerZones.map(d => `⚠️ ${d}`).join('\n')}` : ''}

INSTRUCTIONS:
${isCritical
    ? `Survival mode. Lead with urgency. Be direct about severity. Every suggestion must center on extending runway or accelerating revenue.`
    : isHealthy
    ? `Healthy metrics. Focus on growth acceleration, fundraise positioning, and scaling efficiently. Acknowledge what's working.`
    : `Building mode. Balanced, specific advice — acknowledge progress, identify highest-leverage next actions.`
}
- This is a conversation — remember earlier messages and build on them
- Be direct, specific, and actionable. No fluff or generic advice.
- Use **bold** and bullet points for structure when helpful
- Ground every suggestion in the actual metrics above
- Match response length to the question — short for simple, detailed for complex`;
}

// ── Pollinations backend ────────────────────────────────────────────────────
// Free, no API key, CORS-enabled, works on GitHub Pages. All calls are browser-to-API.

// OpenAI-compatible endpoint (fixes 404 from the bare root URL)
const POLLINATIONS_URL = 'https://text.pollinations.ai/openai/chat/completions';
const PRIMARY_MODEL = 'openai';         // GPT-4o-mini — 3-4× faster than openai-large
const FALLBACK_MODEL = 'mistral';       // Mistral 7B — fast free fallback
const MAX_HISTORY_TURNS = 6;            // keep last 6 turns; fewer = faster responses

async function pollinationsFetch(
  messages: ChatMessage[],
  model: string,
  stream: boolean,
  signal?: AbortSignal,
): Promise<Response> {
  const res = await fetch(POLLINATIONS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, model, stream }),
    signal,
  });
  if (!res.ok) throw new Error(`AI API error ${res.status}`);
  return res;
}

function createPollinationsSession(): AISession {

  return {
    backend: 'pollinations',
    modelName: 'GPT-4o mini',

    chat: async (messages: ChatMessage[], signal?: AbortSignal) => {
      const trimmed = trimHistory(messages);
      const parseReply = async (res: Response) => {
        const json = await res.json();
        return json.choices?.[0]?.message?.content ?? '';
      };
      try {
        return parseReply(await pollinationsFetch(trimmed, PRIMARY_MODEL, false, signal));
      } catch (err: any) {
        if (err?.name === 'AbortError') throw err;
        return parseReply(await pollinationsFetch(trimmed, FALLBACK_MODEL, false, signal));
      }
    },

    chatStreaming: async (
      messages: ChatMessage[],
      onUpdate: (partial: string) => void,
      signal?: AbortSignal,
    ) => {
      const trimmed = trimHistory(messages);
      let res: Response;
      try {
        res = await pollinationsFetch(trimmed, PRIMARY_MODEL, true, signal);
      } catch (err: any) {
        if (err?.name === 'AbortError') throw err;
        // Fall back to non-streaming with fallback model
        const fallback = await pollinationsFetch(trimmed, FALLBACK_MODEL, false, signal);
        const json = await fallback.json();
        onUpdate(json.choices?.[0]?.message?.content ?? '');
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let accumulated = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (signal?.aborted) break;

          const chunk = decoder.decode(value, { stream: true });
          for (const line of chunk.split('\n')) {
            if (!line.startsWith('data: ')) continue;
            const data = line.slice(6).trim();
            if (data === '[DONE]') return;
            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                accumulated += delta;
                onUpdate(accumulated);
              }
            } catch {
              // malformed SSE chunk, skip
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    },

    destroy: () => {},
  };
}

function withFallbackSession(primary: AISession, fallback: AISession | null): AISession {
  if (!fallback) return primary;

  return {
    backend: primary.backend,
    modelName: `${primary.modelName} (fallback: ${fallback.modelName})`,
    chat: async (messages: ChatMessage[], signal?: AbortSignal) => {
      try {
        return await primary.chat(messages, signal);
      } catch (err: any) {
        if (err?.name === 'AbortError') throw err;
        return fallback.chat(messages, signal);
      }
    },
    chatStreaming: async (
      messages: ChatMessage[],
      onUpdate: (partial: string) => void,
      signal?: AbortSignal,
    ) => {
      if (primary.chatStreaming) {
        try {
          return await primary.chatStreaming(messages, onUpdate, signal);
        } catch (err: any) {
          if (err?.name === 'AbortError') throw err;
        }
      }
      if (fallback.chatStreaming) return fallback.chatStreaming(messages, onUpdate, signal);
      const text = await fallback.chat(messages, signal);
      onUpdate(text);
    },
    destroy: () => {
      primary.destroy();
      fallback.destroy();
    },
  };
}

/**
 * Trim history to the last MAX_HISTORY_TURNS user+assistant pairs
 * while always keeping the system prompt at index 0.
 */
function trimHistory(messages: ChatMessage[]): ChatMessage[] {
  const system = messages.filter(m => m.role === 'system');
  const convo = messages.filter(m => m.role !== 'system');
  const maxMessages = MAX_HISTORY_TURNS * 2; // each turn = 1 user + 1 assistant
  const trimmed = convo.slice(-maxMessages);
  return [...system, ...trimmed];
}

// ── Chrome AI backend ───────────────────────────────────────────────────────

async function createChromeSession(): Promise<AISession | null> {
  if (!('ai' in window) || !('languageModel' in (window as any).ai)) return null;
  try {
    const caps = await (window as any).ai.languageModel.capabilities();
    if (caps.available === 'no') return null;
    const session = await (window as any).ai.languageModel.create();

    const flattenMessages = (messages: ChatMessage[]) => {
      const system = messages.find(m => m.role === 'system')?.content ?? '';
      const convo = messages
        .filter(m => m.role !== 'system')
        .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
        .join('\n\n');
      return system ? `${system}\n\n${convo}` : convo;
    };

    return {
      backend: 'chrome',
      modelName: 'Gemini Nano',

      chat: async (messages: ChatMessage[], signal?: AbortSignal) => {
        const text = flattenMessages(trimHistory(messages));
        return session.prompt(text, { signal });
      },

      chatStreaming: async (
        messages: ChatMessage[],
        onUpdate: (partial: string) => void,
        signal?: AbortSignal,
      ) => {
        const text = flattenMessages(trimHistory(messages));
        const stream = await session.promptStreaming(text, { signal });
        for await (const chunk of stream) {
          if (signal?.aborted) break;
          onUpdate(chunk); // Chrome AI yields the full accumulated string each time
        }
      },

      destroy: () => {
        try { session.destroy(); } catch {}
      },
    };
  } catch {
    return null;
  }
}

// ── Public factory ──────────────────────────────────────────────────────────

/**
 * Creates an AI session. Pollinations is always available (no download, no key).
 * Chrome AI is used if Pollinations is unavailable (offline) and Chrome 127+ is detected.
 * Session creation is instant — no connectivity pre-check is done at startup.
 * Errors surface at call time with clear messages.
 */
export async function createAISession(_onProgress?: (status: AIStatus) => void): Promise<AISession> {
  // Chrome AI: local, instant if available.
  const chromeSession = await createChromeSession();

  // Pollinations: primary model for quality.
  const pollinationsSession = createPollinationsSession();

  // Ensure local Chrome AI can actually take over when network calls fail.
  return withFallbackSession(pollinationsSession, chromeSession);
}
