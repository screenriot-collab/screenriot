import { useNavigate } from 'react-router-dom';
import { useFilmsList } from '@/hooks/useFilmsList';
import { StatusPill, statusVariant, statusAccentClass, statusBadgeClass, statusTextClass } from '@/components/ui/StatusPill';
import type { StatusVariant } from '@/components/ui/StatusPill';
import { ExternalLinkIcon } from '@/components/ui/icons/ExternalLinkIcon';
import { Pagination } from '@/components/ui/Pagination';
import { STATUS_TABS } from '@/constants/films';

const EDIT_PAGE_STATUSES = ['approved', 'fundraising', 'funded', 'closed'];

const TAB_VARIANT: Record<string, StatusVariant> = {
  all: 'neutral',
  pending: 'warn',
  approved: 'ok',
  rejected: 'bad',
  draft: 'purple',
};

function reviewVariant(status: string): StatusVariant {
  switch (status) {
    case 'action_required': return 'warn';
    case 'changes_submitted': return 'info';
    default: return 'neutral';
  }
}

function reviewLabel(status: string): string {
  switch (status) {
    case 'action_required': return 'Action required';
    case 'changes_submitted': return 'Changes submitted';
    case 'no_action': return 'No action';
    default: return status;
  }
}

export default function Films() {
  const navigate = useNavigate();
  const {
    films,
    loading,
    error,
    tab,
    search,
    submittedSearch,
    page,
    total,
    totalPages,
    setSearch,
    setPage,
    changeTab,
    submitSearch,
    clearSearch,
  } = useFilmsList();

  function handleSearchKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') submitSearch();
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-white">Applications</h1>
      <p className="mt-1 text-sm text-gray-500">
        Film applications from filmmakers. Review, approve, reject and leave per-step comments.
      </p>

      {error && (
        <p className="mt-4 rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}

      {/* Filters bar */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1" role="tablist" aria-label="Film status filters">
          {STATUS_TABS.map((t) => {
            const active = t.id === tab;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => changeTab(t.id)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? statusBadgeClass(TAB_VARIANT[t.id] ?? 'neutral')
                    : `${statusTextClass(TAB_VARIANT[t.id] ?? 'neutral')} hover:bg-white/[0.06]`
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <label className="sr-only" htmlFor="films-search">Search films</label>
            <input
              id="films-search"
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
            aria-label="Search films"
          >
            Search
          </button>
        </div>
      </div>

      {/* Results count */}
      {!loading && (
        <p className="mt-4 text-xs text-gray-500">
          {total} {total === 1 ? 'film' : 'films'} found
          {submittedSearch && (
            <>
              {' '}for &ldquo;<span className="text-gray-400">{submittedSearch}</span>&rdquo;
            </>
          )}
        </p>
      )}

      {/* Table */}
      <div className="mt-3 overflow-x-auto rounded-xl border border-white/[0.06]">
        <table className="w-full text-left text-sm" role="table" aria-label="Applications list">
          <thead>
            <tr className="border-b border-white/[0.06] bg-admin-sidebar">
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-500">Title</th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-500">Filmmaker</th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-500">Status</th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-500">Review</th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-500">Fee</th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-500">Reviewed by</th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-500">Updated</th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-500" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-500">Loading…</td>
              </tr>
            ) : films.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-500">No films found.</td>
              </tr>
            ) : (
              films.map((f) => (
                <tr
                  key={f.id}
                  className="border-b border-white/[0.04] transition-colors hover:bg-white/[0.02]"
                >
                  <td className={`px-4 py-3 ${statusAccentClass(statusVariant(f.status))}`}>
                    <span className="font-medium text-white">{f.title}</span>
                    <span className="ml-2 text-xs text-gray-600">/{f.slug}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{f.filmmaker?.email ?? '—'}</td>
                  <td className="px-4 py-3">
                    <StatusPill label={f.status} variant={statusVariant(f.status)} />
                  </td>
                  <td className="px-4 py-3">
                    {f.reviewStatus ? (
                      <StatusPill
                        label={reviewLabel(f.reviewStatus)}
                        variant={reviewVariant(f.reviewStatus)}
                      />
                    ) : (
                      <span className="text-xs text-gray-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill
                      label={f.submissionFeePaid ? 'paid' : 'unpaid'}
                      variant={f.submissionFeePaid ? 'ok' : 'neutral'}
                    />
                  </td>
                  <td className="px-4 py-3 text-gray-400">{f.lastReviewedBy?.username ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(f.updatedAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => navigate(`/films/${f.id}`)}
                        className="rounded bg-admin-accent/10 px-2.5 py-0.5 text-xs font-medium text-admin-accent transition-colors hover:bg-admin-accent/20"
                        aria-label={`Open film ${f.title}`}
                      >
                        Open
                      </button>
                      {EDIT_PAGE_STATUSES.includes(f.status) && (
                        <button
                          type="button"
                          onClick={() => navigate(`/film-pages/${f.id}`)}
                          className="rounded bg-white/10 px-2.5 py-0.5 text-xs font-medium text-gray-300 transition-colors hover:bg-white/20"
                          aria-label={`Manage page ${f.title}`}
                        >
                          Manage page
                          <ExternalLinkIcon />
                        </button>
                      )}
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
