import type { SimilarFilm } from '@/markup/film-detail';

interface FilmDetailSimilarCardProps {
  film: SimilarFilm;
}

export function FilmDetailSimilarCard({ film }: FilmDetailSimilarCardProps) {
  return (
    <div className="flex flex-col justify-between gap-4 rounded-lg border border-white/10 bg-screenriot-bg-card/40 p-4 backdrop-blur-sm sm:flex-row sm:items-center">
      <div>
        <h4 className="font-semibold text-white">{film.title}</h4>
        <p className="mt-1 text-sm text-gray-400">
          Box Office: {film.boxOffice}, ROI: {film.roi}, Rating: {film.rating}
        </p>
      </div>
      <span className="shrink-0 rounded-lg bg-gradient-to-r from-screenriot-accent-blue to-blue-600 px-4 py-2 text-sm font-medium text-white">
        Match: {film.matchPercent}%
      </span>
    </div>
  );
}
