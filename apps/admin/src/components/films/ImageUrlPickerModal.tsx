import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { CLASS_INPUT_SM } from '@/constants/styles';
import { searchTmdbActor, searchTmdbMovie } from '@/lib/api';

type Kind = 'movie' | 'person';

type SearchResult = {
  id: number;
  label: string;
  sublabel?: string;
  imageUrl: string | null;
};

type Props = {
  open: boolean;
  kind: Kind;
  /** Modal title, e.g. "Set poster" / "Set photo". */
  title: string;
  /** Pre-filled search query - the film title or the person's name, editable before searching. */
  initialQuery: string;
  currentUrl?: string | null;
  onClose: () => void;
  onApply: (url: string) => void;
};

/**
 * Generic image-url picker for entries that don't already have one: paste a URL by hand,
 * or search TMDB and pick a poster/photo from the results. Used for Similar Films posters
 * and for Main Characters / Key Crew avatars when no image was pulled in via the full
 * TmdbPersonSearchModal flow.
 */
export function ImageUrlPickerModal({ open, kind, title, initialQuery, currentUrl, onClose, onApply }: Props) {
  const [query, setQuery] = useState(initialQuery);
  const [manualUrl, setManualUrl] = useState('');
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setQuery(initialQuery);
    setManualUrl('');
    setResults(null);
    setError('');
  }, [open, initialQuery]);

  async function handleSearch() {
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setError('');
    setResults(null);
    try {
      if (kind === 'movie') {
        const res = await searchTmdbMovie(q);
        setResults(
          res.results.map((r) => ({
            id: r.tmdbId,
            label: r.releaseYear ? `${r.title} (${r.releaseYear})` : r.title,
            imageUrl: r.posterUrl,
          })),
        );
      } else {
        const res = await searchTmdbActor(q);
        setResults(
          res.results.map((r) => ({
            id: r.tmdbId,
            label: r.name,
            sublabel: r.knownFor || undefined,
            imageUrl: r.profilePhotoUrl,
          })),
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'TMDB search failed');
    } finally {
      setLoading(false);
    }
  }

  function handleApplyUrl(url: string) {
    onApply(url);
    onClose();
  }

  return (
    <Modal open={open} title={title} onClose={onClose}>
      <div>
        <label className="mb-1 block text-xs text-gray-400">Paste an image URL</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            placeholder="https://…"
            className={CLASS_INPUT_SM}
            autoFocus
          />
          <button
            type="button"
            onClick={() => handleApplyUrl(manualUrl.trim())}
            disabled={!manualUrl.trim()}
            className="shrink-0 rounded bg-admin-accent/15 px-3 py-1.5 text-xs font-medium text-admin-accent transition-colors hover:bg-admin-accent/25 disabled:opacity-50"
          >
            Use URL
          </button>
        </div>
        {currentUrl && (
          <button
            type="button"
            onClick={() => handleApplyUrl('')}
            className="mt-1.5 text-xs text-red-400 hover:underline"
          >
            Remove current image
          </button>
        )}
      </div>

      <div className="my-4 border-t border-white/10 pt-4">
        <label className="mb-1 block text-xs text-gray-400">Or search TMDB</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                void handleSearch();
              }
            }}
            placeholder={kind === 'movie' ? 'Film title to search…' : 'Name to search…'}
            className={CLASS_INPUT_SM}
          />
          <button
            type="button"
            onClick={() => void handleSearch()}
            disabled={loading || !query.trim()}
            className="shrink-0 rounded bg-admin-accent/15 px-3 py-1.5 text-xs font-medium text-admin-accent transition-colors hover:bg-admin-accent/25 disabled:opacity-50"
          >
            {loading ? 'Searching…' : 'Search'}
          </button>
        </div>

        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}

        {results && (
          <ul className="mt-3 max-h-72 space-y-1 overflow-y-auto" role="list">
            {results.length === 0 && <li className="px-1 py-1.5 text-sm text-gray-500">No matches found.</li>}
            {results.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => r.imageUrl && handleApplyUrl(r.imageUrl)}
                  disabled={!r.imageUrl}
                  className="flex w-full items-center gap-3 rounded px-2 py-2 text-left transition-colors hover:bg-white/5 disabled:opacity-50"
                >
                  {r.imageUrl ? (
                    <img src={r.imageUrl} alt="" className="h-14 w-14 shrink-0 rounded object-cover" />
                  ) : (
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded bg-white/10 text-xs text-gray-500">
                      No image
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="block truncate text-sm text-white">{r.label}</span>
                    {r.sublabel && <span className="block truncate text-xs text-gray-500">{r.sublabel}</span>}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
}
