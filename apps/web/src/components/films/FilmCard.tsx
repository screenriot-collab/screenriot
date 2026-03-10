import Link from 'next/link';
import { IMAGES } from '@/lib/constants';
import type { PublicFilmCardView } from '@/hooks/usePublicFilmsList';

function slugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function FilmCardActions() {
  return (
    <>
      <button
        type="button"
        className="rounded p-1.5 text-screenriot-muted hover:bg-white/10 hover:text-white"
        aria-label="Share"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={IMAGES.icons.share}
          alt=""
          width={16}
          height={16}
          className="h-4 w-4"
          aria-hidden
        />
      </button>
      <button
        type="button"
        className="rounded p-1.5 text-screenriot-muted hover:bg-white/10 hover:text-white"
        aria-label="Invest or vote"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={IMAGES.icons.arrowUp}
          alt=""
          width={16}
          height={16}
          className="h-4 w-4"
          aria-hidden
        />
      </button>
    </>
  );
}

type FilmCardProps = {
  film: PublicFilmCardView;
};

export function FilmCard({ film }: FilmCardProps) {
  const slug = film.slug ?? slugFromTitle(film.title);
  return (
    <article className="overflow-hidden rounded-xl border border-white/10 bg-screenriot-bg-card transition hover:border-white/20">
      <Link href={`/films/${slug}`} className="block">
        <div className="relative aspect-video bg-screenriot-bg-elevated">
          {film.posterUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={film.posterUrl}
              alt={`${film.title} poster`}
              className="h-full w-full object-cover"
            />
          ) : null}
          <div className="absolute left-3 top-3 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium text-white">
            {film.genre}
          </div>
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded bg-black/40 px-2 py-0.5 text-sm text-screenriot-accent">
            ★ {film.rating}
          </div>
          <div className="absolute right-3 top-10 rounded-full border-2 border-screenriot-accent-blue bg-screenriot-bg/80 px-2 py-0.5 text-xs font-medium text-white">
            {film.progress}/{film.goal}
          </div>
        </div>
      </Link>
      <div className="p-4">
        <Link href={`/films/${slug}`}>
          <h3 className="font-bold text-white hover:text-screenriot-accent-blue">
            {film.title}
          </h3>
        </Link>
        <p className="mt-0.5 text-xs text-screenriot-muted">
          Directed by {film.director}
        </p>
        <p className="mt-2 line-clamp-2 text-sm text-gray-300">{film.synopsis}</p>
        <p className="mt-3 text-sm font-medium text-white">
          ${(film.raised / 1000).toFixed(1)}K of $
          {(film.goalAmount / 1000).toFixed(0)}K goal
        </p>
        <div className="mt-2 flex gap-4 text-xs text-screenriot-muted">
          <span>{film.investors} investors</span>
          <span>{film.votes} votes</span>
          <span>{film.daysLeft} days left</span>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-screenriot-accent-blue"
            style={{ width: `${film.progress}%` }}
            aria-hidden
          />
        </div>
        <div className="mt-3 flex justify-end gap-2">
          <FilmCardActions />
        </div>
      </div>
    </article>
  );
}
