'use client';

import { useEffect, useState } from 'react';
import type { TabbedSectionCasting } from '@/markup/film-detail';
import { getErrorMessage } from '@/lib/api';
import { createCastingVote, fetchMyCastingVotes } from '@/lib/films-api';
import { IMAGES } from '@/lib/constants';

interface FilmDetailDreamCastVoteSectionProps {
  data: TabbedSectionCasting;
  filmId?: string;
  requireParticipation?: () => boolean;
  accessToken?: string;
}

export function FilmDetailDreamCastVoteSection({
  data,
  filmId,
  requireParticipation,
  accessToken,
}: FilmDetailDreamCastVoteSectionProps) {
  const [votedIds, setVotedIds] = useState<string[]>([]);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cast = data.cast ?? [];
  const showSection =
    cast.length > 0 || Boolean(data.subtitle?.trim()) || Boolean(data.title?.trim()) || Boolean(data.tip?.trim());

  useEffect(() => {
    async function loadMyVotes() {
      if (!filmId || !accessToken) return;
      try {
        const res = await fetchMyCastingVotes(filmId, accessToken);
        setVotedIds(res.optionIds ?? []);
      } catch {
        // keep local state
      }
    }
    void loadMyVotes();
  }, [filmId, accessToken]);

  async function handleVote(optionId: string) {
    if (votedIds.includes(optionId) || submittingId === optionId) return;
    if (!filmId) {
      setVotedIds((prev) => (prev.includes(optionId) ? prev : [...prev, optionId]));
      return;
    }
    if (requireParticipation && !requireParticipation()) return;
    if (!accessToken) return;

    try {
      setSubmittingId(optionId);
      setError(null);
      await createCastingVote(filmId, optionId, accessToken);
      setVotedIds((prev) => (prev.includes(optionId) ? prev : [...prev, optionId]));
    } catch (e) {
      setError(getErrorMessage(e, 'Failed to submit vote'));
    } finally {
      setSubmittingId(null);
    }
  }

  if (!showSection) return null;

  return (
    <div className="mt-10 space-y-6 border-t border-white/10 pt-8">
      <div>
        <h3 className="text-base font-semibold text-white">{data.title || 'Vote for Your Dream Cast'}</h3>
        {data.subtitle?.trim() ? (
          <p className="mt-1 text-sm text-screenriot-muted">{data.subtitle}</p>
        ) : (
          <p className="mt-1 text-sm text-screenriot-muted">
            Vote for every actor you want in this cast — each click saves immediately. You do not need
            Submit my votes above.
          </p>
        )}
      </div>

      {cast.length > 0 ? (
        <ul className="space-y-3">
          {cast.map((actor) => {
            const isConfirmed = (actor.status ?? 'wish_list') === 'verified';
            const alreadyVoted = votedIds.includes(actor.id);
            const isSubmitting = submittingId === actor.id;
            const disabled = isConfirmed || alreadyVoted || isSubmitting;

            return (
              <li key={actor.id} className="rounded-lg border border-white/10 bg-screenriot-bg/80 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-white">{actor.name}</p>
                      {isConfirmed ? (
                        <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-400">
                          Verified Cast
                        </span>
                      ) : null}
                    </div>
                    <p className="text-sm text-screenriot-muted">{actor.role}</p>
                  </div>
                  {!isConfirmed ? (
                    <button
                      type="button"
                      onClick={() => void handleVote(actor.id)}
                      disabled={disabled}
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                        alreadyVoted
                          ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                          : 'border-white/20 bg-white/5 text-white hover:bg-white/10'
                      } disabled:cursor-not-allowed disabled:opacity-60`}
                      aria-pressed={alreadyVoted}
                    >
                      <img src={IMAGES.icons.starFilled} alt="" width={16} height={16} className="h-4 w-4" aria-hidden />
                      {alreadyVoted ? 'Voted' : 'Vote'}
                    </button>
                  ) : (
                    <p className="text-xs text-screenriot-muted">Confirmed — not open for fan voting</p>
                  )}
                </div>
                {!isConfirmed ? (
                  <div className="mt-3 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-screenriot-accent-blue transition-[width] duration-300"
                        style={{ width: `${Math.min(100, actor.votePercent)}%` }}
                      />
                    </div>
                    <span className="shrink-0 text-xs text-screenriot-muted">{actor.votes} votes</span>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}

      {error ? (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      {data.tip?.trim() ? (
        <div className="flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
          <img src={IMAGES.icons.lightbulb} alt="" width={20} height={20} className="h-5 w-5 shrink-0" aria-hidden />
          <p className="text-sm text-amber-200/90">{data.tip}</p>
        </div>
      ) : null}
    </div>
  );
}
