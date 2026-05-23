'use client';

import Link from 'next/link';
import { useScriptCredits } from '@/hooks/useScriptCredits';
import { SCRIPT_CREDITS_BALANCE } from '@/markup/dashboard';

function BookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
      />
    </svg>
  );
}

export function ScriptCreditsBalance() {
  const { scriptCredits, loading, error } = useScriptCredits();

  const balanceLabel =
    loading ? '—' : error ? '—' : String(scriptCredits ?? 0);

  return (
    <section
      className="mb-6 rounded-xl border border-screenriot-accent-blue/25 bg-screenriot-accent-blue/5 p-4 sm:p-5"
      aria-labelledby="script-credits-balance-heading"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-screenriot-accent-blue/20 text-screenriot-accent-blue"
            aria-hidden
          >
            <BookIcon className="h-6 w-6" />
          </div>
          <div>
            <h2 id="script-credits-balance-heading" className="text-base font-semibold text-white">
              {SCRIPT_CREDITS_BALANCE.title}
            </h2>
            <p className="mt-0.5 text-sm text-screenriot-muted">{SCRIPT_CREDITS_BALANCE.description}</p>
          </div>
        </div>
        <div className="sm:text-right">
          <p className="text-xs font-medium uppercase tracking-wide text-screenriot-muted">
            {SCRIPT_CREDITS_BALANCE.balanceLabel}
          </p>
          <p className="text-2xl font-bold tabular-nums text-white" aria-live="polite">
            {balanceLabel}
            {!loading && !error ? (
              <span className="ml-1 text-base font-normal text-screenriot-muted">
                {scriptCredits === 1 ? 'credit' : 'credits'}
              </span>
            ) : null}
          </p>
          {error ? (
            <p className="mt-1 text-xs text-red-400" role="alert">
              {error}
            </p>
          ) : (
            <p className="mt-1 text-xs text-screenriot-muted">{SCRIPT_CREDITS_BALANCE.hint}</p>
          )}
        </div>
      </div>
      <p className="mt-3 border-t border-white/10 pt-3 text-xs text-screenriot-muted">
        {SCRIPT_CREDITS_BALANCE.footer}{' '}
        <Link href="/films" className="text-screenriot-accent-blue hover:underline">
          Browse films
        </Link>{' '}
        to unlock screenplay pages.
      </p>
    </section>
  );
}
