import type { FilmDetailMetric } from '@/markup/film-detail';

interface FilmDetailMetricCardProps {
  metric: FilmDetailMetric;
}

export function FilmDetailMetricCard({ metric }: FilmDetailMetricCardProps) {
  return (
    <div className="rounded-lg border border-screenriot-accent-blue/30 bg-screenriot-accent-blue/15 p-4 backdrop-blur-sm">
      <p className="text-base font-medium text-white/90">{metric.label}</p>
      <p className="mt-4 inline-block rounded-md bg-amber-400/50 px-2.5 py-1 text-base font-semibold text-white">
        {metric.value}
      </p>
      <p className="mt-4 text-sm text-white/70">{metric.description}</p>
    </div>
  );
}
