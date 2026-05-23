'use client';

import Link from 'next/link';
import type { Contribution } from '@/lib/contributions-api';
import { ContributionChangeCard } from '@/components/contributions/ContributionChangeCard';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'pending') {
    return <span className="inline-flex rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-medium text-amber-400">Pending</span>;
  }
  if (status === 'approved') {
    return <span className="inline-flex rounded-full bg-green-500/20 px-2.5 py-0.5 text-xs font-medium text-green-400">Approved</span>;
  }
  if (status === 'rejected') {
    return <span className="inline-flex rounded-full bg-red-500/20 px-2.5 py-0.5 text-xs font-medium text-red-400">Rejected</span>;
  }
  return null;
}

export function ContributionsView({ contributions }: { contributions: Contribution[] }) {
  if (contributions.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-screenriot-bg-card p-8 text-center">
        <p className="text-screenriot-muted">No contributions yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {contributions.map((item) => (
        <div key={item.id} className="rounded-xl border border-white/10 bg-screenriot-bg-card p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-white/10 pb-4">
            <div>
              <p className="text-sm text-screenriot-muted">{formatDate(item.createdAt)}</p>
              <h2 className="mt-1 text-lg font-semibold text-white">
                <Link href={`/films/${item.film.slug}`} className="hover:underline">
                  {item.film.title}
                </Link>
              </h2>
              <p className="mt-1 text-xs font-mono text-gray-500">#{item.number}</p>
            </div>
            <div>
              <StatusBadge status={item.status} />
            </div>
          </div>
          
          <ContributionChangeCard
            changes={item.changes}
            comment={item.comment}
            adminComment={item.adminComment}
            status={item.status}
          />
        </div>
      ))}
    </div>
  );
}
