import { useState, Fragment } from 'react';
import { useContributions } from '@/hooks/useContributions';
import type { AdminContribution } from '@/types/contributions';
import { ContributionRedline } from '@/components/contributions/ContributionRedline';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Contributions() {
  const {
    contributions,
    total,
    page,
    totalPages,
    loading,
    error,
    status,
    search,
    setPage,
    setStatus,
    setSearch,
    handleApprove,
    handleReject,
  } = useContributions();

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rejectComment, setRejectComment] = useState('');
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  function toggleExpand(id: string) {
    setExpandedId(expandedId === id ? null : id);
    setRejectingId(null);
    setRejectComment('');
  }

  function onApprove(c: AdminContribution) {
    if (window.confirm(`Approve changes for "${c.film.title}"?`)) {
      handleApprove(c.id);
    }
  }

  function onRejectSubmit(c: AdminContribution) {
    if (!rejectComment.trim()) {
      alert('Please provide a reason for rejection.');
      return;
    }
    handleReject(c.id, rejectComment);
    setRejectingId(null);
    setRejectComment('');
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-white">Contributions (Change Requests)</h1>
      <p className="mt-1 text-sm text-gray-500">
        Review changes proposed by filmmakers to published film pages.
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
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="rounded-md border border-white/10 bg-admin-bg px-2 py-1.5 text-sm text-white focus:border-admin-accent/60 focus:outline-none focus:ring-1 focus:ring-admin-accent/30"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 text-sm text-gray-400">
          Search
          <input
            type="text"
            placeholder="Film, email, or # ID..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="rounded-md border border-white/10 bg-admin-bg px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:border-admin-accent/60 focus:outline-none focus:ring-1 focus:ring-admin-accent/30"
          />
        </label>
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-gray-400">Loading…</p>
      ) : contributions.length === 0 ? (
        <p className="mt-6 text-sm text-gray-400">No contributions found.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full min-w-[600px] text-left text-sm" role="table">
            <thead>
              <tr className="border-b border-white/10 bg-admin-sidebar/50">
                <th className="px-4 py-3 font-medium text-gray-400">Number</th>
                <th className="px-4 py-3 font-medium text-gray-400">Film</th>
                <th className="px-4 py-3 font-medium text-gray-400">Filmmaker</th>
                <th className="px-4 py-3 font-medium text-gray-400">Status</th>
                <th className="px-4 py-3 font-medium text-gray-400">Date</th>
                <th className="px-4 py-3 font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {contributions.map((c) => (
                <Fragment key={c.id}>
                  <tr className="border-b border-white/5 hover:bg-white/[0.03]">
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">#{c.number}</td>
                    <td className="px-4 py-3 font-medium text-white">{c.film.title}</td>
                    <td className="px-4 py-3 text-gray-300">{c.user.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          c.status === 'approved'
                            ? 'bg-green-500/20 text-green-400'
                            : c.status === 'rejected'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{formatDate(c.createdAt)}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => toggleExpand(c.id)}
                        className="text-admin-accent hover:underline"
                      >
                        {expandedId === c.id ? 'Hide details' : 'Review'}
                      </button>
                    </td>
                  </tr>
                  {expandedId === c.id && (
                    <tr className="border-b border-white/10 bg-admin-bg/60">
                      <td colSpan={6} className="p-4">
                        <div className="grid gap-6 lg:grid-cols-2">
                          <div>
                            <h3 className="font-semibold text-white">Redline preview</h3>
                            <div className="mt-3">
                              <ContributionRedline changes={c.changes} comment={c.comment} />
                            </div>
                            {c.adminComment && (
                              <div className="mt-4 rounded bg-red-500/10 p-3">
                                <p className="text-xs font-medium text-red-400">Moderator comment:</p>
                                <p className="mt-1 text-sm text-red-300">{c.adminComment}</p>
                              </div>
                            )}
                          </div>
                          
                          {c.status === 'pending' && (
                            <div className="rounded-lg border border-white/10 bg-admin-card p-4">
                              <h3 className="font-semibold text-white">Actions</h3>
                              {rejectingId === c.id ? (
                                <div className="mt-3 space-y-3">
                                  <label className="block text-sm text-gray-400">
                                    Reason for rejection (sent to filmmaker)
                                    <textarea
                                      className="mt-1 block w-full rounded border border-white/10 bg-admin-bg p-2 text-white"
                                      rows={3}
                                      value={rejectComment}
                                      onChange={(e) => setRejectComment(e.target.value)}
                                    />
                                  </label>
                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      onClick={() => onRejectSubmit(c)}
                                      className="rounded bg-red-500/20 px-3 py-1.5 text-sm font-medium text-red-400 hover:bg-red-500/30"
                                    >
                                      Confirm Reject
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setRejectingId(null)}
                                      className="rounded bg-white/10 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/20"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="mt-4 flex gap-3">
                                  <button
                                    type="button"
                                    onClick={() => onApprove(c)}
                                    className="rounded bg-green-500/20 px-4 py-2 text-sm font-medium text-green-400 hover:bg-green-500/30"
                                  >
                                    Approve & Apply
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setRejectingId(c.id)}
                                    className="rounded border border-red-500/30 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10"
                                  >
                                    Reject...
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
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
