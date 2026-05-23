'use client';

import { useState, useEffect } from 'react';
import type { FanVotingMock, TabbedSectionCasting, VotingCategory } from '@/markup/film-detail';
import { FilmDetailDreamCastVoteSection } from '@/components/film-detail/FilmDetailDreamCastVoteSection';
import { FilmDetailDreamCastSuggestSection } from '@/components/film-detail/FilmDetailDreamCastSuggestSection';
import { ParticipationGateModal } from '@/components/film-detail/ParticipationGateModal';
import { getErrorMessage } from '@/lib/api';
import { createPledgeVote, fetchMyPledgeVote } from '@/lib/films-api';
import { useHasMounted } from '@/hooks/use-has-mounted';
import { useParticipationGate } from '@/hooks/use-participation-gate';

function IconStory() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A7.5 7.5 0 0 0 6 18v3h12v-3a7.5 7.5 0 0 0-6-11.958Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 21v-3a4.5 4.5 0 0 1 9 0v3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h10" />
    </svg>
  );
}

function IconScript() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  );
}

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

interface FilmDetailFanVotingSectionProps {
  data: FanVotingMock;
  castingVote: TabbedSectionCasting;
  filmId?: string;
  filmSlug?: string;
  thoughtsPlaceholder?: string;
}

export function FilmDetailFanVotingSection({
  data,
  castingVote,
  filmId,
  filmSlug,
  thoughtsPlaceholder = 'Share your review about this project, the story, casting ideas, or anything else…',
}: FilmDetailFanVotingSectionProps) {
  const mounted = useHasMounted();
  const signInCallbackUrl = filmSlug ? `/films/${filmSlug}` : undefined;
  const { canParticipate, accessToken, gateVariant, closeGate, requireParticipation } =
    useParticipationGate(signInCallbackUrl);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [thoughts, setThoughts] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categoryIds = data.categories.map((c) => c.id);

  useEffect(() => {
    if (!mounted || !canParticipate || !filmId || !accessToken) return;
    let cancelled = false;
    fetchMyPledgeVote(filmId, accessToken)
      .then((res) => {
        if (cancelled) return;
        if (res.scores && typeof res.scores === 'object') {
          setScores(res.scores);
          setSubmitted(true);
        }
        if (res.reviewText) {
          setThoughts(res.reviewText);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [mounted, filmId, canParticipate, accessToken]);

  function handleChange(catId: string, value: number) {
    if (submitted) return;
    if (!requireParticipation()) return;
    setScores((s) => ({ ...s, [catId]: value }));
    setError(null);
  }

  const allCategoriesHaveScore =
    categoryIds.length > 0 && categoryIds.every((id) => (scores[id] ?? 0) > 0);
  const canSubmit = !submitted && !submitting && allCategoriesHaveScore;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!filmId) return;
    if (!requireParticipation() || !accessToken) return;
    if (!allCategoriesHaveScore) {
      setError('Please rate all categories before submitting.');
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
      await createPledgeVote(filmId, payload, accessToken, thoughts.trim() || undefined);
      setSubmitted(true);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to submit votes'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      className="rounded-xl border border-screenriot-accent-blue/20 bg-screenriot-accent-blue/5 p-6"
      aria-labelledby="fan-voting-heading"
    >
      <h2 id="fan-voting-heading" className="text-lg font-semibold text-white">
        {data.title ?? 'Fan Voting'}
      </h2>
      <p className="mt-1 text-sm text-screenriot-muted">{data.subtitle}</p>

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
                  <span className="text-screenriot-muted">
                    Community: {cat.communityScore}/{cat.communityMax}
                  </span>
                  <span className="rounded bg-screenriot-accent-blue/20 px-2 py-0.5 font-medium text-blue-300">
                    You: {value}/{cat.communityMax}
                  </span>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="relative h-6 w-full">
                  <div
                    className="absolute left-0 right-0 top-1/2 h-2 w-full -translate-y-1/2 rounded-full bg-white/10"
                    aria-hidden
                  />
                  <div
                    className="absolute left-0 top-1/2 h-2 -translate-y-1/2 rounded-l-full bg-screenriot-accent-blue transition-[width] duration-100"
                    style={{ width: `${percent}%` }}
                    aria-hidden
                  />
                  <input
                    type="range"
                    min={SLIDER_MIN}
                    max={SLIDER_MAX}
                    step={1}
                    value={value}
                    onChange={(e) => handleChange(cat.id, Number(e.target.value))}
                    disabled={submitted}
                    className="fan-vote-slider absolute inset-0 h-full w-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-screenriot-accent-blue/50 disabled:opacity-60"
                    aria-valuemin={SLIDER_MIN}
                    aria-valuemax={SLIDER_MAX}
                    aria-valuenow={value}
                    aria-label={`${cat.label}: ${value} out of ${cat.communityMax}`}
                  />
                </div>
                <div className="flex justify-between text-xs text-screenriot-muted">
                  <span>{cat.labelLeft}</span>
                  <span>{cat.labelRight}</span>
                </div>
              </div>
            </fieldset>
          );
        })}

        <div>
          <label htmlFor="fan-voting-thoughts" className="block text-sm font-medium text-gray-300">
            Your Review (Optional)
          </label>
          <textarea
            id="fan-voting-thoughts"
            value={thoughts}
            onChange={(e) => setThoughts(e.target.value)}
            placeholder={thoughtsPlaceholder}
            rows={3}
            disabled={submitted}
            className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-screenriot-accent-blue/50 focus:outline-none focus:ring-1 focus:ring-screenriot-accent-blue/30 disabled:opacity-60"
          />
          <p className="mt-1 text-xs text-screenriot-muted">
            Optional — saved with your vote and shown in Reviews when published.
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        )}

        {!submitted && canParticipate && !allCategoriesHaveScore ? (
          <p className="text-xs text-screenriot-muted">
            Move each slider above 0 (1–10) for Story, Script, and Casting to enable submit. Review
            text is optional and does not activate the button.
          </p>
        ) : null}
        {!canParticipate && !submitted ? (
          <p className="text-xs text-screenriot-muted">
            Sign in and complete verification to rate and submit your review.
          </p>
        ) : null}

        <button
          type="submit"
          disabled={!canSubmit && canParticipate}
          onClick={(e) => {
            if (!requireParticipation()) {
              e.preventDefault();
            }
          }}
          className="w-full rounded-lg bg-screenriot-accent-blue py-3 text-sm font-semibold text-white hover:bg-screenriot-accent-blue/90 disabled:opacity-60 sm:w-auto sm:px-8"
        >
          {submitted ? 'Votes submitted' : submitting ? 'Submitting…' : 'Submit my votes'}
        </button>
      </form>

      <FilmDetailDreamCastVoteSection
        data={castingVote}
        filmId={filmId}
        requireParticipation={requireParticipation}
        accessToken={canParticipate ? accessToken : undefined}
      />

      <FilmDetailDreamCastSuggestSection
        filmId={filmId}
        requireParticipation={requireParticipation}
        accessToken={canParticipate ? accessToken : undefined}
      />

      {gateVariant ? (
        <ParticipationGateModal
          variant={gateVariant}
          onClose={closeGate}
          signInCallbackUrl={signInCallbackUrl}
          purpose="participate"
        />
      ) : null}
    </section>
  );
}
