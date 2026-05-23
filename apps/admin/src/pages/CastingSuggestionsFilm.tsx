import { Link, useParams } from 'react-router-dom';
import { useCastingSuggestions } from '@/hooks/useCastingSuggestions';
import { CastingSuggestionRow } from '@/components/casting-suggestions/CastingSuggestionRow';
import { Pagination } from '@/components/ui/Pagination';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
];

export default function CastingSuggestionsFilm() {
  const { filmId = '' } = useParams<{ filmId: string }>();
  const {
    suggestions,
    total,
    page,
    totalPages,
    loading,
    error,
    status,
    setStatus,
    setPage,
    handleUpdateStatus,
  } = useCastingSuggestions(filmId);

  const filmTitle = suggestions[0]?.filmTitle;
  const filmSlug = suggestions[0]?.filmSlug;

  return (
    <>
      <nav className="text-sm text-gray-500" aria-label="Breadcrumb">
        <Link to="/casting-suggestions" className="text-admin-accent hover:underline">
          Casting suggestions
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-300">{filmTitle ?? 'Film'}</span>
      </nav>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">{filmTitle ?? 'Casting suggestions'}</h1>
          {filmSlug ? <p className="mt-1 text-sm text-gray-500">/{filmSlug}</p> : null}
          <p className="mt-2 text-sm text-gray-500">
            {total} suggestion{total === 1 ? '' : 's'} for this film.
          </p>
        </div>
        <Link
          to={`/film-pages/${filmId}`}
          className="shrink-0 rounded-md border border-white/10 px-3 py-1.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white"
        >
          Open film page editor
        </Link>
      </div>

      {error ? (
        <p className="mt-4 rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-gray-400">
          Filter
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
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-white/10">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-white/10 bg-admin-card/80 text-xs uppercase tracking-wide text-gray-400">
            <tr>
              <th className="px-4 py-3 font-medium">Fan</th>
              <th className="px-4 py-3 font-medium">Submitted</th>
              <th className="px-4 py-3 font-medium">Review</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                  Loading…
                </td>
              </tr>
            ) : suggestions.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                  No suggestions for this filter.
                </td>
              </tr>
            ) : (
              suggestions.map((row) => (
                <CastingSuggestionRow key={row.id} row={row} onUpdate={handleUpdateStatus} />
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} loading={loading} onPageChange={setPage} />
    </>
  );
}
