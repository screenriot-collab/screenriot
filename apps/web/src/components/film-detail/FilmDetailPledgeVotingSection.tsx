'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import type { PledgeVotingMock, VotingCategory } from '@/markup/film-detail';
import { createPledgeVote, fetchMyPledgeVote } from '@/lib/films-api';

// Stack of books/documents
function IconStory() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A7.5 7.5 0 0 0 6 18v3h12v-3a7.5 7.5 0 0 0-6-11.958Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 21v-3a4.5 4.5 0 0 1 9 0v3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h10" />
    </svg>
  );
}
// Scroll/parchment
function IconScript() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  );
}
// Three people / cast
function IconCasting() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
    </svg>
  );
}

function CategoryIcon({ icon }: { icon: VotingCategory['icon'] }) {
  if (icon === 'story') return <IconStory />;
  if (icon === 'script') return <IconScript />;
  return <IconCasting />;
}

const SLIDER_MIN = 0;
const SLIDER_MAX = 10;

interface FilmDetailPledgeVotingSectionProps {
  data: PledgeVotingMock;
  filmId?: string;
}

export function FilmDetailPledgeVotingSection({ data, filmId }: FilmDetailPledgeVotingSectionProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [scores, setScores] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categoryIds = data.categories.map((c) => c.id);

  useEffect(() => {
    if (status !== 'authenticated' || !filmId || !session?.accessToken) return;
    let cancelled = false;
    fetchMyPledgeVote(filmId, session.accessToken as string)
      .then((res) => {
        if (cancelled) return;
        if (res.scores && typeof res.scores === 'object') {
          setScores(res.scores);
          setSubmitted(true);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [filmId, status, session?.accessToken]);

  function handleChange(catId: string, value: number) {
    setScores((s) => ({ ...s, [catId]: value }));
    setError(null);
  }

  const allCategoriesHaveScore = categoryIds.length > 0 && categoryIds.every((id) => (scores[id] ?? 0) > 0);
  const canSubmit = !submitted && !submitting && allCategoriesHaveScore;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!filmId) return;
    if (!session?.accessToken) {
      router.push('/login');
      return;
    }
    if (!allCategoriesHaveScore) {
      setError('Please set a score greater than 0 for all categories.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const payload: Record<string, number> = {};
      for (const id of categoryIds) {
        const v = scores[id] ?? 0;
        payload[id] = Math.max(1, Math.min(10, Math.round(v)));
      }
      await createPledgeVote(filmId, payload, session.accessToken as string);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit votes');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      className="rounded-xl border border-white/10 bg-screenriot-bg-card p-6"
      aria-labelledby="pledge-voting-heading"
    >
      <h2 id="pledge-voting-heading" className="text-lg font-semibold text-white">
        {data.title ?? 'Pledge-Based Voting'}
      </h2>
      <p className="mt-1 text-sm text-gray-400">{data.subtitle}</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-8">
        {data.categories.map((cat) => {
          const value = scores[cat.id] ?? 0;
          const percent = (value / SLIDER_MAX) * 100;
          return (
            <fieldset key={cat.id} className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <legend className="flex items-center gap-2 text-sm font-medium text-white">
                  <span className="text-screenriot-accent-blue">
                    <CategoryIcon icon={cat.icon} />
                  </span>
                  {cat.label}
                </legend>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-400">
                    Community: {cat.communityScore}/{cat.communityMax}
                  </span>
                  <span className="rounded bg-sky-500/20 px-2 py-0.5 font-medium text-sky-300">
                    You: {value}/{cat.communityMax}
                  </span>
                </div>
              </div>
              <div className="space-y-1.5">
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
                    min={SLIDER_MIN}
                    max={SLIDER_MAX}
                    step={1}
                    value={value}
                    onChange={(e) => handleChange(cat.id, Number(e.target.value))}
                    className="pledge-slider absolute inset-0 h-full w-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-screenriot-accent-blue/50"
                    aria-valuemin={SLIDER_MIN}
                    aria-valuemax={SLIDER_MAX}
                    aria-valuenow={value}
                    aria-label={`${cat.label}: ${value} out of ${cat.communityMax}`}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{cat.labelLeft}</span>
                  <span>{cat.labelRight}</span>
                </div>
              </div>
            </fieldset>
          );
        })}

        {error && (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full rounded-lg bg-teal-500 py-3 text-sm font-semibold text-white hover:bg-teal-500/90 disabled:opacity-60 sm:w-auto sm:px-8"
          aria-label={submitted ? 'Votes already submitted' : allCategoriesHaveScore ? 'Submit my votes' : 'Set a score for all categories to submit'}
        >
          {submitted ? 'Votes submitted' : submitting ? 'Submitting…' : 'Submit My Votes'}
        </button>
      </form>
    </section>
  );
}
