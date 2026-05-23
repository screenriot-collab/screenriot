import type { FilmDetailMetric } from '@/markup/film-detail';

interface FilmDetailMetricCardProps {
  metric: FilmDetailMetric;
}

export function FilmDetailMetricCard({ metric }: FilmDetailMetricCardProps) {
  return (
    <div className="rounded-lg border border-screenriot-accent-blue/30 bg-screenriot-accent-blue/15 p-4 backdrop-blur-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-white/90">{metric.label}</p>
        <p className="shrink-0 text-xl font-semibold text-white">{metric.value}</p>
      </div>
      <p className="mt-1 text-xs text-white/70">{metric.description}</p>
    </div>
  );
}
