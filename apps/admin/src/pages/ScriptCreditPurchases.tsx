import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useScriptCreditPurchases } from '@/hooks/useScriptCreditPurchases';
import { Pagination } from '@/components/ui/Pagination';

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

export default function ScriptCreditPurchases() {
  const {
    purchases,
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
  } = useScriptCreditPurchases();

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
      if (res.credited) {
        setFulfillMessage(
          `Applied ${res.creditsAdded} credits to ${res.userEmail ?? 'user'}. New balance: ${res.scriptCredits}.`,
        );
      } else {
        setFulfillMessage(
          `Already recorded for ${res.userEmail ?? 'user'}. Current balance: ${res.scriptCredits} credits.`,
        );
      }
      setSessionId('');
    } catch (err) {
      setFulfillError(err instanceof Error ? err.message : 'Failed to apply credits');
    } finally {
      setFulfillLoading(false);
    }
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-white">Script credit purchases</h1>
      <p className="mt-1 text-sm text-gray-500">
        Fulfilled credit packs ($5 → 10 credits). Use Stripe Checkout session id to apply credits if
        payment succeeded but the user balance did not update.
      </p>

      <section
        className="mt-6 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4"
        aria-labelledby="fulfill-heading"
      >
        <h2 id="fulfill-heading" className="text-sm font-semibold text-amber-200">
          Apply credits from Stripe
        </h2>
        <p className="mt-1 text-xs text-gray-400">
          From Payments table: copy the <code className="text-amber-100">pi_…</code> id in the Description
          column (Payment Intent), or open the payment and use <code className="text-amber-100">cs_…</code>{' '}
          (Checkout session). Do not use <code className="text-amber-100">pm_…</code> (card).
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
            {fulfillLoading ? 'Applying…' : 'Apply credits'}
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
      ) : purchases.length === 0 ? (
        <p className="mt-6 text-sm text-gray-400">
          No fulfilled purchases yet. After webhook or manual apply, rows appear here.
        </p>
      ) : (
        <>
          <p className="mt-4 text-xs text-gray-500">{total} purchase(s) total</p>
          <div className="mt-2 overflow-x-auto rounded-lg border border-white/10">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-admin-sidebar/50">
                  <th className="px-4 py-3 font-medium text-gray-400">Date</th>
                  <th className="px-4 py-3 font-medium text-gray-400">Email</th>
                  <th className="px-4 py-3 font-medium text-gray-400">Credits</th>
                  <th className="px-4 py-3 font-medium text-gray-400">Paid</th>
                  <th className="px-4 py-3 font-medium text-gray-400">Stripe session</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((row) => (
                  <tr key={row.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-gray-300">{formatDate(row.createdAt)}</td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/users/${row.userId}`}
                        className="text-admin-accent hover:underline"
                      >
                        {row.userEmail}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-white">+{row.credits}</td>
                    <td className="px-4 py-3 text-gray-400">{formatUsd(row.amountUsd)}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{row.stripeSessionId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination page={page} totalPages={totalPages} loading={loading} onPageChange={setPage} />
        </>
      )}
    </>
  );
}
