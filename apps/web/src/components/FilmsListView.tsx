'use client';

import Link from 'next/link';
import {
  FILMS_PAGE,
  FILM_VERIFICATION_STATUS,
  FILM_PAYMENT_STATUS,
  REVIEW_STATUS,
  type FilmListItem,
} from '@/markup/films';

interface FilmsListViewProps {
  films: FilmListItem[];
  /** Called when user confirms delete of a draft project. TODO: wire to API DELETE /films/:id */
  onDelete?: (filmId: string) => void;
}

function StatusBadge({
  status,
  label,
  variant,
}: {
  status: string;
  label: string;
  variant: 'neutral' | 'success' | 'warning' | 'error';
}) {
  const variantClasses = {
    neutral: 'bg-white/10 text-screenriot-muted',
    success: 'bg-green-500/20 text-green-400',
    warning: 'bg-amber-500/20 text-amber-400',
    error: 'bg-red-500/20 text-red-400',
  };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${variantClasses[variant]}`}
      title={status}
    >
      {label}
    </span>
  );
}

function verificationVariant(
  status: keyof typeof FILM_VERIFICATION_STATUS
): 'neutral' | 'success' | 'warning' | 'error' {
  switch (status) {
    case 'approved':
    case 'funded':
    case 'closed':
      return 'success';
    case 'rejected':
      return 'error';
    case 'pending_approval':
    case 'fundraising':
      return 'warning';
    default:
      return 'neutral';
  }
}

function isDraft(film: FilmListItem): boolean {
  return film.verificationStatus === 'draft';
}

function isApprovedAndPublished(film: FilmListItem): boolean {
  const allowedStatuses = ['approved', 'fundraising', 'funded', 'closed'];
  return allowedStatuses.includes(film.verificationStatus) && film.pagePublished;
}

function IconEdit({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  );
}

function IconExternal({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" x2="21" y1="14" y2="3" />
    </svg>
  );
}

export function FilmsListView({ films, onDelete }: FilmsListViewProps) {
  if (films.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-screenriot-bg-card p-8 text-center">
        <p className="text-screenriot-muted">{FILMS_PAGE.emptyMessage}</p>
        <Link
          href="/dashboard/submit-project"
          className="mt-4 inline-block rounded-lg bg-screenriot-accent-blue px-4 py-2 text-sm font-medium text-white hover:bg-screenriot-accent-blue/90 focus:outline-none focus:ring-2 focus:ring-screenriot-accent-blue"
        >
          Submit Project
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-screenriot-bg-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]" role="table" aria-label={FILMS_PAGE.title}>
          <thead>
            <tr className="border-b border-white/10 text-left text-sm text-screenriot-muted">
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Created by</th>
              <th className="px-4 py-3 font-medium">Verification status</th>
              <th className="px-4 py-3 font-medium">Payment status</th>
              <th className="px-4 py-3 font-medium">{FILMS_PAGE.reviewColumn}</th>
              <th className="px-4 py-3 font-medium" scope="col">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {films.map((film) => (
              <tr
                key={film.id}
                className="border-b border-white/5 transition hover:bg-white/5 last:border-b-0"
              >
                <td className="px-4 py-3 font-medium text-white">{film.title}</td>
                <td className="px-4 py-3 text-sm text-screenriot-muted">{film.createdBy}</td>
                <td className="px-4 py-3">
                  <StatusBadge
                    status={film.verificationStatus}
                    label={FILM_VERIFICATION_STATUS[film.verificationStatus]}
                    variant={verificationVariant(film.verificationStatus)}
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge
                      status={film.paymentStatus}
                      label={FILM_PAYMENT_STATUS[film.paymentStatus]}
                      variant={film.paymentStatus === 'paid' ? 'success' : 'warning'}
                    />
                    {film.paymentStatus === 'unpaid' && (
                      <Link
                        href={`/dashboard/films/pay?film=${film.id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-screenriot-accent-blue/20 px-2.5 py-1 text-xs font-medium text-screenriot-accent-blue hover:bg-screenriot-accent-blue/30 focus:outline-none focus:ring-2 focus:ring-screenriot-accent-blue focus:ring-offset-2 focus:ring-offset-screenriot-bg"
                        aria-label={`Pay submission fee for ${film.title}`}
                      >
                        {FILMS_PAGE.payAction}
                      </Link>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {film.reviewStatus ? (
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        film.reviewStatus === 'action_required'
                          ? 'bg-amber-500/20 text-amber-400'
                          : film.reviewStatus === 'changes_submitted'
                            ? 'bg-screenriot-accent-blue/20 text-screenriot-accent-blue'
                            : 'bg-white/10 text-screenriot-muted'
                      }`}
                    >
                      {REVIEW_STATUS[film.reviewStatus]}
                    </span>
                  ) : (
                    <span className="text-xs text-screenriot-muted">{FILMS_PAGE.noReview}</span>
                  )}
                </td>
        <td className="px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            {isApprovedAndPublished(film) ? (
              <>
                <Link
                  href={`/dashboard/films/${film.id}/preview`}
                  className="inline-flex items-center justify-center gap-1 rounded-lg border border-white/20 bg-white/5 px-2 py-1.5 text-xs font-medium text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-screenriot-accent-blue"
                  aria-label={`Edit published page for ${film.title}`}
                  title="Edit published page"
                >
                  <IconEdit className="h-3.5 w-3.5" aria-hidden />
                  Edit page
                </Link>
                <Link
                  href={`/films/${film.slug}`}
                  className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/5 p-1.5 text-screenriot-accent-blue hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-screenriot-accent-blue focus:ring-offset-2 focus:ring-offset-screenriot-bg"
                  aria-label={`${FILMS_PAGE.openProjectAction}: ${film.title}`}
                  title={FILMS_PAGE.openProjectAction}
                >
                  <IconExternal className="h-4 w-4" />
                </Link>
              </>
            ) : film.verificationStatus === 'approved' || film.verificationStatus === 'fundraising' || film.verificationStatus === 'funded' || film.verificationStatus === 'closed' ? (
              <Link
                href={`/films/${film.slug}`}
                className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/5 p-1.5 text-screenriot-accent-blue hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-screenriot-accent-blue focus:ring-offset-2 focus:ring-offset-screenriot-bg"
                aria-label={`${FILMS_PAGE.openProjectAction}: ${film.title}`}
                title={FILMS_PAGE.openProjectAction}
              >
                <IconExternal className="h-4 w-4" />
              </Link>
            ) : (
                      <>
                        <Link
                          href={`/dashboard/submit-project?film=${film.id}`}
                          className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/5 p-1.5 text-screenriot-accent-blue hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-screenriot-accent-blue focus:ring-offset-2 focus:ring-offset-screenriot-bg"
                          aria-label={`${FILMS_PAGE.editAction}: ${film.title}`}
                          title={FILMS_PAGE.editAction}
                        >
                          <IconEdit className="h-4 w-4" />
                        </Link>
                        {isDraft(film) && (
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`${FILMS_PAGE.deleteConfirmTitle}\n\n${FILMS_PAGE.deleteConfirmMessage}`)) {
                                onDelete?.(film.id);
                              }
                            }}
                            className="inline-flex items-center justify-center rounded-lg border border-red-500/40 bg-red-500/10 p-1.5 text-red-400 hover:bg-red-500/20 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-screenriot-bg"
                            aria-label={`${FILMS_PAGE.deleteAction} ${film.title}`}
                            title={FILMS_PAGE.deleteAction}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                              <path d="M3 6h18" />
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                              <line x1="10" x2="10" y1="11" y2="17" />
                              <line x1="14" x2="14" y1="11" y2="17" />
                            </svg>
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
