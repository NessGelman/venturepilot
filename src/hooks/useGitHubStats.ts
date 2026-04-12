import { useState, useEffect } from 'react';

export interface GitHubStats {
  stars: number;
  forks: number;
  language: string;
  openIssues: number;
  lastPushedAt: string;
  contributorCount: number;
}

function extractRepoPath(url: string): { owner: string; repo: string } | null {
  const match = url.match(/github\.com\/([^/\s]+)\/([^/\s#?]+)/i);
  if (!match) return null;
  return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
}

export function useGitHubStats(repoUrl: string): GitHubStats | null {
  const [stats, setStats] = useState<GitHubStats | null>(null);

  useEffect(() => {
    if (!repoUrl?.trim()) {
      setStats(null);
      return;
    }

    const parsed = extractRepoPath(repoUrl);
    if (!parsed) {
      setStats(null);
      return;
    }

    const { owner, repo } = parsed;
    const cacheKey = `gh_stats_${owner}_${repo}`;

    // Check sessionStorage cache first
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        setStats(JSON.parse(cached));
        return;
      }
    } catch {}

    let cancelled = false;

    async function fetchStats() {
      try {
        const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
          headers: { Accept: 'application/vnd.github+json' },
        });
        if (!res.ok) return;
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
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify(result));
        } catch {}
      } catch {
        // Silently ignore — no auth, 60 req/hr limit
      }
    }

    fetchStats();
    return () => { cancelled = true; };
  }, [repoUrl]);

  return stats;
}
