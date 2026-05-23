import { Link } from 'react-router-dom';
import { useCastingSuggestionFilms } from '@/hooks/useCastingSuggestionFilms';
import { Pagination } from '@/components/ui/Pagination';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'pending', label: 'Has pending' },
  { value: 'reviewed', label: 'Has reviewed' },
  { value: 'accepted', label: 'Has accepted' },
  { value: 'rejected', label: 'Has rejected' },
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function CastingSuggestionsFilms() {
  const {
    films,
    total,
    page,
    totalPages,
    loading,
    error,
    status,
    setStatus,
    searchInput,
    setSearchInput,
    applySearch,
    setPage,
  } = useCastingSuggestionFilms();

  return (
    <>
      <h1 className="text-2xl font-bold text-white">Casting suggestions</h1>
      <p className="mt-1 text-sm text-gray-500">
        Choose a film to review fan-submitted actors. Accepting adds the actor to Dream cast on the
        public page.
      </p>

      {error ? (
        <p className="mt-4 rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <label className="flex items-center gap-2 text-sm text-gray-400">
          Filter by suggestion status
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="rounded-md border border-white/10 bg-admin-bg px-2 py-1.5 text-sm text-white focus:border-admin-accent/60 focus:outline-none focus:ring-1 focus:ring-admin-accent/30"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value || 'all'} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-2">
          <label htmlFor="casting-films-search" className="sr-only">
            Search films
          </label>
          <input
            id="casting-films-search"
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') applySearch();
            }}
            placeholder="Film title or slug…"
            className="w-56 rounded-md border border-white/10 bg-admin-bg px-3 py-1.5 text-sm text-white placeholder:text-gray-500 focus:border-admin-accent/60 focus:outline-none focus:ring-1 focus:ring-admin-accent/30"
          />
          <button
            type="button"
            onClick={applySearch}
            className="rounded-md border border-white/10 bg-admin-card px-3 py-1.5 text-sm text-white hover:bg-white/5"
          >
            Search
          </button>
        </div>

        <p className="text-sm text-gray-500">{total} films with suggestions</p>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-white/10">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-white/10 bg-admin-card/80 text-xs uppercase tracking-wide text-gray-400">
            <tr>
              <th className="px-4 py-3 font-medium">Film</th>
              <th className="px-4 py-3 font-medium">Suggestions</th>
              <th className="px-4 py-3 font-medium">Pending</th>
              <th className="px-4 py-3 font-medium">Last submitted</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  Loading…
                </td>
              </tr>
            ) : films.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  No films with casting suggestions yet.
                </td>
              </tr>
            ) : (
              films.map((film) => (
                <tr key={film.filmId} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-4">
                    <p className="font-medium text-white">{film.filmTitle}</p>
                    <p className="text-xs text-gray-500">/{film.filmSlug}</p>
                  </td>
                  <td className="px-4 py-4 text-gray-300">{film.total}</td>
                  <td className="px-4 py-4">
                    {film.pending > 0 ? (
                      <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-300">
                        {film.pending}
                      </span>
                    ) : (
                      <span className="text-gray-500">0</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-gray-400">
                    {formatDate(film.lastSubmittedAt)}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Link
                      to={`/casting-suggestions/${film.filmId}`}
                      className="inline-flex rounded-md bg-admin-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-admin-accent/90"
                    >
                      Review
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} loading={loading} onPageChange={setPage} />
    </>
  );
}
