import type { FilmDetailMetric } from '@/markup/film-detail';

interface FilmDetailMetricCardProps {
  metric: FilmDetailMetric;
}

export function FilmDetailMetricCard({ metric }: FilmDetailMetricCardProps) {
  return (
    <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{metric.label}</p>
      <p className="mt-1 text-lg font-semibold text-white">{metric.value}</p>
      <p className="mt-1.5 text-sm leading-relaxed text-gray-400">{metric.description}</p>
    </div>
  );
}
