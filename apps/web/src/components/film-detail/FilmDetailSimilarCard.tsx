import type { SimilarFilm } from '@/markup/film-detail';

interface FilmDetailSimilarCardProps {
  film: SimilarFilm;
}

export function FilmDetailSimilarCard({ film }: FilmDetailSimilarCardProps) {
  return (
    <div
      className="flex flex-col justify-between gap-4 rounded-lg p-4 sm:flex-row sm:items-center"
      style={{ backgroundColor: 'rgba(180, 160, 120, 0.1)' }}
    >
      <div>
        <h4 className="font-semibold text-white">{film.title}</h4>
        <p className="mt-1 text-sm text-gray-400">
          Box Office: {film.boxOffice}, ROI: {film.roi}, Rating: {film.rating}
        </p>
      </div>
      <button
        type="button"
        className="shrink-0 rounded-lg border border-screenriot-accent-blue/40 bg-screenriot-accent-blue/10 px-4 py-2 text-sm font-medium text-screenriot-accent-blue hover:bg-screenriot-accent-blue/20"
      >
        Match: {film.matchPercent}%
      </button>
    </div>
  );
}
