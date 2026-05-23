import type { ReactNode } from 'react';
import type { FilmCardMetricKey } from '@/lib/film-card-fields';
import { filmCardPendingHint } from '@/lib/film-card-fields';

type FilmCardMetricBadgeProps = {
  metricKey: FilmCardMetricKey;
  isAvailable: boolean;
  className?: string;
  children: ReactNode;
};

export function FilmCardMetricBadge({
  metricKey,
  isAvailable,
  className = '',
  children,
}: FilmCardMetricBadgeProps) {
  const pending = !isAvailable;
  const pendingHint = filmCardPendingHint(metricKey);
  return (
    <div
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 ${
        pending ? 'opacity-75 ring-1 ring-dashed ring-white/25' : ''
      } ${className}`}
      title={pending ? pendingHint : undefined}
      aria-label={pending ? pendingHint : undefined}
    >
      {children}
    </div>
  );
}
