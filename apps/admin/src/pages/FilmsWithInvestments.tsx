import { useState, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { useFilmsWithInvestments } from '@/hooks/useFilmsWithInvestments';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'approved', label: 'Approved' },
  { value: 'fundraising', label: 'Fundraising' },
  { value: 'funded', label: 'Funded' },
  { value: 'closed', label: 'Closed' },
];

function formatUsd(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

const WEB_ORIGIN = import.meta.env.VITE_WEB_ORIGIN ?? '';

export default function FilmsWithInvestments() {
  const {
    films,
    total,
    page,
    totalPages,
    loading,
    error,
    status,
    setPage,
    setStatus,
    donationsByFilmId,
    loadingDonations,
    loadDonationsForFilm,
  } = useFilmsWithInvestments();

  const [expandedId, setExpandedId] = useState<string | null>(null);

  function toggleExpand(filmId: string) {
    if (expandedId === filmId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(filmId);
    void loadDonationsForFilm(filmId);
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-white">Films with investments</h1>
      <p className="mt-1 text-sm text-gray-500">
        Films that have at least one donation. Expand a row to see donation list.
      </p>

      {error && (
        <p className="mt-4 rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-gray-400">
          Status
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-md border border-white/10 bg-admin-bg px-2 py-1.5 text-sm text-white focus:border-admin-accent/60 focus:outline-none focus:ring-1 focus:ring-admin-accent/30"
            aria-label="Filter by film status"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value || 'all'} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-gray-400">Loading…</p>
      ) : films.length === 0 ? (
        <p className="mt-6 text-sm text-gray-400">No films with investments.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full min-w-[600px] text-left text-sm" role="table">
            <thead>
              <tr className="border-b border-white/10 bg-admin-sidebar/50">
                <th className="px-4 py-3 font-medium text-gray-400" scope="col">Film</th>
                <th className="px-4 py-3 font-medium text-gray-400" scope="col">Status</th>
                <th className="px-4 py-3 font-medium text-gray-400" scope="col">Total raised</th>
                <th className="px-4 py-3 font-medium text-gray-400" scope="col">Investors</th>
                <th className="px-4 py-3 font-medium text-gray-400" scope="col">Last donation</th>
                <th className="px-4 py-3 font-medium text-gray-400" scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {films.map((f) => (
                <Fragment key={f.filmId}>
                  <tr
                    key={f.filmId}
                    className="border-b border-white/5 hover:bg-white/[0.03]"
                  >
                    <td className="px-4 py-3">
                      <span className="font-medium text-white">{f.title}</span>
                      <span className="ml-2 text-gray-500">{f.slug}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{f.status}</td>
                    <td className="px-4 py-3 font-medium text-white">{formatUsd(f.totalRaised)}</td>
                    <td className="px-4 py-3 text-gray-300">{f.investorsCount}</td>
                    <td className="px-4 py-3 text-gray-400">
                      {f.lastDonationAt ? formatDate(f.lastDonationAt) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => toggleExpand(f.filmId)}
                          className="text-admin-accent hover:underline focus:outline-none focus:ring-2 focus:ring-admin-accent/50"
                          aria-expanded={expandedId === f.filmId}
                          aria-label={expandedId === f.filmId ? 'Collapse donations' : 'Expand donations'}
                        >
                          {expandedId === f.filmId ? 'Hide donations' : 'Show donations'}
                        </button>
                        <Link
                          to={`/film-pages/${f.filmId}`}
                          className="text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-admin-accent/50"
                        >
                          Edit page
                        </Link>
                        {WEB_ORIGIN && (
                          <a
                            href={`${WEB_ORIGIN}/films/${f.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-white"
                          >
                            View on site
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                  {expandedId === f.filmId && (
                    <tr className="border-b border-white/10 bg-admin-bg/60">
                      <td colSpan={6} className="px-4 py-3">
                        {loadingDonations[f.filmId] ? (
                          <p className="text-xs text-gray-500">Loading donations…</p>
                        ) : (donationsByFilmId[f.filmId]?.length ?? 0) === 0 ? (
                          <p className="text-xs text-gray-500">No donations.</p>
                        ) : (
                          <table className="w-full text-xs" role="table">
                            <thead>
                              <tr className="text-gray-500">
                                <th className="pb-1 pr-4 text-left">Amount</th>
                                <th className="pb-1 pr-4 text-left">Status</th>
                                <th className="pb-1 pr-4 text-left">Date</th>
                                <th className="pb-1 text-left">Donor (email)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {donationsByFilmId[f.filmId]?.map((d) => (
                                <tr key={d.id} className="text-gray-400">
                                  <td className="py-1 pr-4 font-medium text-white">{formatUsd(d.amount)}</td>
                                  <td className="py-1 pr-4">{d.status}</td>
                                  <td className="py-1 pr-4">{formatDate(d.createdAt)}</td>
                                  <td className="py-1">{d.userEmail ?? d.userId}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
          <span>
            Page {page} of {totalPages} ({total} total)
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded border border-white/10 px-2 py-1 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded border border-white/10 px-2 py-1 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </>
  );
}
