import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { searchTmdbActor, getTmdbPersonDetails } from '@/lib/api';
import type { TmdbActorResult, TmdbPersonDetails } from '@/types/tmdb';

/** Person-shaped patch — reused for both cast (MainCharacterForm) and crew (KeyCrewMemberForm), which share these field names. */
type ApplyPatch = {
  name?: string;
  imageUrl?: string;
  tmdbBio?: string;
  tmdbBirthday?: string;
  tmdbPlaceOfBirth?: string;
  tmdbAlsoKnownAs?: string[];
  tmdbPopularity?: number;
};

type Props = {
  open: boolean;
  /** Searched automatically on open — the person's own "Name" field, no separate input. */
  query: string;
  onClose: () => void;
  onApply: (patch: Partial<ApplyPatch>) => void;
};

const emptyChecks = {
  name: true,
  photo: true,
  bio: true,
  birthday: true,
  placeOfBirth: true,
  alsoKnownAs: false,
  popularity: false,
};

/** Search TMDB for the typed person name (actor or crew), then let the admin pick exactly which fields to pull in. */
export function TmdbPersonSearchModal({ open, query, onClose, onApply }: Props) {
  const [results, setResults] = useState<TmdbActorResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<TmdbActorResult | null>(null);
  const [details, setDetails] = useState<TmdbPersonDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [checks, setChecks] = useState(emptyChecks);

  useEffect(() => {
    if (!open) return;
    setSelected(null);
    setDetails(null);
    setError('');
    setResults(null);
    setChecks(emptyChecks);
    const q = query.trim();
    if (!q) {
      setError('Type the actor name in the field above first.');
      return;
    }
    setLoading(true);
    searchTmdbActor(q)
      .then((res) => setResults(res.results))
      .catch((err) => setError(err instanceof Error ? err.message : 'TMDB search failed'))
      .finally(() => setLoading(false));
  }, [open, query]);

  function selectResult(result: TmdbActorResult) {
    setSelected(result);
    setDetailsLoading(true);
    getTmdbPersonDetails(result.tmdbId)
      .then(setDetails)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load actor details'))
      .finally(() => setDetailsLoading(false));
  }

  function handleApply() {
    if (!selected) return;
    const patch: Partial<ApplyPatch> = {};
    if (checks.name) patch.name = selected.name;
    if (checks.photo && selected.profilePhotoUrl) patch.imageUrl = selected.profilePhotoUrl;
    if (checks.bio && details?.bio) patch.tmdbBio = details.bio;
    if (checks.birthday && details?.birthday) patch.tmdbBirthday = details.birthday;
    if (checks.placeOfBirth && details?.placeOfBirth) patch.tmdbPlaceOfBirth = details.placeOfBirth;
    if (checks.alsoKnownAs && details?.alsoKnownAs.length) patch.tmdbAlsoKnownAs = details.alsoKnownAs;
    if (checks.popularity) patch.tmdbPopularity = selected.popularity;
    onApply(patch);
    onClose();
  }

  return (
    <Modal open={open} title="Search TMDB" onClose={onClose}>
      {loading && <p className="text-sm text-gray-400">Searching…</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}

      {!loading && !error && results && !selected && (
        <ul className="max-h-72 space-y-1 overflow-y-auto" role="list">
          {results.length === 0 && <li className="px-1 py-1.5 text-sm text-gray-500">No matches found.</li>}
          {results.map((r) => (
            <li key={r.tmdbId}>
              <button
                type="button"
                onClick={() => selectResult(r)}
                className="flex w-full items-center gap-3 rounded px-2 py-2 text-left transition-colors hover:bg-white/5"
              >
                {r.profilePhotoUrl ? (
                  <img src={r.profilePhotoUrl} alt="" className="h-12 w-12 shrink-0 rounded object-cover" />
                ) : (
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-white/10 text-xs text-gray-500">
                    ?
                  </span>
                )}
                <span className="min-w-0">
                  <span className="block truncate text-sm text-white">{r.name}</span>
                  {r.knownFor && <span className="block truncate text-xs text-gray-500">Known for: {r.knownFor}</span>}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {selected && (
        <div>
          <div className="flex items-center gap-3 rounded-md border border-white/10 bg-admin-bg p-3">
            {selected.profilePhotoUrl ? (
              <img src={selected.profilePhotoUrl} alt="" className="h-14 w-14 shrink-0 rounded object-cover" />
            ) : (
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded bg-white/10 text-xs text-gray-500">
                No photo
              </span>
            )}
            <span className="min-w-0 truncate text-sm font-medium text-white">{selected.name}</span>
          </div>

          <p className="mt-3 text-xs text-gray-400">Choose what to pull in from this match:</p>

          {detailsLoading ? (
            <p className="mt-2 text-sm text-gray-400">Loading actor details…</p>
          ) : (
            <div className="mt-2 space-y-1.5">
              <label className="flex items-center gap-2 text-sm text-white">
                <input
                  type="checkbox"
                  checked={checks.name}
                  onChange={(e) => setChecks((c) => ({ ...c, name: e.target.checked }))}
                  className="accent-admin-accent"
                />
                Name: <span className="truncate font-medium">{selected.name}</span>
              </label>
              <label className="flex items-center gap-2 text-sm text-white">
                <input
                  type="checkbox"
                  checked={checks.photo}
                  disabled={!selected.profilePhotoUrl}
                  onChange={(e) => setChecks((c) => ({ ...c, photo: e.target.checked }))}
                  className="accent-admin-accent"
                />
                Photo{!selected.profilePhotoUrl && <span className="text-gray-500"> (none available)</span>}
              </label>
              <label className="flex items-start gap-2 text-sm text-white">
                <input
                  type="checkbox"
                  checked={checks.bio}
                  disabled={!details?.bio}
                  onChange={(e) => setChecks((c) => ({ ...c, bio: e.target.checked }))}
                  className="mt-0.5 accent-admin-accent"
                />
                <span>
                  Biography
                  {details?.bio ? (
                    <span className="mt-0.5 block max-h-16 overflow-y-auto text-xs text-gray-500">{details.bio}</span>
                  ) : (
                    <span className="text-gray-500"> (none available)</span>
                  )}
                </span>
              </label>
              <label className="flex items-center gap-2 text-sm text-white">
                <input
                  type="checkbox"
                  checked={checks.birthday}
                  disabled={!details?.birthday}
                  onChange={(e) => setChecks((c) => ({ ...c, birthday: e.target.checked }))}
                  className="accent-admin-accent"
                />
                Birthday{details?.birthday ? `: ${details.birthday}` : <span className="text-gray-500"> (none available)</span>}
              </label>
              <label className="flex items-center gap-2 text-sm text-white">
                <input
                  type="checkbox"
                  checked={checks.placeOfBirth}
                  disabled={!details?.placeOfBirth}
                  onChange={(e) => setChecks((c) => ({ ...c, placeOfBirth: e.target.checked }))}
                  className="accent-admin-accent"
                />
                Place of birth
                {details?.placeOfBirth ? `: ${details.placeOfBirth}` : <span className="text-gray-500"> (none available)</span>}
              </label>
              <label className="flex items-center gap-2 text-sm text-white">
                <input
                  type="checkbox"
                  checked={checks.alsoKnownAs}
                  disabled={!details?.alsoKnownAs.length}
                  onChange={(e) => setChecks((c) => ({ ...c, alsoKnownAs: e.target.checked }))}
                  className="accent-admin-accent"
                />
                Also known as
                {details?.alsoKnownAs.length ? (
                  <span className="text-gray-500">: {details.alsoKnownAs.join(', ')}</span>
                ) : (
                  <span className="text-gray-500"> (none available)</span>
                )}
              </label>
              <label className="flex items-center gap-2 text-sm text-white">
                <input
                  type="checkbox"
                  checked={checks.popularity}
                  onChange={(e) => setChecks((c) => ({ ...c, popularity: e.target.checked }))}
                  className="accent-admin-accent"
                />
                TMDB popularity score: {selected.popularity.toFixed(1)}
              </label>
            </div>
          )}

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="rounded px-3 py-1.5 text-sm font-medium text-gray-300 hover:bg-white/10"
            >
              Back to results
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={detailsLoading || !Object.values(checks).some(Boolean)}
              className="rounded bg-admin-accent/20 px-3 py-1.5 text-sm font-medium text-admin-accent hover:bg-admin-accent/30 disabled:opacity-50"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
