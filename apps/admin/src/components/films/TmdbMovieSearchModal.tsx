import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { CLASS_INPUT_SM } from '@/constants/styles';
import { searchTmdbMovie, getTmdbMovieDetails } from '@/lib/api';
import type { TmdbMovieResult } from '@/types/tmdb';
import type { SimilarFilmForm } from '@/types/films';

type Props = {
  open: boolean;
  onClose: () => void;
  /** Adds a brand-new Similar Films row — this does not edit an existing one. */
  onAdd: (film: SimilarFilmForm) => void;
};

function formatBoxOffice(revenue: number | null): string {
  if (!revenue) return '';
  return `$${(revenue / 1_000_000).toFixed(1)}M`;
}

/** Search TMDB for a movie title, pick a match, add it as a new Similar Films row. ROI and Match % stay manual — TMDB has no such figures. */
export function TmdbMovieSearchModal({ open, onClose, onAdd }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TmdbMovieResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [applyingId, setApplyingId] = useState<number | null>(null);
  const [error, setError] = useState('');

  function handleClose() {
    setQuery('');
    setResults(null);
    setError('');
    onClose();
  }

  async function handleSearch() {
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setError('');
    setResults(null);
    try {
      const res = await searchTmdbMovie(q);
      setResults(res.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'TMDB search failed');
    } finally {
      setLoading(false);
    }
  }

  async function handlePick(movie: TmdbMovieResult) {
    setApplyingId(movie.tmdbId);
    try {
      const details = await getTmdbMovieDetails(movie.tmdbId);
      onAdd({
        id: `similar-${Date.now()}`,
        title: movie.title,
        boxOffice: formatBoxOffice(details.revenue),
        roi: '',
        rating: movie.voteAverage !== null ? movie.voteAverage.toFixed(1) : '',
        matchPercent: 0,
        posterUrl: movie.posterUrl ?? undefined,
      });
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load movie details');
    } finally {
      setApplyingId(null);
    }
  }

  return (
    <Modal open={open} title="Add similar film — search TMDB" onClose={handleClose}>
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
          placeholder="Film title to search…"
          className={CLASS_INPUT_SM}
          aria-label="Film title to search on TMDB"
          autoFocus
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
            <li key={r.tmdbId}>
              <button
                type="button"
                onClick={() => void handlePick(r)}
                disabled={applyingId !== null}
                className="flex w-full items-center gap-3 rounded px-2 py-2 text-left transition-colors hover:bg-white/5 disabled:opacity-50"
              >
                {r.posterUrl ? (
                  <img src={r.posterUrl} alt="" className="h-16 w-11 shrink-0 rounded object-cover" />
                ) : (
                  <span className="flex h-16 w-11 shrink-0 items-center justify-center rounded bg-white/10 text-xs text-gray-500">
                    ?
                  </span>
                )}
                <span className="min-w-0">
                  <span className="block truncate text-sm text-white">
                    {r.title} {r.releaseYear && <span className="text-gray-500">({r.releaseYear})</span>}
                  </span>
                  {r.voteAverage !== null && (
                    <span className="block text-xs text-gray-500">TMDB rating: {r.voteAverage.toFixed(1)}</span>
                  )}
                </span>
                {applyingId === r.tmdbId && <span className="ml-auto text-xs text-gray-400">Loading…</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
