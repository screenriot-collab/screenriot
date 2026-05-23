'use client';

import { useState } from 'react';
import { getErrorMessage } from '@/lib/api';
import { createCastingSuggestion } from '@/lib/films-api';

interface FilmDetailDreamCastSuggestSectionProps {
  filmId?: string;
  requireParticipation?: () => boolean;
  accessToken?: string;
}

export function FilmDetailDreamCastSuggestSection({
  filmId,
  requireParticipation,
  accessToken,
}: FilmDetailDreamCastSuggestSectionProps) {
  const [actorSuggestion, setActorSuggestion] = useState('');
  const [roleHint, setRoleHint] = useState('');
  const [suggestMessage, setSuggestMessage] = useState<string | null>(null);
  const [suggestError, setSuggestError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSuggestActor() {
    if (requireParticipation && !requireParticipation()) return;
    const name = actorSuggestion.trim();
    if (!name) return;
    if (!filmId || !accessToken) return;

    setSubmitting(true);
    setSuggestError(null);
    setSuggestMessage(null);
    try {
      await createCastingSuggestion(filmId, name, accessToken, roleHint.trim() || undefined);
      setSuggestMessage(`Thanks — "${name}" was sent to the team for review.`);
      setActorSuggestion('');
      setRoleHint('');
      window.setTimeout(() => setSuggestMessage(null), 6000);
    } catch (e) {
      setSuggestError(getErrorMessage(e, 'Failed to submit suggestion'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-8 rounded-lg border-2 border-dashed border-screenriot-accent-blue/30 bg-screenriot-bg/50 p-4">
      <h4 className="font-semibold text-white">Suggest Your Own Actor</h4>
      <p className="mt-1 text-sm text-screenriot-muted">
        Don&apos;t see your favorite actor? Suggest up to 3 actors — the production team reviews them in
        admin.
      </p>
      <div className="mt-4 flex flex-col gap-2">
        <label htmlFor="actor-suggestion" className="sr-only">
          Actor name
        </label>
        <input
          id="actor-suggestion"
          type="search"
          value={actorSuggestion}
          onChange={(e) => setActorSuggestion(e.target.value)}
          placeholder="Actor name (e.g., Emily Blunt)"
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-screenriot-accent-blue/50 focus:outline-none focus:ring-1 focus:ring-screenriot-accent-blue/30"
        />
        <label htmlFor="actor-role-hint" className="sr-only">
          Role (optional)
        </label>
        <input
          id="actor-role-hint"
          type="text"
          value={roleHint}
          onChange={(e) => setRoleHint(e.target.value)}
          placeholder="Role (optional)"
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-screenriot-accent-blue/50 focus:outline-none focus:ring-1 focus:ring-screenriot-accent-blue/30"
        />
        <button
          type="button"
          disabled={submitting || !actorSuggestion.trim()}
          onClick={() => void handleSuggestActor()}
          className="self-start rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 disabled:opacity-60"
        >
          {submitting ? 'Sending…' : 'Add suggestion'}
        </button>
      </div>
      {suggestMessage ? (
        <p className="mt-2 text-xs text-emerald-400" role="status">
          {suggestMessage}
        </p>
      ) : null}
      {suggestError ? (
        <p className="mt-2 text-xs text-red-400" role="alert">
          {suggestError}
        </p>
      ) : null}
    </div>
  );
}
