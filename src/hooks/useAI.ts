import { useState, useRef, useEffect, useCallback } from 'react';
import { createAISession, AISession, AIStatus, detectBestBackend } from '../utils/ai';

export interface UseAIReturn {
  session: AISession | null;
  getSession: () => AISession | null;
  status: AIStatus;
  initialize: () => Promise<void>;
  isReady: boolean;
}

export function useAI(): UseAIReturn {
  const sessionRef = useRef<AISession | null>(null);
  
  const [status, setStatus] = useState<AIStatus>({
    backend: 'none',
    ready: false,
    loading: false,
    progress: 0,
    error: null,
    modelName: '',
  });

  const initialize = useCallback(async () => {
    if (sessionRef.current || status.loading) return;
    
    setStatus(s => ({ ...s, loading: true }));
    
    try {
      const session = await createAISession((prog) => {
        setStatus(prog);
      });
      sessionRef.current = session;
      setStatus({
        backend: session.backend,
        ready: true,
        loading: false,
        progress: 100,
        error: null,
        modelName: session.backend === 'chrome' ? 'Gemini Nano' : (session.backend === 'webllm' ? 'Phi-3.5 Mini' : 'Offline Mode'),
      });
    } catch (err: any) {
      setStatus(s => ({ ...s, loading: false, error: err.message || 'Failed to init AI' }));
    }
  }, [status.loading]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const backend = await detectBestBackend();
      if (backend === 'chrome' && mounted && !sessionRef.current) {
        initialize();
      }
    })();
    return () => {
      mounted = false;
    };
  }, [initialize]);

  useEffect(() => {
    return () => {
      if (sessionRef.current) {
        sessionRef.current.destroy();
        sessionRef.current = null;
      }
    };
  }, []);

  return {
    session: sessionRef.current,
    getSession: () => sessionRef.current,
    status,
    initialize,
    isReady: status.ready,
  };
}
