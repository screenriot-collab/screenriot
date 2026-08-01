import { useNavigate, useParams } from 'react-router-dom';
import { useFilmDetail } from '@/hooks/useFilmDetail';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { StatusPill, statusVariant } from '@/components/ui/StatusPill';
import { ExternalLinkIcon } from '@/components/ui/icons/ExternalLinkIcon';
import { FileRow } from '@/components/ui/FileRow';
import { StepCard } from '@/components/films/StepCard';
import type { Step3Data, Step4Data } from '@/types/films';

export default function FilmDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    detail,
    loading,
    error,
    actionLoading,
    comments,
    reviewStatus,
    updateComment,
    applyAction,
    requestChanges,
    resetReviewStatus,
  } = useFilmDetail(id);
  const { requestConfirm, dialog } = useConfirmDialog();

  function confirmResetReviewStatus() {
    requestConfirm({
      title: 'Reset review status',
      message: 'Clear the review flag and set it back to "No action needed"?',
      confirmLabel: 'Reset',
      onConfirm: () => void resetReviewStatus(),
    });
  }

  const film = detail?.film;
  const step3: Step3Data = film?.step3 ?? {};
  const step3Cast = Array.isArray(step3.cast) ? step3.cast : [];
  const step3Crew = Array.isArray(step3.crew) ? step3.crew : [];
  const step4: Step4Data = film?.step4 ?? {};
  const step4Breakdown = Array.isArray(step4.breakdown) ? step4.breakdown : [];

  return (
    <>
      <button
        type="button"
        onClick={() => navigate('/films')}
        className="mb-4 text-sm text-gray-400 hover:text-white"
      >
        ← Back to Applications
      </button>

      <h1 className="text-2xl font-bold text-white">Film detail</h1>

      {error && (
        <p className="mt-3 text-sm text-red-400" role="alert">{error}</p>
      )}

      {loading && <p className="mt-3 text-sm text-gray-400">Loading…</p>}

      {!loading && !detail && !error && (
        <p className="mt-3 text-sm text-gray-400">Film not found.</p>
      )}

      {film && detail && (
        <div className="mt-4 space-y-5 rounded-xl border border-white/[0.06] bg-admin-sidebar p-5">
          {/* Header */}
          <div className="flex flex-col gap-3 border-b border-white/[0.06] pb-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold text-white">{film.title}</h2>
              <p className="mt-0.5 text-xs text-gray-500">
                /{film.slug}
                <span className="mx-1.5 text-gray-700">·</span>
                {film.filmmaker?.email ?? 'unknown filmmaker'}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <StatusPill label={film.status} variant={statusVariant(film.status)} />
              {film.submissionFeePaid && <StatusPill label="Fee paid" variant="ok" />}
              {['approved', 'fundraising', 'funded', 'closed'].includes(film.status) && (
                <button
                  type="button"
                  onClick={() => navigate(`/film-pages/${film.id}`)}
                  className="rounded bg-admin-accent/15 px-3 py-1 text-sm font-medium text-admin-accent transition-colors hover:bg-admin-accent/25"
                  aria-label="Manage film page"
                >
                  Manage film page
                  <ExternalLinkIcon />
                </button>
              )}
            </div>
          </div>

          {/* Review status */}
          <div className="max-w-xs">
            <p className="mb-1 text-xs font-medium text-gray-400">Review status</p>
            {reviewStatus === 'no_action' ? (
              <StatusPill label="No action needed" variant="neutral" />
            ) : (
              <div className="flex items-center gap-4">
                <StatusPill
                  label={reviewStatus === 'changes_submitted' ? 'Changes submitted' : 'Changes Requested'}
                  variant={reviewStatus === 'changes_submitted' ? 'info' : 'warn'}
                />
                <button
                  type="button"
                  onClick={confirmResetReviewStatus}
                  disabled={actionLoading}
                  className="text-xs font-medium text-admin-accent underline-offset-2 hover:underline disabled:opacity-50"
                  aria-label="Reset review status to No action"
                >
                  Reset to No action
                </button>
              </div>
            )}
          </div>

          {/* Step 1 — Project details */}
          <StepCard step={1} title="Project details" comment={comments.step1} onCommentChange={(v) => updateComment('step1', v)} disabled={actionLoading}>
            <div className="space-y-2 text-sm text-gray-300">
              <div>
                <span className="text-gray-500">Logline: </span>
                <span>{film.logline ?? '—'}</span>
              </div>
              <div>
                <span className="text-gray-500">Synopsis: </span>
                <span>{film.synopsis ?? '—'}</span>
              </div>
              <div className="grid gap-x-4 gap-y-1 sm:grid-cols-3">
                <div><span className="text-gray-500">Genre: </span><span>{film.genre ?? '—'}</span></div>
                <div><span className="text-gray-500">Runtime: </span><span>{film.runtime ?? '—'}</span></div>
                <div><span className="text-gray-500">Rating: </span><span>{film.rating ?? '—'}</span></div>
              </div>
              <div>
                <span className="text-gray-500">Director: </span>
                <span>{film.directorName ?? '—'}</span>
              </div>
            </div>
          </StepCard>

          {/* Step 2 — Script & Materials */}
          <StepCard step={2} title="Script & materials" comment={comments.step2} onCommentChange={(v) => updateComment('step2', v)} disabled={actionLoading}>
            <ul className="space-y-1.5">
              <FileRow
                label="Screenplay"
                file={detail.files.screenplay}
                missingHint="Required: PDF format, maximum 50MB"
              />
              <FileRow
                label="Poster"
                file={detail.files.poster}
                missingHint="JPG, PNG, or WEBP, maximum 10MB"
              />
              <FileRow
                label="Teaser"
                file={detail.files.teaser}
                missingHint="MP4 format, maximum 100MB"
              />
            </ul>
          </StepCard>

          {/* Step 3 — Cast & Crew */}
          <StepCard step={3} title="Cast & Crew" comment={comments.step3} onCommentChange={(v) => updateComment('step3', v)} disabled={actionLoading}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-1.5 text-xs font-medium text-gray-500">Cast</p>
                <ul className="space-y-1 text-sm">
                  {step3Cast.length === 0 && <li className="text-gray-600">No cast provided.</li>}
                  {step3Cast.map((c, idx) => (
                    <li key={c.actorEmail ?? c.actorName ?? idx} className="text-gray-300">
                      <span>{c.actorName || '—'}</span>
                      <span className="text-gray-500">
                        {' '}
                        · {c.character || c.role || '—'}
                        {c.tier ? ` (${c.tier})` : ''}
                      </span>
                      <span className="text-gray-600"> ({c.actorEmail || '—'})</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-1.5 text-xs font-medium text-gray-500">Crew</p>
                <ul className="space-y-1 text-sm">
                  {step3Crew.length === 0 && <li className="text-gray-600">No crew provided.</li>}
                  {step3Crew.map((c, idx) => (
                    <li key={c.email ?? idx} className="text-gray-300">
                      <span>{c.name || 'Name'}</span>{' '}
                      <span className="text-gray-500">{c.position || 'Position'}</span>{' '}
                      <span className="text-gray-600">({c.email || 'email not set'})</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-2">
              <p className="mb-1.5 text-xs font-medium text-gray-500">Wish list cast</p>
              <ul className="space-y-1 text-sm">
                {(!Array.isArray(step3.wishListCast) || step3.wishListCast.length === 0) &&
                  !(typeof step3.wishListCast === 'string' && step3.wishListCast.trim()) && (
                    <li className="text-gray-600">No wish list provided.</li>
                  )}
                {Array.isArray(step3.wishListCast) &&
                  step3.wishListCast.map((w, idx) => (
                    <li key={idx} className="text-gray-300">
                      <span>{w.actorName || '—'}</span>
                      <span className="text-gray-500">
                        {' '}
                        · {w.character || w.role || '—'}
                        {w.tier ? ` (${w.tier})` : ''}
                      </span>
                      {w.status === 'verified' && (
                        <span className="ml-1 text-green-400">[Verified]</span>
                      )}
                    </li>
                  ))}
                {typeof step3.wishListCast === 'string' && step3.wishListCast.trim() && (
                  <li className="text-gray-300">{step3.wishListCast}</li>
                )}
              </ul>
            </div>
          </StepCard>

          {/* Step 4 — Budget & Timeline */}
          <StepCard step={4} title="Budget & Timeline" comment={comments.step4} onCommentChange={(v) => updateComment('step4', v)} disabled={actionLoading}>
            <div className="text-sm text-gray-300">
              <div>
                <span className="text-gray-500">Total budget: </span>
                <span className="font-medium">{step4.totalBudget ?? '—'}</span>
              </div>
              <div className="mt-3">
                <p className="mb-1.5 text-xs font-medium text-gray-500">Breakdown</p>
                <ul className="space-y-1">
                  {step4Breakdown.length === 0 && <li className="text-gray-600">No breakdown provided.</li>}
                  {step4Breakdown.map((b, idx) => (
                    <li key={b.id ?? idx} className="flex items-center justify-between rounded-md bg-white/[0.03] px-3 py-1.5">
                      <span className="text-gray-300">{b.label ?? 'Category'}</span>
                      <span className="text-xs text-gray-500">{b.percent ?? 0}%</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-3 grid gap-x-4 gap-y-1.5 sm:grid-cols-2">
                <div><span className="text-gray-500">Pre-production: </span><span>{step4.timeline?.preProductionStart ?? '—'}</span></div>
                <div><span className="text-gray-500">Principal photography: </span><span>{step4.timeline?.principalPhotography ?? '—'}</span></div>
                <div><span className="text-gray-500">Post-production: </span><span>{step4.timeline?.postProduction ?? '—'}</span></div>
                <div><span className="text-gray-500">Expected release: </span><span>{step4.timeline?.expectedRelease ?? '—'}</span></div>
              </div>
              <div className="mt-1.5">
                <span className="text-gray-500">Campaign duration (days): </span>
                <span>{step4.campaignDuration ?? '—'}</span>
              </div>
            </div>
          </StepCard>

          {/* Step 5 — Legal & Payment */}
          <StepCard step={5} title="Legal & Payment" comment={comments.step5} onCommentChange={(v) => updateComment('step5', v)} disabled={actionLoading}>
            <ul className="space-y-1.5">
              <FileRow
                label="Chain of Title"
                file={detail.files.chainOfTitle}
                missingHint="Required: PDF format, maximum 10MB"
              />
            </ul>
            <div className="mt-3 flex items-center gap-2 text-sm">
              <span className="text-gray-500">Submission fee:</span>
              <StatusPill label={film.submissionFeePaid ? 'Paid' : 'Not paid'} variant={film.submissionFeePaid ? 'ok' : 'neutral'} />
            </div>
          </StepCard>

          {/* Actions */}
          <div className="flex flex-wrap gap-2.5 border-t border-white/[0.06] pt-5">
            {(() => {
              const alreadyApproved = ['approved', 'fundraising', 'funded', 'closed'].includes(film.status);
              const feeUnpaid = !film.submissionFeePaid;
              const disabledReason = alreadyApproved
                ? 'Already approved'
                : feeUnpaid
                  ? 'Cannot approve: submission fee has not been paid'
                  : undefined;
              return (
                <button
                  type="button"
                  onClick={() => void applyAction({ status: 'approved' })}
                  disabled={actionLoading || alreadyApproved || feeUnpaid}
                  title={disabledReason}
                  className="rounded-md bg-emerald-500/90 px-5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={disabledReason ?? 'Approve film'}
                >
                  {actionLoading ? 'Saving…' : alreadyApproved ? 'Approved' : 'Approve'}
                </button>
              );
            })()}
            <button
              type="button"
              onClick={() => void applyAction({ status: 'rejected' })}
              disabled={actionLoading}
              className="rounded-md bg-red-500/90 px-5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-red-500 disabled:opacity-50"
              aria-label="Reject film"
            >
              {actionLoading ? 'Saving…' : 'Reject'}
            </button>
            <button
              type="button"
              onClick={() => void requestChanges()}
              disabled={actionLoading}
              title="Add a comment on at least one step, then request changes"
              className="rounded-md bg-amber-500/20 px-5 py-2 text-sm font-medium text-amber-300 shadow-sm transition-colors hover:bg-amber-500/30 disabled:opacity-50"
              aria-label={reviewStatus === 'action_required' ? 'Update requested changes' : 'Request changes'}
            >
              {actionLoading ? 'Saving…' : reviewStatus === 'action_required' ? 'Update request' : 'Request changes'}
            </button>
          </div>
        </div>
      )}
      {dialog}
    </>
  );
}
