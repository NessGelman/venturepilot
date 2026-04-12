// src/utils/ai.ts
// Unified in-browser LLM interface. Tries Chrome Prompt API first (instant, no download),
// falls back to WebLLM (downloads ~500MB model via WebGPU), then degrades to template mode.
//
// WebLLM model choice rationale:
// Model: Phi-3.5-mini-instruct-q4f16_1-MLC
// Size: ~2.2GB download, cached in browser IndexedDB after first load
// Why: Best quality/size ratio for in-browser use. Runs at ~20 tok/s on M1, ~8 tok/s on mid-range GPU.
// Alternative: Llama-3.2-1B-Instruct-q4f16_1-MLC (~800MB, faster, lower quality)
// Chrome AI alternative: Uses Gemini Nano built into Chrome 127+ — zero download, instant, best UX.

export type AIBackend = 'chrome' | 'webllm' | 'none';

export interface AISession {
  backend: AIBackend;
  prompt: (text: string, systemPrompt?: string) => Promise<string>;
  promptStreaming?: (text: string, onUpdate: (partial: string) => void, systemPrompt?: string) => Promise<void>;
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

/** Build a context-aware system prompt tailored to the company's current situation. */
export function generateSystemPrompt(state: any, derived: any): string {
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
  if (ltvCac < 1 && cac > 0) dangerZones.push(`LTV:CAC is ${ltvCac.toFixed(1)}× — below breakeven, losing money acquiring customers`);
  if (burnMultiple > 3) dangerZones.push(`Burn Multiple is ${burnMultiple.toFixed(1)}× — very high capital inefficiency`);
  if (growth < 5 && mrr > 0) dangerZones.push(`MoM growth is only ${growth}% — below typical investor thresholds`);

  return `You are an expert venture capital advisor embedded in VenturePilot, a founder OS for ${name}.

COMPANY CONTEXT:
- Stage: ${stage} | Industry: ${industry} | Team: ${teamSize} people
- MRR: $${mrr.toLocaleString()} growing at ${growth}% MoM
- Runway: ${runway >= 999 ? 'profitable (infinite)' : `${runway} months`}
- LTV:CAC: ${ltvCac > 0 ? `${ltvCac.toFixed(1)}×` : 'not calculated'} (healthy = 3×+)
- Burn Multiple: ${burnMultiple > 0 ? `${burnMultiple.toFixed(1)}×` : 'N/A'} (excellent = <1.5×)
- Rule of 40: ${ruleOf40.toFixed(0)}% (threshold = 40%+)

ADVISOR MODE: ${mode}
${dangerZones.length > 0 ? `\nDANGER ZONES:\n${dangerZones.map(d => `⚠️ ${d}`).join('\n')}` : ''}

INSTRUCTIONS:
${isCritical
    ? `This founder is in survival mode. Lead with urgency. Be direct about the severity. Every recommendation should center on extending runway or accelerating revenue.`
    : isHealthy
    ? `This company has healthy metrics. Focus on growth acceleration, fundraise positioning, and scaling efficiently. Acknowledge what's working.`
    : `This founder is building toward key milestones. Give balanced advice — acknowledge progress, identify the highest-leverage next actions.`
  }
- Respond concisely (2-4 sentences) unless asked for longer output
- Use markdown (bold, bullets) for structure
- Ground every suggestion in the specific metrics above
- If asked about fundraising, reference the actual metrics (runway, growth rate, LTV:CAC)
- Never give generic advice that ignores the company's current situation`;
}

export async function detectBestBackend(): Promise<AIBackend> {
  if ('ai' in window && 'languageModel' in (window as any).ai) {
    try {
      const caps = await (window as any).ai.languageModel.capabilities();
      if (caps.available !== 'no') return 'chrome';
    } catch {
      // ignore
    }
  }
  if ('gpu' in (navigator as any)) {
    return 'webllm';
  }
  return 'none';
}

export async function createAISession(onProgress?: (status: AIStatus) => void): Promise<AISession> {
  const backend = await detectBestBackend();

  if (backend === 'chrome') {
    try {
      const session = await (window as any).ai.languageModel.create();
      return {
        backend: 'chrome',
        prompt: async (text: string, systemPrompt?: string) => {
          // Chrome AI doesn't accept per-call system prompts on existing sessions;
          // system prompt is baked into context text instead
          const fullText = systemPrompt ? `${systemPrompt}\n\n${text}` : text;
          return session.prompt(fullText);
        },
        promptStreaming: async (text: string, onUpdate: (partial: string) => void, systemPrompt?: string) => {
          const fullText = systemPrompt ? `${systemPrompt}\n\n${text}` : text;
          const stream = await session.promptStreaming(fullText);
          let full = '';
          for await (const chunk of stream) {
            full = chunk; // Chrome AI streaming resolves the accumulating string
            onUpdate(full);
          }
        },
        destroy: () => {
          try { session.destroy(); } catch {}
        },
      };
    } catch (e) {
      console.warn("Chrome AI failed to initialize, falling back.", e);
    }
  }

  if (backend === 'webllm' || backend === 'chrome') { // if chrome failed it falls through
    try {
      const { CreateMLCEngine } = await import('@mlc-ai/web-llm');
      const MODEL_ID = 'Phi-3.5-mini-instruct-q4f16_1-MLC';
      const engine = await CreateMLCEngine(MODEL_ID, {
        initProgressCallback: (report: any) => {
          onProgress?.({
            backend: 'webllm',
            ready: false,
            loading: true,
            progress: Math.round(report.progress * 100),
            error: null,
            modelName: MODEL_ID,
          });
        },
      });
      return {
        backend: 'webllm',
        prompt: async (text: string, systemPrompt?: string) => {
          const sysMsg = systemPrompt || 'You are a startup advisor embedded in VenturePilot. Give concise, data-driven advice in 2-3 sentences max unless asked for longer. Focus on metrics, capital efficiency, and growth.';
          const reply = await engine.chat.completions.create({
            messages: [
              { role: 'system', content: sysMsg },
              { role: 'user', content: text },
            ],
            max_tokens: 400,
          });
          return reply.choices[0].message.content ?? '';
        },
        promptStreaming: async (text: string, onUpdate: (partial: string) => void, systemPrompt?: string) => {
          const sysMsg = systemPrompt || 'You are a startup advisor embedded in VenturePilot. Give concise, data-driven advice in 2-3 sentences max unless asked for longer. Focus on metrics, capital efficiency, and growth.';
          const stream = await engine.chat.completions.create({
            messages: [
              { role: 'system', content: sysMsg },
              { role: 'user', content: text },
            ],
            max_tokens: 400,
            stream: true,
          });
          let accumulated = '';
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content ?? '';
            accumulated += delta;
            onUpdate(accumulated);
          }
        },
        destroy: () => {
          try { engine.unload(); } catch {}
        },
      };
    } catch (e) {
      console.warn("WebLLM failed to initialize, falling back to 'none'", e);
    }
  }

  return {
    backend: 'none',
    prompt: async () => '', // 'none' returns empty string, callers use template
    destroy: () => {},
  };
}
