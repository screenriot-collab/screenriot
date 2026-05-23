/** Relative time for discussion timestamps (English UI). */
export function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const now = Date.now();
  const diffMs = now - date.getTime();
  if (diffMs < 0) return 'just now';

  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return 'just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} minute${min === 1 ? '' : 's'} ago`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
