'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import type { FilmDetailMock } from '@/markup/film-detail';

interface FilmDetailHeroSectionProps {
  film: FilmDetailMock;
}

export function FilmDetailHeroSection({ film }: FilmDetailHeroSectionProps) {
  const [posterModalOpen, setPosterModalOpen] = useState(false);
  const hasPoster = Boolean(film.posterImageUrl);
  const hasVideo = Boolean(film.videoUrl);

  const closeModal = useCallback(() => setPosterModalOpen(false), []);
  useEffect(() => {
    if (!posterModalOpen) return;
    const onEscape = (e: KeyboardEvent) => e.key === 'Escape' && closeModal();
    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [posterModalOpen, closeModal]);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/films"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-screenriot-muted transition-colors hover:text-white"
        >
          <span aria-hidden>←</span>
          Back to projects
        </Link>
        {hasPoster && (
          <button
            type="button"
            onClick={() => setPosterModalOpen(true)}
            className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10"
            aria-label="View poster"
          >
            View Poster
          </button>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {film.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-white/20 bg-white/5 px-3 py-0.5 text-xs font-medium text-gray-300"
          >
            {tag}
          </span>
        ))}
      </div>

      {posterModalOpen && hasPoster && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Poster"
          onClick={closeModal}
        >
          <button
            type="button"
            onClick={closeModal}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Close"
          >
            <span aria-hidden className="text-2xl leading-none">×</span>
          </button>
          <div
            className="relative max-h-[90vh] max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={film.posterImageUrl}
              alt={`${film.title} poster`}
              className="max-h-[90vh] w-auto rounded-lg object-contain"
            />
          </div>
        </div>
      )}

      <div className="relative mt-6 aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black">
        {hasVideo ? (
          <video
            src={film.videoUrl}
            controls
            className="h-full w-full object-contain"
            preload="metadata"
            aria-label={film.videoLabel}
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
      </div>
      <p className="mt-2 text-center text-xs text-screenriot-muted">{film.videoLabel}</p>

      <div className="mt-8">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">{film.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-300">{film.synopsis}</p>
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
