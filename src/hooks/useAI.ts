import { useState, useRef, useEffect, useCallback } from 'react';
import { createAISession, AISession, AIStatus } from '../utils/ai';

export interface UseAIReturn {
  session: AISession | null;
  getSession: () => AISession | null;
  status: AIStatus;
  initialize: () => Promise<void>;
  isReady: boolean;
}

export function useAI(): UseAIReturn {
  const sessionRef = useRef<AISession | null>(null);
  const initializingRef = useRef(false);

  const [status, setStatus] = useState<AIStatus>({
    backend: 'pollinations',
    ready: false,
    loading: false,
    progress: 0,
    error: null,
    modelName: '',
  });

  const initialize = useCallback(async () => {
    if (sessionRef.current || initializingRef.current) return;
    initializingRef.current = true;
    setStatus(s => ({ ...s, loading: true, error: null }));

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
        modelName: session.modelName,
      });
    } catch (err: any) {
      setStatus(s => ({ ...s, loading: false, ready: false, error: err.message || 'Failed to init AI' }));
    } finally {
      initializingRef.current = false;
    }
  }, []);

  // Auto-initialize on mount — Pollinations is instant, no download needed
  useEffect(() => {
    initialize();
    return () => {
      if (sessionRef.current) {
        sessionRef.current.destroy();
        sessionRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    session: sessionRef.current,
    getSession: () => sessionRef.current,
    status,
    initialize,
    isReady: status.ready,
  };
}
