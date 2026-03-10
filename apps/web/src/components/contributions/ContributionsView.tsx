'use client';

import Link from 'next/link';
import type { Contribution } from '@/lib/contributions-api';

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
          
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-300">Proposed Changes</h3>
            <div className="mt-2 space-y-3">
              {Object.entries(item.changes).map(([key, value]) => (
                <div key={key} className="rounded-lg bg-white/5 p-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{key}</p>
                  <p className="text-sm text-white whitespace-pre-wrap">
                    {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                  </p>
                </div>
              ))}
            </div>

            {item.comment && (
              <div className="mt-4">
                <h3 className="text-xs font-medium text-gray-400">Your Comment</h3>
                <p className="mt-1 text-sm text-gray-300 italic">&quot;{item.comment}&quot;</p>
              </div>
            )}

            {item.status === 'rejected' && item.adminComment && (
              <div className="mt-4 rounded-lg bg-red-500/10 p-3">
                <h3 className="text-xs font-medium text-red-400 uppercase tracking-wider mb-1">Moderator Note</h3>
                <p className="text-sm text-red-300">{item.adminComment}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
