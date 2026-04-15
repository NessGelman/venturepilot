// src/hooks/useInvestorDB.ts
// Fetches and caches investors-db.json from GitHub Pages.
// Uses sessionStorage so it loads once per browser session (no re-fetch on navigation).

import { useState, useEffect, useCallback } from 'react';
import type { InvestorDBRecord } from '../utils/investorMatch';

const CACHE_KEY = 'vp_investors_db_v1';
const DB_PATH = `${(import.meta as any).env?.BASE_URL ?? '/'}investors-db.json`;

export interface UseInvestorDBReturn {
  investors: InvestorDBRecord[];
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export function useInvestorDB(): UseInvestorDBReturn {
  const [investors, setInvestors] = useState<InvestorDBRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);

    // Check sessionStorage cache (cleared on tab close)
    if (!forceRefresh) {
      try {
        const cached = sessionStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached) as InvestorDBRecord[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            setInvestors(parsed);
            setLoading(false);
            return;
          }
        }
      } catch {
        // Cache miss or corrupt — fall through to fetch
      }
    }

    try {
      const res = await fetch(DB_PATH);
      if (!res.ok) throw new Error(`Failed to load investor database (${res.status})`);
      const data: InvestorDBRecord[] = await res.json();
      if (!Array.isArray(data)) throw new Error('Invalid investor database format');

      // Cache for this session
      try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
      } catch {
        // sessionStorage full — continue without caching
      }

      setInvestors(data);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load investor database');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const reload = useCallback(() => {
    sessionStorage.removeItem(CACHE_KEY);
    load(true);
  }, [load]);

  return { investors, loading, error, reload };
}
