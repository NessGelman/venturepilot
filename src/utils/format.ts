// Shared formatting utilities used across all pages

export const fmt = (n: number, prefix = '$'): string => {
  if (!isFinite(n) || isNaN(n)) return `${prefix}0`;
  if (n >= 1e9) return `${prefix}${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${prefix}${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${prefix}${(n / 1e3).toFixed(0)}K`;
  return `${prefix}${Math.round(n)}`;
};

export const fmtPct = (n: number): string => `${n.toFixed(1)}%`;

export const fmtMultiple = (n: number, decimals = 1): string =>
  `${isFinite(n) ? n.toFixed(decimals) : '—'}×`;
