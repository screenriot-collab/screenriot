'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { FilmDetailMock } from '@/markup/film-detail';

interface FilmDetailHeroSectionProps {
  film: FilmDetailMock;
}

function buildMediaBadges(film: FilmDetailMock): string[] {
  const badges: string[] = [];
  const genre = film.genre?.trim();
  if (genre) badges.push(genre);
  else if (film.tags[0]) badges.push(film.tags[0]);
  if (film.rating?.trim()) badges.push(film.rating.trim());
  if (film.runtime?.trim()) badges.push(film.runtime.trim());
  return badges;
}

export function FilmDetailHeroSection({ film }: FilmDetailHeroSectionProps) {
  const hasPoster = Boolean(film.posterImageUrl);
  const hasVideo = Boolean(film.videoUrl);
  const canToggle = hasPoster && hasVideo;
  const [showVideo, setShowVideo] = useState(hasVideo);

  useEffect(() => {
    setShowVideo(hasVideo);
  }, [hasVideo, film.videoUrl]);

  const mediaBadges = buildMediaBadges(film);
  const captionLabel =
    showVideo && hasVideo
      ? film.videoLabel || 'Official Trailer'
      : 'Film Poster';

  return (
    <>
      <Link
        href="/films"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-screenriot-muted transition-colors hover:text-white"
      >
        <span aria-hidden>←</span>
        Back to projects
      </Link>

      <div className="relative mt-6 h-[500px] w-full overflow-hidden rounded-xl border border-white/10 bg-black">
        {showVideo && hasVideo ? (
          <video
            key={film.videoUrl}
            src={film.videoUrl}
            controls
            className="h-full w-full object-contain"
            preload="metadata"
            aria-label={captionLabel}
          />
        ) : hasPoster ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={film.posterImageUrl}
            alt={`${film.title} poster`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-screenriot-muted">
            <svg
              className="h-14 w-14 text-amber-500/60"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
              />
            </svg>
            <p className="mt-3 text-sm font-medium">Video unavailable</p>
            <p className="mt-0.5 text-xs">{film.videoRestrictedMessage}</p>
          </div>
        )}

        {mediaBadges.length > 0 && (
          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            {mediaBadges.map((badge) => (
              <span
                key={badge}
                className="rounded-md border border-white/20 bg-black/60 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm"
              >
                {badge}
              </span>
            ))}
          </div>
        )}

        {canToggle && (
          <div className="absolute right-4 top-4">
            <button
              type="button"
              onClick={() => setShowVideo((v) => !v)}
              className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:bg-black/80 focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-pressed={showVideo}
              aria-label={showVideo ? 'View poster' : 'Watch trailer'}
            >
              {showVideo ? (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                  </svg>
                  View Poster
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                  </svg>
                  Watch Trailer
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {(hasVideo || hasPoster) && (
        <p className="mt-2 text-center text-xs text-screenriot-muted">
          {showVideo && hasVideo ? `🎬 ${captionLabel}` : `📸 ${captionLabel}`}
        </p>
      )}

      <div className="mt-8">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">{film.title}</h1>
        {film.logline ? (
          <p className="mt-3 text-sm leading-relaxed text-screenriot-muted">{film.logline}</p>
        ) : null}
        <p className="mt-4 flex items-center gap-3 text-sm text-gray-400">
          {film.directorAvatarUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={film.directorAvatarUrl}
              alt=""
              className="h-10 w-10 shrink-0 rounded-full object-cover"
              aria-hidden
            />
          ) : (
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-medium text-white"
              aria-hidden
            >
              {film.directorName.slice(0, 1).toUpperCase()}
            </span>
          )}
          <span>
            <span className="text-gray-400">Directed by </span>
            <span className="font-medium text-white">{film.directorName}</span>
          </span>
        </p>
      </div>
    </>
  );
}
