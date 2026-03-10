'use client';

import { useState } from 'react';
import type { SampleScenesMock } from '@/markup/film-detail';

function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
      />
    </svg>
  );
}

interface FilmDetailSampleScenesSectionProps {
  data: SampleScenesMock;
}

export function FilmDetailSampleScenesSection({ data }: FilmDetailSampleScenesSectionProps) {
  const [unlocked, setUnlocked] = useState(data.unlocked ?? false);

  function handleUnlock() {
    setUnlocked(true);
  }

  if (unlocked) {
    const hasDescription = typeof data.description === 'string' && data.description.trim().length > 0;
    return (
      <section
        className="rounded-xl border border-white/10 bg-screenriot-bg-card p-6"
        aria-labelledby="sample-scenes-heading"
      >
        <h2 id="sample-scenes-heading" className="text-lg font-semibold text-white">
          {data.title}
        </h2>
        {hasDescription ? (
          <div
            className="mt-4 whitespace-pre-wrap rounded-lg border border-white/5 bg-white/[0.02] px-4 py-4 text-sm leading-relaxed text-gray-300"
            aria-label="Sample scenes content"
          >
            {data.description!.trim()}
          </div>
        ) : (
          <p className="mt-4 text-sm text-gray-500">No sample scenes content yet.</p>
        )}
      </section>
    );
  }

  return (
    <section
      className="rounded-xl border border-white/10 bg-screenriot-bg-card p-8"
      aria-labelledby="sample-scenes-heading"
    >
      <h2 id="sample-scenes-heading" className="flex items-center gap-2 text-lg font-semibold text-white">
        <LockIcon className="h-5 w-5 shrink-0 text-gray-400" />
        {data.title}
      </h2>

      <div className="mt-10 flex flex-col items-center justify-center py-8">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-white/20 text-gray-400">
          <LockIcon className="h-12 w-12" />
        </div>
        <p className="mt-6 max-w-md text-center text-sm text-gray-400">{data.unlockMessage}</p>
        <button
          type="button"
          onClick={handleUnlock}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-teal-500 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-500/90 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-screenriot-bg"
          aria-label={`Unlock ${data.title} with $${data.pledgeAmount} pledge`}
        >
          <LockIcon className="h-4 w-4" />
          Unlock {data.title} (${data.pledgeAmount} pledge)
        </button>
      </div>
    </section>
  );
}
