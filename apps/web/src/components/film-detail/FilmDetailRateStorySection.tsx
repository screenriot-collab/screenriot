'use client';

import { useState } from 'react';
import type { RateStoryMock, RateStoryCategory } from '@/markup/film-detail';

const SLIDER_MAX = 10;

function IconStoryEngagement() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A7.5 7.5 0 0 0 6 18v3h12v-3a7.5 7.5 0 0 0-6-11.958Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h10" />
    </svg>
  );
}
function IconCharacterDepth() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
    </svg>
  );
}
function IconEmotionalImpact() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
    </svg>
  );
}

function CategoryIcon({ icon }: { icon: RateStoryCategory['icon'] }) {
  if (icon === 'story_engagement') return <IconStoryEngagement />;
  if (icon === 'character_depth') return <IconCharacterDepth />;
  return <IconEmotionalImpact />;
}

interface FilmDetailRateStorySectionProps {
  data: RateStoryMock;
}

export function FilmDetailRateStorySection({ data }: FilmDetailRateStorySectionProps) {
  const [scores, setScores] = useState<Record<string, number>>({});
  const [thoughts, setThoughts] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleChange(catId: string, value: number) {
    setScores((s) => ({ ...s, [catId]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <section
      className="rounded-xl border border-white/10 bg-screenriot-bg-card p-6"
      aria-labelledby="rate-story-heading"
    >
      <h2 id="rate-story-heading" className="text-lg font-semibold text-white">
        {data.title}
      </h2>
      <p className="mt-1 text-sm text-gray-400">{data.subtitle}</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {data.categories.map((cat) => {
          const value = scores[cat.id] ?? 0;
          const percent = (value / SLIDER_MAX) * 100;
          const bottomBarColor =
            cat.comparisonVariant === 'red'
              ? 'bg-red-400'
              : 'bg-amber-400';
          return (
            <fieldset key={cat.id} className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <legend className="flex items-center gap-2 text-sm font-medium text-white">
                  <span className="text-screenriot-accent-blue">
                    <CategoryIcon icon={cat.icon} />
                  </span>
                  {cat.label}
                </legend>
                <span className="text-sm font-medium text-white">
                  {value}/{SLIDER_MAX}
                </span>
              </div>
              <div className="space-y-2">
                <div className="relative h-6 w-full">
                  <div
                    className="absolute left-0 right-0 top-1/2 h-2 w-full -translate-y-1/2 rounded-full bg-white/10"
                    role="presentation"
                    aria-hidden
                  />
                  <div
                    className="absolute left-0 top-1/2 h-2 -translate-y-1/2 rounded-l-full bg-blue-500 transition-[width] duration-100"
                    style={{ width: `${percent}%` }}
                    role="presentation"
                    aria-hidden
                  />
                  <input
                    type="range"
                    min={0}
                    max={SLIDER_MAX}
                    step={1}
                    value={value}
                    onChange={(e) => handleChange(cat.id, Number(e.target.value))}
                    className="pledge-slider absolute inset-0 h-full w-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-screenriot-accent-blue/50"
                    aria-valuenow={value}
                    aria-valuemin={0}
                    aria-valuemax={SLIDER_MAX}
                    aria-label={`${cat.label}: ${value} out of ${SLIDER_MAX}`}
                  />
                </div>
                <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                  <div
                    className={`h-full rounded-l-full transition-[width] duration-100 ${bottomBarColor}`}
                    style={{ width: `${percent}%` }}
                    role="presentation"
                    aria-hidden
                  />
                </div>
              </div>
            </fieldset>
          );
        })}

        <div>
          <label htmlFor="rate-story-thoughts" className="block text-sm font-medium text-gray-300">
            Your Thoughts (Optional)
          </label>
          <textarea
            id="rate-story-thoughts"
            value={thoughts}
            onChange={(e) => setThoughts(e.target.value)}
            placeholder={data.thoughtsPlaceholder}
            rows={3}
            className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-screenriot-accent-blue/50 focus:outline-none focus:ring-1 focus:ring-screenriot-accent-blue/30"
            aria-describedby="rate-story-thoughts-hint"
          />
          <span id="rate-story-thoughts-hint" className="sr-only">
            Optional feedback about the story, characters, or script
          </span>
        </div>

        <button
          type="submit"
          disabled={submitted}
          className="w-full rounded-lg bg-teal-500 py-3 text-sm font-semibold text-white hover:bg-teal-500/90 disabled:opacity-60 sm:w-auto sm:px-8"
        >
          {submitted ? 'Rating submitted' : 'Submit Rating'}
        </button>
      </form>
    </section>
  );
}
