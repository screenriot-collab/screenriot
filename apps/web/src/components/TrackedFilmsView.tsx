'use client';

import Link from 'next/link';
import { useMyDonations } from '@/hooks/useMyDonations';

function formatUsd(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function TrackedFilmsView() {
  const { donations, loading, error } = useMyDonations();

  if (loading) {
    return (
      <p className="text-sm text-screenriot-muted">Loading…</p>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-red-400" role="alert">{error}</p>
    );
  }

  if (donations.length === 0) {
    return (
      <p className="text-sm text-screenriot-muted">
        No films yet. Invest in a film from a film page to track them here.
      </p>
    );
  }

  return (
    <ul className="space-y-4" role="list">
      {donations.map((d) => (
        <li
          key={d.id}
          className="flex flex-col gap-2 rounded-lg border border-white/10 bg-screenriot-bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h2 className="font-semibold text-white">
              <Link
                href={`/films/${d.filmSlug}`}
                className="text-white hover:underline focus:outline-none focus:ring-2 focus:ring-screenriot-accent-blue focus:ring-offset-2 focus:ring-offset-screenriot-bg"
              >
                {d.filmTitle}
              </Link>
            </h2>
            <p className="mt-1 text-xs text-screenriot-muted">
              Invested {formatUsd(d.amount)} on {formatDate(d.createdAt)} · Status: {d.status}
            </p>
            <span className="mt-1 inline-block rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-screenriot-muted">
              {d.filmStatus}
            </span>
          </div>
          <Link
            href={`/films/${d.filmSlug}`}
            className="shrink-0 rounded-lg bg-screenriot-accent-blue/20 px-4 py-2 text-sm font-medium text-screenriot-accent-blue hover:bg-screenriot-accent-blue/30 focus:outline-none focus:ring-2 focus:ring-screenriot-accent-blue focus:ring-offset-2 focus:ring-offset-screenriot-bg"
          >
            View film
          </Link>
        </li>
      ))}
    </ul>
  );
}
