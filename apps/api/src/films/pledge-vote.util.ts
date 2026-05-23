export function averagePledgeScores(scores: unknown): number {
  if (!scores || typeof scores !== 'object') return 0;
  const values = Object.values(scores as Record<string, unknown>).filter(
    (v): v is number => typeof v === 'number' && !Number.isNaN(v) && v > 0,
  );
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, v) => acc + v, 0);
  return Math.round((sum / values.length) * 10) / 10;
}

export function formatCommunityAuthorName(user: {
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
}): string {
  if (user.displayName?.trim()) return user.displayName.trim();
  const parts = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  return parts || 'Community member';
}

export function authorInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
}
