import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFilmPagesList } from '@/hooks/useFilmPagesList';
import { StatusPill, statusVariant } from '@/components/ui/StatusPill';
import { Pagination } from '@/components/ui/Pagination';
import { updateFilmPage } from '@/lib/api';

export default function FilmPages() {
  const navigate = useNavigate();
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const {
    films,
    loading,
    error,
    search,
    submittedSearch,
    page,
    total,
    totalPages,
    setSearch,
    setPage,
    submitSearch,
    clearSearch,
    reload,
  } = useFilmPagesList();

  async function handleTogglePublished(f: { id: string; pagePublished?: boolean }) {
    if (togglingId) return;
    setTogglingId(f.id);
    try {
      await updateFilmPage(f.id, { pagePublished: !f.pagePublished });
      await reload();
    } finally {
      setTogglingId(null);
    }
  }

  function handleSearchKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') submitSearch();
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-white">Film pages</h1>
      <p className="mt-1 text-sm text-gray-500">
        Film pages (approved applications). Toggle &quot;On site&quot; to show or hide on the web. Edit content and metadata.
      </p>

      {error && (
        <p className="mt-4 rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <label className="sr-only" htmlFor="film-pages-search">Search film pages</label>
            <input
              id="film-pages-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Title, slug or email…"
              className="w-64 rounded-md border border-white/10 bg-admin-bg py-1.5 pl-3 pr-8 text-sm text-white placeholder:text-gray-600 focus:border-admin-accent/60 focus:outline-none focus:ring-1 focus:ring-admin-accent/30"
            />
            {(search || submittedSearch) && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={submitSearch}
            className="rounded-md bg-admin-accent/15 px-4 py-1.5 text-sm font-medium text-admin-accent transition-colors hover:bg-admin-accent/25 disabled:opacity-50"
            disabled={loading}
            aria-label="Search"
          >
            Search
          </button>
        </div>
      </div>

      {!loading && (
        <p className="mt-4 text-xs text-gray-500">
          {total} {total === 1 ? 'page' : 'pages'} found
          {submittedSearch && (
            <>
              {' '}for &ldquo;<span className="text-gray-400">{submittedSearch}</span>&rdquo;
            </>
          )}
        </p>
      )}

      <div className="mt-3 overflow-x-auto rounded-xl border border-white/[0.06]">
        <table className="w-full text-left text-sm" role="table" aria-label="Film pages list">
          <thead>
            <tr className="border-b border-white/[0.06] bg-admin-sidebar">
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-500">Title</th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-500">Slug</th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-500">Status</th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-500">On site</th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-500">Filmmaker</th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-500">Updated</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">Loading…</td>
              </tr>
            ) : films.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                  No film pages yet. Approve applications in Applications to create pages.
                </td>
              </tr>
            ) : (
              films.map((f) => (
                <tr key={f.id} className="border-b border-white/[0.04] transition-colors hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-medium text-white">{f.title}</td>
                  <td className="px-4 py-3 text-gray-400">/{f.slug}</td>
                  <td className="px-4 py-3">
                    <StatusPill label={f.status} variant={statusVariant(f.status)} />
                  </td>
                  <td className="px-4 py-3">
                    <span className="mr-1.5 text-xs text-gray-400">
                      {f.pagePublished ? 'Published' : 'Unpublished'}
                    </span>
                    <button
                      type="button"
                      onClick={() => void handleTogglePublished(f)}
                      disabled={togglingId === f.id}
                      className="rounded bg-white/10 px-2 py-0.5 text-xs font-medium text-gray-300 hover:bg-white/20 disabled:opacity-50"
                      aria-label={f.pagePublished ? 'Unpublish from site' : 'Publish on site'}
                    >
                      {togglingId === f.id ? '…' : f.pagePublished ? 'Unpublish' : 'Publish'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{f.filmmaker?.email ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(f.updatedAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => navigate(`/film-pages/${f.id}`)}
                        className="rounded bg-admin-accent/10 px-2.5 py-0.5 text-xs font-medium text-admin-accent transition-colors hover:bg-admin-accent/20"
                        aria-label={`Edit page ${f.title}`}
                      >
                        Edit page
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`/films/${f.id}`)}
                        className="rounded bg-white/10 px-2.5 py-0.5 text-xs font-medium text-gray-300 transition-colors hover:bg-white/20"
                        aria-label={`Open application ${f.title}`}
                      >
                        Application
                      </button>
                    </div>
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
