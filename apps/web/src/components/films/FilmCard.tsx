import Link from 'next/link';
import { FilmCardMetricBadge } from '@/components/films/FilmCardMetricBadge';
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

function formatRating(rating: number): string {
  return Number.isInteger(rating) ? String(rating) : rating.toFixed(1);
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
    >
      <path
        fill="currentColor"
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      />
    </svg>
  );
}

function TrendingUpIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M3 3v18h18" />
      <path d="m19 9-5 5-4-4-3 3" />
    </svg>
  );
}

type FilmCardProps = {
  film: PublicFilmCardView;
};

export function FilmCard({ film }: FilmCardProps) {
  const slug = film.slug ?? slugFromTitle(film.title);
  const href = `/films/${slug}`;
  const percentage = Math.min(Math.max(film.progress, 0), 100);
  const isFullyFunded = percentage >= 100;
  const displayCommunity = film.hasCommunityScore ? formatRating(film.rating) : '0.0';
  const displayAi = film.hasAiMarketScore ? `${film.aiMarketScore}/100` : '0/100';
  const displayRoi = film.hasPredictedRoi ? film.predictedROI! : '—';

  return (
    <article className="overflow-hidden rounded-xl border border-white/[0.08] bg-screenriot-bg-card transition hover:border-white/15 hover:shadow-lg">
      <Link href={href} className="block">
        <div className="relative h-56 overflow-hidden bg-screenriot-bg-elevated">
          {film.posterUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={film.posterUrl}
              alt={`${film.title} poster`}
              className="h-full w-full object-cover"
            />
          ) : null}
          {film.genre ? (
            <span className="absolute left-3 top-3 rounded-md bg-gradient-to-r from-screenriot-accent-blue to-blue-600 px-2.5 py-0.5 text-xs font-medium text-white">
              {film.genre}
            </span>
          ) : null}
          <div className="pointer-events-none absolute right-3 top-3 z-10 flex flex-col items-end gap-2">
            <FilmCardMetricBadge
              metricKey="communityScore"
              isAvailable={film.hasCommunityScore}
              className="bg-black/80 backdrop-blur-sm"
            >
              <StarIcon className="h-4 w-4 shrink-0 text-screenriot-accent" />
              <span className="text-sm font-medium text-white">{displayCommunity}</span>
            </FilmCardMetricBadge>
            <FilmCardMetricBadge
              metricKey="aiMarketScore"
              isAvailable={film.hasAiMarketScore}
              className="bg-gradient-to-r from-screenriot-accent-blue to-blue-600 shadow-md"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={IMAGES.icons.spark}
                alt=""
                width={16}
                height={16}
                className="h-4 w-4 shrink-0"
                aria-hidden
              />
              <span className="text-sm font-medium text-white">{displayAi}</span>
            </FilmCardMetricBadge>
          </div>
        </div>

        <div className="p-5">
          <h3 className="text-base font-semibold leading-snug text-white">{film.title}</h3>
          {film.director ? (
            <p className="mt-1 text-sm text-screenriot-muted">Directed by {film.director}</p>
          ) : null}
          {film.synopsis ? (
            <p className="mt-2 line-clamp-2 text-sm text-screenriot-muted">{film.synopsis}</p>
          ) : null}

          <div className="mt-4 space-y-3">
            <div
              className="h-2 overflow-hidden rounded-full bg-white/10"
              role="progressbar"
              aria-valuenow={percentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Funding progress ${percentage}%`}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-screenriot-accent-blue to-blue-600 transition-all"
                style={{ width: `${percentage}%` }}
              />
            </div>

            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-screenriot-accent-blue">
                    ${(film.raised / 1000).toFixed(0)}K
                  </span>
                  {isFullyFunded ? (
                    <span className="text-green-500" aria-label="Fully funded">
                      ✓
                    </span>
                  ) : null}
                </div>
                <p className="text-sm text-screenriot-muted">
                  of ${(film.goalAmount / 1000).toFixed(0)}K goal
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={IMAGES.icons.users}
                    alt=""
                    width={14}
                    height={14}
                    className="h-3.5 w-3.5 opacity-70"
                    aria-hidden
                  />
                  <span className="text-sm font-medium text-white">{film.investors}</span>
                </div>
                <p className="text-sm text-screenriot-muted">investors</p>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-2 text-sm text-screenriot-muted">
              <div className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={IMAGES.icons.clock}
                  alt=""
                  width={16}
                  height={16}
                  className="h-4 w-4 opacity-70"
                  aria-hidden
                />
                <span>{film.daysLeft} days left</span>
              </div>
              <span>{film.votes} votes</span>
            </div>

            <FilmCardMetricBadge
              metricKey="predictedRoi"
              isAvailable={film.hasPredictedRoi}
              className="w-full justify-between rounded-lg bg-gradient-to-r from-green-900/20 to-emerald-900/20"
            >
              <span className="text-sm text-screenriot-muted">Predicted ROI</span>
              <span
                className={`flex items-center gap-1 text-sm font-medium ${
                  film.hasPredictedRoi ? 'text-green-400' : 'text-screenriot-muted'
                }`}
              >
                <TrendingUpIcon className="h-3.5 w-3.5" />
                {displayRoi}
              </span>
            </FilmCardMetricBadge>
          </div>
        </div>
      </Link>
    </article>
  );
}
