import { useNavigate, useParams } from 'react-router-dom';
import { useFilmDetail } from '@/hooks/useFilmDetail';
import { StatusPill, statusVariant } from '@/components/ui/StatusPill';
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
    setReviewStatus,
    updateComment,
    applyAction,
  } = useFilmDetail(id);

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
                  aria-label="Edit film page"
                >
                  Edit film page
                </button>
              )}
            </div>
          </div>

          {/* Review selector */}
          <div className="max-w-xs">
            <label className="mb-1 block text-xs font-medium text-gray-400" htmlFor="review-select">
              Review status
            </label>
            {reviewStatus === 'changes_submitted' ? (
              <div className="flex items-center gap-2">
                <StatusPill label="Changes submitted" variant="info" />
                <button
                  type="button"
                  onClick={() => setReviewStatus('no_action')}
                  className="text-xs text-gray-400 hover:text-white"
                  aria-label="Acknowledge changes and reset review status"
                >
                  Reset to No action
                </button>
              </div>
            ) : (
              <select
                id="review-select"
                value={reviewStatus}
                onChange={(e) => setReviewStatus(e.target.value as 'action_required' | 'no_action')}
                className="w-full rounded-md border border-white/10 bg-admin-bg px-2.5 py-1.5 text-sm text-white focus:border-admin-accent/60 focus:outline-none focus:ring-1 focus:ring-admin-accent/30"
                aria-label="Review status"
                disabled={actionLoading}
              >
                <option value="no_action">No action</option>
                <option value="action_required">Action required</option>
              </select>
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
              <FileRow label="Screenplay" file={detail.files.screenplay} />
              <FileRow label="Poster" file={detail.files.poster} />
              <FileRow label="Teaser" file={detail.files.teaser} />
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
                      <span className="text-gray-500"> · {c.role || '—'}</span>
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
            <div className="mt-2 text-sm text-gray-300">
              <span className="text-gray-500">Wish list cast: </span>
              <span>{step3.wishListCast || '—'}</span>
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
              <FileRow label="Chain of Title" file={detail.files.chainOfTitle} />
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
              return (
                <button
                  type="button"
                  onClick={() => void applyAction({ status: 'approved' })}
                  disabled={actionLoading || alreadyApproved}
                  title={alreadyApproved ? 'Already approved' : undefined}
                  className="rounded-md bg-emerald-500/90 px-5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={alreadyApproved ? 'Already approved' : 'Approve film'}
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
              onClick={() => void applyAction({ status: 'pending_approval' })}
              disabled={actionLoading}
              className="rounded-md bg-amber-500/20 px-5 py-2 text-sm font-medium text-amber-300 shadow-sm transition-colors hover:bg-amber-500/30 disabled:opacity-50"
              aria-label="Request changes"
            >
              {actionLoading ? 'Saving…' : 'Request changes'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
