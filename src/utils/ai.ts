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
  prompt: (text: string) => Promise<string>;
  promptStreaming?: (text: string, onUpdate: (partial: string) => void) => Promise<void>;
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
      const session = await (window as any).ai.languageModel.create({
        systemPrompt: `You are a startup advisor embedded in VenturePilot, a founder OS. 
  You give concise, actionable, data-driven advice. Respond in 2-3 sentences max unless 
  asked for longer output. Focus on metrics, capital efficiency, and growth.`
      });
      return {
        backend: 'chrome',
        prompt: (text: string) => session.prompt(text),
        promptStreaming: async (text: string, onUpdate: (partial: string) => void) => {
          const stream = await session.promptStreaming(text);
          let full = '';
          for await (const chunk of stream) {
            full = chunk; // the chrome ai streaming prompt resolves the accumulating string
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
        prompt: async (text: string) => {
          const reply = await engine.chat.completions.create({
            messages: [
              { role: 'system', content: 'You are a startup advisor embedded in VenturePilot. Give concise, data-driven advice in 2-3 sentences max unless asked for longer. Focus on metrics, capital efficiency, and growth.' },
              { role: 'user', content: text },
            ],
            max_tokens: 300,
          });
          return reply.choices[0].message.content ?? '';
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
