import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSubmissionFeePayments } from '@/hooks/useSubmissionFeePayments';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatUsd(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(n);
}

export default function SubmissionFeePayments() {
  const {
    payments,
    total,
    page,
    totalPages,
    loading,
    error,
    searchInput,
    setSearchInput,
    applySearch,
    setPage,
    fulfillSession,
  } = useSubmissionFeePayments();

  const [sessionId, setSessionId] = useState('');
  const [fulfillLoading, setFulfillLoading] = useState(false);
  const [fulfillMessage, setFulfillMessage] = useState<string | null>(null);
  const [fulfillError, setFulfillError] = useState<string | null>(null);

  async function handleFulfill(e: React.FormEvent) {
    e.preventDefault();
    const id = sessionId.trim();
    if (!id) return;
    setFulfillLoading(true);
    setFulfillMessage(null);
    setFulfillError(null);
    try {
      const res = await fulfillSession(id);
      if (res.applied) {
        setFulfillMessage(
          `Marked submission fee paid for "${res.filmTitle}" (${res.userEmail ?? 'filmmaker'}).`,
        );
      } else {
        setFulfillMessage(
          `Already recorded for "${res.filmTitle}" (${res.userEmail ?? 'filmmaker'}).`,
        );
      }
      setSessionId('');
    } catch (err) {
      setFulfillError(err instanceof Error ? err.message : 'Failed to apply payment');
    } finally {
      setFulfillLoading(false);
    }
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-white">Submission fee payments</h1>
      <p className="mt-1 text-sm text-gray-500">
        Film project submission fees ($300). Apply from Stripe if payment succeeded but the film
        was not marked paid.
      </p>

      <section
        className="mt-6 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4"
        aria-labelledby="fulfill-heading"
      >
        <h2 id="fulfill-heading" className="text-sm font-semibold text-amber-200">
          Mark fee paid from Stripe
        </h2>
        <p className="mt-1 text-xs text-gray-400">
          Use <code className="text-amber-100">pi_…</code> or <code className="text-amber-100">cs_…</code>{' '}
          from the Stripe Payments table.
        </p>
        <form onSubmit={(e) => void handleFulfill(e)} className="mt-3 flex flex-col gap-2 sm:flex-row">
          <label htmlFor="stripe-session-id" className="sr-only">
            Stripe Checkout session id
          </label>
          <input
            id="stripe-session-id"
            type="text"
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            placeholder="pi_… or cs_…"
            className="min-w-0 flex-1 rounded-md border border-white/10 bg-admin-bg px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-admin-accent/60 focus:outline-none focus:ring-1 focus:ring-admin-accent/30"
            autoComplete="off"
            spellCheck={false}
          />
          <button
            type="submit"
            disabled={fulfillLoading || !sessionId.trim()}
            className="shrink-0 rounded-md bg-admin-accent px-4 py-2 text-sm font-medium text-white hover:bg-admin-accent/90 disabled:opacity-50"
          >
            {fulfillLoading ? 'Applying…' : 'Mark paid'}
          </button>
        </form>
        {fulfillMessage ? (
          <p className="mt-2 text-sm text-emerald-400" role="status">
            {fulfillMessage}
          </p>
        ) : null}
        {fulfillError ? (
          <p className="mt-2 text-sm text-red-400" role="alert">
            {fulfillError}
          </p>
        ) : null}
      </section>

      {error ? (
        <p className="mt-4 rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm text-gray-400">
          Search by email
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                applySearch();
              }
            }}
            className="w-64 rounded-md border border-white/10 bg-admin-bg px-3 py-1.5 text-sm text-white focus:border-admin-accent/60 focus:outline-none focus:ring-1 focus:ring-admin-accent/30"
          />
        </label>
        <button
          type="button"
          onClick={applySearch}
          className="rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-white hover:bg-white/10"
        >
          Search
        </button>
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-gray-400">Loading…</p>
      ) : payments.length === 0 ? (
        <p className="mt-6 text-sm text-gray-400">
          No fulfilled payments yet. After webhook or manual apply, rows appear here.
        </p>
      ) : (
        <>
          <p className="mt-4 text-xs text-gray-500">{total} payment(s) total</p>
          <div className="mt-2 overflow-x-auto rounded-lg border border-white/10">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-admin-sidebar/50">
                  <th className="px-4 py-3 font-medium text-gray-400">Date</th>
                  <th className="px-4 py-3 font-medium text-gray-400">Film</th>
                  <th className="px-4 py-3 font-medium text-gray-400">Filmmaker</th>
                  <th className="px-4 py-3 font-medium text-gray-400">Paid</th>
                  <th className="px-4 py-3 font-medium text-gray-400">Stripe session</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((row) => (
                  <tr key={row.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-gray-300">{formatDate(row.createdAt)}</td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/films/${row.filmId}`}
                        className="text-admin-accent hover:underline"
                      >
                        {row.filmTitle}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/users/${row.userId}`}
                        className="text-admin-accent hover:underline"
                      >
                        {row.userEmail}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{formatUsd(row.amountUsd)}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{row.stripeSessionId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 ? (
            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-md border border-white/15 px-3 py-1 text-sm text-white disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-gray-400">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-md border border-white/15 px-3 py-1 text-sm text-white disabled:opacity-40"
              >
                Next
              </button>
            </div>
          ) : null}
        </>
      )}
    </>
  );
}
