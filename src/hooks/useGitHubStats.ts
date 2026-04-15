import { useState, useEffect } from 'react';

export interface GitHubStats {
  stars: number;
  forks: number;
  language: string;
  openIssues: number;
  lastPushedAt: string;
  contributorCount: number;
}

export interface UseGitHubStatsResult {
  stats: GitHubStats | null;
  status: 'idle' | 'loading' | 'ready' | 'limited' | 'error';
  error: string | null;
}

function extractRepoPath(url: string): { owner: string; repo: string } | null {
  const match = url.match(/github\.com\/([^/\s]+)\/([^/\s#?]+)/i);
  if (!match) return null;
  return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
}

export function useGitHubStats(repoUrl: string): UseGitHubStatsResult {
  const [stats, setStats] = useState<GitHubStats | null>(null);
  const [status, setStatus] = useState<UseGitHubStatsResult['status']>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!repoUrl?.trim()) {
      setStats(null);
      setStatus('idle');
      setError(null);
      return;
    }

    const parsed = extractRepoPath(repoUrl);
    if (!parsed) {
      setStats(null);
      setStatus('error');
      setError('Enter a valid GitHub repository URL.');
      return;
    }

    const { owner, repo } = parsed;
    const cacheKey = `gh_stats_${owner}_${repo}`;

    // Check sessionStorage cache first
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        setStats(JSON.parse(cached));
        setStatus('ready');
        setError(null);
        return;
      }
    } catch {}

    let cancelled = false;
    setStatus('loading');
    setError(null);

    async function fetchStats() {
      try {
        const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
          headers: { Accept: 'application/vnd.github+json' },
        });
        if (!res.ok) {
          if (cancelled) return;
          const remaining = res.headers.get('x-ratelimit-remaining');
          if (res.status === 403 && remaining === '0') {
            setStats(null);
            setStatus('limited');
            setError('GitHub API rate limit reached. Try again in about an hour.');
            return;
          }
          if (res.status === 404) {
            setStats(null);
            setStatus('error');
            setError('Repository not found or not publicly accessible.');
            return;
          }
          setStats(null);
          setStatus('error');
          setError(`GitHub stats unavailable (${res.status}).`);
          return;
        }
        const data = await res.json();
        if (cancelled) return;

        const result: GitHubStats = {
          stars: data.stargazers_count ?? 0,
          forks: data.forks_count ?? 0,
          language: data.language ?? 'Unknown',
          openIssues: data.open_issues_count ?? 0,
          lastPushedAt: data.pushed_at ?? '',
          contributorCount: 0, // requires extra API call, skip for rate-limit safety
        };

        setStats(result);
        setStatus('ready');
        setError(null);
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify(result));
        } catch {}
      } catch {
        if (cancelled) return;
        setStats(null);
        setStatus('error');
        setError('Could not reach GitHub API from this network.');
      }
    }

    fetchStats();
    return () => { cancelled = true; };
  }, [repoUrl]);

  return { stats, status, error };
}
