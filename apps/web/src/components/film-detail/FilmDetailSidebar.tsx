import type { FilmDetailSidebarMock, InvestmentTier } from '@/markup/film-detail';
import { FilmDetailInvestCta } from './FilmDetailInvestCta';
import { FilmDetailInvestBlock } from './FilmDetailInvestBlock';

function formatPledged(value: number): string {
  if (value >= 1_000_000) return `$${value / 1_000_000}M`;
  if (value >= 1_000) return `$${value / 1_000}K`;
  return `$${value}`;
}

interface FilmDetailSidebarProps {
  data: FilmDetailSidebarMock;
  /** When present, tier cards show Invest buttons and redirect to Stripe Checkout. */
  filmId?: string;
  slug?: string;
}

export function FilmDetailSidebar({ data, filmId, slug }: FilmDetailSidebarProps) {
  const percent = Math.min(100, Math.round((data.pledged / data.goal) * 100));

  return (
    <aside
      className="w-full shrink-0 lg:max-w-[478px]"
      aria-labelledby="sidebar-funding-heading"
    >
      <div className="sticky top-6 space-y-6 rounded-xl border border-white/10 bg-screenriot-bg-card p-6">
        <div>
          <h2 id="sidebar-funding-heading" className="sr-only">
            Funding and investment
          </h2>
          <p className="text-2xl font-semibold text-sky-400">
            {formatPledged(data.pledged)}
            <span className="ml-1 text-base font-normal text-gray-400">
              pledged of {formatPledged(data.goal)} goal
            </span>
          </p>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-sky-500 transition-[width] duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-400">
            <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
              </svg>
              {data.investorsCount} investors
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              {data.daysLeft} days to go
            </span>
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-400">
            <svg className="h-4 w-4 text-amber-400" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {data.averageScore} average score • {data.votesCount.toLocaleString()} votes
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
            </svg>
            {data.trendingText}
          </p>
        </div>

        <div className="space-y-3">
          {filmId && slug ? (
            <FilmDetailInvestCta filmId={filmId} slug={slug} />
          ) : (
            <a
              href="#invest"
              className="flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-screenriot-bg"
            >
              Invest in This Film
            </a>
          )}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Add to watchlist"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
              </svg>
              Watchlist
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Share"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c-18.048-.946-32.16 12.35-32.16 26.016 0 1.542.198 3.05.574 4.486m0-2.186c8.683 0 16.342 2.118 23.2 6.841a2.25 2.25 0 0 0 2.586 0c5.962-3.678 13.517-4.841 23.2-6.841m-23.2 26.016c8.683 0 16.342-2.118 23.2-6.841a2.25 2.25 0 0 0 2.586 0c5.962 3.678 13.517 4.841 23.2 6.841" />
              </svg>
              Share
            </button>
          </div>
        </div>

        <div id="invest">
          <h3 className="text-base font-semibold text-white">Investment Tiers</h3>
          {filmId && slug ? (
            <FilmDetailInvestBlock
              filmId={filmId}
              slug={slug}
              tiers={data.tiers}
            />
          ) : (
            <ul className="mt-3 space-y-3">
              {data.tiers.map((tier) => (
                <TierCard key={tier.id} tier={tier} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </aside>
  );
}

function TierCard({ tier }: { tier: InvestmentTier }) {
  return (
    <li className="rounded-lg border border-white/10 bg-white/[0.02] p-4 transition-colors hover:border-sky-500/30">
      <p className="font-semibold text-white">
        ${tier.amount.toLocaleString()} - {tier.name}
      </p>
      <ul className="mt-2 space-y-1 text-sm text-gray-400">
        {tier.benefits.map((b) => (
          <li key={b}>• {b}</li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-gray-500">{tier.investorsCount} investors</p>
    </li>
  );
}
