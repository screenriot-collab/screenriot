import type { SimilarFilm } from '@/markup/film-detail';

interface FilmDetailSimilarCardProps {
  film: SimilarFilm;
}

/** Below 40% reads as a weak match, 40-70% moderate, above 70% strong. */
function matchBadgeClass(matchPercent: number): string {
  if (matchPercent < 40) return 'bg-red-500/80';
  if (matchPercent < 70) return 'bg-amber-500/80';
  return 'bg-green-600/80';
}

export function FilmDetailSimilarCard({ film }: FilmDetailSimilarCardProps) {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-white/10 bg-screenriot-bg-card/40 backdrop-blur-sm">
      {film.posterUrl ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={film.posterUrl} alt="" className="aspect-[2/3] w-full object-cover" aria-hidden />
      ) : (
        <div className="flex aspect-[2/3] w-full items-center justify-center bg-white/10 text-xs text-gray-500">
          No poster
        </div>
      )}
      <div className="flex flex-1 flex-col justify-between p-3">
        <div>
          <h4 className="truncate text-sm font-semibold text-white">{film.title}</h4>
          <p className="mt-1 text-xs text-gray-400">
            Box Office: {film.boxOffice || '—'}
            <br />
            ROI: {film.roi || '—'} · Rating: {film.rating || '—'}
          </p>
        </div>
        <span
          className={`mt-3 inline-flex w-fit rounded-lg px-2.5 py-1 text-xs font-medium text-white ${matchBadgeClass(film.matchPercent)}`}
        >
          Match: {film.matchPercent}%
        </span>
      </div>
    </div>
  );
}
