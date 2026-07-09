import { useParams, useNavigate } from 'react-router-dom';
import { useSiteUserDetail } from '@/hooks/useSiteUserDetail';
import { StatusPill } from '@/components/ui/StatusPill';
import type { StatusVariant } from '@/components/ui/StatusPill';
import type { SiteUserDetail, VerificationDocument } from '@/types/site-users';
import { VERIFICATION_STATUS_LABEL, DOC_TYPE_LABEL } from '@/constants/site-users';
import { CLASS_LABEL, CLASS_INPUT } from '@/constants/styles';

// Local value display style (no exact match in constants/styles.ts)
const CLASS_VALUE = 'mt-1 text-sm text-white';
// Section card style for this page
const CLASS_CARD_SECTION = 'rounded-xl border border-white/[0.06] bg-admin-bg/60 p-5';

function verificationVariant(status: string): StatusVariant {
  switch (status) {
    case 'pending': return 'warn';
    case 'verified': return 'ok';
    case 'rejected': return 'bad';
    default: return 'neutral';
  }
}

function docStatusVariant(status: string): StatusVariant {
  switch (status) {
    case 'approved': return 'ok';
    case 'rejected': return 'bad';
    default: return 'warn';
  }
}

function formatDate(iso: string | null) {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fullName(u: SiteUserDetail) {
  const parts = [u.firstName, u.lastName].filter(Boolean);
  return parts.length ? parts.join(' ') : (u.displayName ?? u.email);
}

export default function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    user,
    loading,
    error,
    actionError,
    editing,
    editForm,
    setEditForm,
    saving,
    feedback,
    setFeedback,
    docComments,
    setDocComments,
    submitting,
    startEdit,
    cancelEdit,
    saveEdit,
    handleReview,
    handleDocReview,
  } = useSiteUserDetail(id);

  if (loading) {
    return <p className="py-12 text-center text-sm text-gray-500">Loading...</p>;
  }

  if (error || !user) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-red-400" role="alert">{error || 'User not found'}</p>
        <button
          type="button"
          onClick={() => navigate('/users')}
          className="mt-3 text-sm text-admin-accent hover:underline"
        >
          Back to Users
        </button>
      </div>
    );
  }

  const v = user.verification;
  const canReview = v?.status === 'pending';
  const canRevoke = v?.status === 'verified';

  return (
    <>
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/users')}
          className="rounded-md bg-white/[0.06] px-2.5 py-1.5 text-xs text-gray-400 hover:bg-white/[0.1] hover:text-white"
          aria-label="Back to users"
        >
          Back
        </button>
        <h1 className="text-2xl font-bold text-white">{fullName(user)}</h1>
        <StatusPill label={user.role} variant={user.role === 'filmmaker' ? 'info' : 'purple'} />
        {user.lastEditedBy && (
          <span className="ml-auto text-xs text-gray-500">
            Last edited by <span className="text-gray-400">{user.lastEditedBy.username ?? 'admin'}</span>
          </span>
        )}
      </div>

      {/* Action error banner */}
      {actionError && (
        <p className="mt-4 rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-400" role="alert">
          {actionError}
        </p>
      )}

      {/* User Info */}
      <div className={`mt-6 ${CLASS_CARD_SECTION}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">User Information</h2>
          {!editing ? (
            <button
              type="button"
              onClick={startEdit}
              className="rounded-md bg-admin-accent/15 px-3 py-1.5 text-xs font-medium text-admin-accent hover:bg-admin-accent/25"
            >
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => void saveEdit()}
                disabled={saving}
                className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="rounded-md bg-white/10 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-white/20"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {editing ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label htmlFor="edit-firstName" className={CLASS_LABEL}>First Name</label>
              <input id="edit-firstName" className={CLASS_INPUT} value={editForm.firstName ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, firstName: e.target.value }))} />
            </div>
            <div>
              <label htmlFor="edit-lastName" className={CLASS_LABEL}>Last Name</label>
              <input id="edit-lastName" className={CLASS_INPUT} value={editForm.lastName ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, lastName: e.target.value }))} />
            </div>
            <div>
              <label htmlFor="edit-displayName" className={CLASS_LABEL}>Display Name</label>
              <input id="edit-displayName" className={CLASS_INPUT} value={editForm.displayName ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, displayName: e.target.value }))} />
            </div>
            <div>
              <label htmlFor="edit-email" className={CLASS_LABEL}>Email</label>
              <input id="edit-email" type="email" className={CLASS_INPUT} value={editForm.email ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))} />
            </div>
            <div>
              <label htmlFor="edit-phone" className={CLASS_LABEL}>Phone</label>
              <input id="edit-phone" className={CLASS_INPUT} value={editForm.phone ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))} />
            </div>
            <div>
              <label htmlFor="edit-role" className={CLASS_LABEL}>Role</label>
              <select id="edit-role" className={CLASS_INPUT} value={editForm.role ?? 'fan'} onChange={(e) => setEditForm((p) => ({ ...p, role: e.target.value }))}>
                <option value="fan">Fan</option>
                <option value="filmmaker">Filmmaker</option>
              </select>
            </div>
            <div>
              <label htmlFor="edit-country" className={CLASS_LABEL}>Country</label>
              <input id="edit-country" className={CLASS_INPUT} value={editForm.country ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, country: e.target.value }))} />
            </div>
            <div>
              <label htmlFor="edit-city" className={CLASS_LABEL}>City</label>
              <input id="edit-city" className={CLASS_INPUT} value={editForm.city ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, city: e.target.value }))} />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label htmlFor="edit-bio" className={CLASS_LABEL}>Bio</label>
              <textarea id="edit-bio" className={CLASS_INPUT} rows={3} value={editForm.bio ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, bio: e.target.value }))} />
            </div>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className={CLASS_LABEL}>Email</p>
              <p className={CLASS_VALUE}>{user.email}</p>
            </div>
            <div>
              <p className={CLASS_LABEL}>Display Name</p>
              <p className={CLASS_VALUE}>{user.displayName ?? '-'}</p>
            </div>
            <div>
              <p className={CLASS_LABEL}>Full Name</p>
              <p className={CLASS_VALUE}>{[user.firstName, user.lastName].filter(Boolean).join(' ') || '-'}</p>
            </div>
            <div>
              <p className={CLASS_LABEL}>Phone</p>
              <p className={CLASS_VALUE}>{user.phone ?? '-'}</p>
            </div>
            <div>
              <p className={CLASS_LABEL}>Location</p>
              <p className={CLASS_VALUE}>{[user.city, user.country].filter(Boolean).join(', ') || '-'}</p>
            </div>
            <div>
              <p className={CLASS_LABEL}>Joined</p>
              <p className={CLASS_VALUE}>{formatDate(user.createdAt)}</p>
            </div>
            {user.bio && (
              <div className="sm:col-span-2 lg:col-span-3">
                <p className={CLASS_LABEL}>Bio</p>
                <p className={`${CLASS_VALUE} whitespace-pre-line`}>{user.bio}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filmmaker Details */}
      {user.filmmaker && (
        <div className={`mt-4 ${CLASS_CARD_SECTION}`}>
          <h2 className="text-base font-semibold text-white">Filmmaker Details</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className={CLASS_LABEL}>Production Company</p>
              <p className={CLASS_VALUE}>{user.filmmaker.productionCompany ?? '-'}</p>
            </div>
            <div>
              <p className={CLASS_LABEL}>IMDb</p>
              <p className={CLASS_VALUE}>
                {user.filmmaker.imdbUrl ? (
                  <a href={user.filmmaker.imdbUrl} target="_blank" rel="noopener noreferrer" className="text-admin-accent hover:underline">
                    {user.filmmaker.imdbUrl}
                  </a>
                ) : '-'}
              </p>
            </div>
            <div>
              <p className={CLASS_LABEL}>Experience</p>
              <p className={CLASS_VALUE}>{user.filmmaker.yearsOfExperience != null ? `${user.filmmaker.yearsOfExperience} years` : '-'}</p>
            </div>
            {user.filmmaker.specialization.length > 0 && (
              <div className="sm:col-span-2 lg:col-span-3">
                <p className={CLASS_LABEL}>Specialization</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {user.filmmaker.specialization.map((s) => (
                    <span key={s} className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-gray-300">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {user.filmmaker.statement && (
              <div className="sm:col-span-2 lg:col-span-3">
                <p className={CLASS_LABEL}>Statement</p>
                <p className={`${CLASS_VALUE} whitespace-pre-line`}>{user.filmmaker.statement}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Verification */}
      <div className={`mt-4 ${CLASS_CARD_SECTION}`}>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-white">Verification</h2>
          {v && (
            <StatusPill
              label={VERIFICATION_STATUS_LABEL[v.status] ?? v.status}
              variant={verificationVariant(v.status)}
            />
          )}
        </div>

        {!v || v.status === 'not_started' ? (
          <p className="mt-4 text-sm text-gray-500">User has not started verification.</p>
        ) : (
          <>
            <div className="mt-3 grid gap-3 text-xs text-gray-500 sm:grid-cols-3">
              <p>Submitted: {formatDate(v.submittedAt)}</p>
              <p>Reviewed: {formatDate(v.reviewedAt)}</p>
              <p>
                Reviewed by:{' '}
                <span className="text-gray-400">{v.reviewedBy?.username ?? '-'}</span>
              </p>
            </div>

            {v.adminFeedback && (
              <div className="mt-3 rounded-md border border-white/10 bg-white/[0.03] px-4 py-3">
                <p className="text-xs font-medium text-gray-400">Previous Feedback</p>
                <p className="mt-1 text-sm text-gray-300">{v.adminFeedback}</p>
              </div>
            )}

            {/* Documents */}
            <div className="mt-5 space-y-3">
              <h3 className="text-sm font-medium text-white">Documents ({v.documents.length})</h3>
              {v.documents.length === 0 ? (
                <p className="text-sm text-gray-500">No documents uploaded.</p>
              ) : (
                v.documents.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    doc={doc}
                    canReview={canReview}
                    comment={docComments[doc.id] ?? ''}
                    submitting={submitting}
                    onCommentChange={(val) => setDocComments((prev) => ({ ...prev, [doc.id]: val }))}
                    onAction={(action) => void handleDocReview(doc, action)}
                  />
                ))
              )}
            </div>

            {/* Overall review */}
            {canReview && (
              <div className="mt-6 border-t border-white/[0.06] pt-5">
                <h3 className="text-sm font-medium text-white">Overall Decision</h3>
                <label className="sr-only" htmlFor="verification-feedback">Feedback to user</label>
                <textarea
                  id="verification-feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Feedback to the user (required for rejection)..."
                  rows={3}
                  className={`mt-2 ${CLASS_INPUT}`}
                />
                <div className="mt-3 flex gap-3">
                  <button
                    type="button"
                    onClick={() => void handleReview('approve')}
                    disabled={submitting}
                    className="rounded-md bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {submitting ? 'Processing...' : 'Approve Verification'}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleReview('reject')}
                    disabled={submitting}
                    className="rounded-md bg-red-600 px-5 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {submitting ? 'Processing...' : 'Reject Verification'}
                  </button>
                </div>
              </div>
            )}

            {canRevoke && (
              <div className="mt-6 border-t border-white/[0.06] pt-5">
                <h3 className="text-sm font-medium text-white">Revoke Verification</h3>
                <p className="mt-1 text-xs text-gray-500">
                  This will reset the user to &ldquo;rejected&rdquo; status. They will be able to edit their identity
                  fields and re-upload verification documents.
                </p>
                <label className="sr-only" htmlFor="revoke-feedback">Reason for revoking</label>
                <textarea
                  id="revoke-feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Reason for revoking verification (required)..."
                  rows={2}
                  className={`mt-2 ${CLASS_INPUT}`}
                />
                <button
                  type="button"
                  onClick={() => void handleReview('reject')}
                  disabled={submitting || !feedback.trim()}
                  className="mt-3 rounded-md bg-red-600 px-5 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {submitting ? 'Processing...' : 'Revoke Verification'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

type DocumentCardProps = {
  doc: VerificationDocument;
  canReview: boolean;
  comment: string;
  submitting: boolean;
  onCommentChange: (val: string) => void;
  onAction: (action: 'approve' | 'reject') => void;
};

function DocumentCard({ doc, canReview, comment, submitting, onCommentChange, onAction }: DocumentCardProps) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-admin-bg p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-white">
              {DOC_TYPE_LABEL[doc.type] ?? doc.type}
            </p>
            <StatusPill label={doc.status} variant={docStatusVariant(doc.status)} />
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
            <span>{doc.fileName}</span>
            <span>·</span>
            <span>{formatFileSize(doc.fileSize)}</span>
            <span>·</span>
            <span>{formatDate(doc.uploadedAt)}</span>
          </div>
        </div>
        <a
          href={doc.url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded bg-admin-accent/10 px-2.5 py-1 text-xs font-medium text-admin-accent hover:bg-admin-accent/20"
          aria-label={`Open ${doc.fileName}`}
        >
          Open
        </a>
      </div>

      {doc.adminComment && (
        <div className="mt-2 rounded border border-amber-500/20 bg-amber-500/5 px-3 py-2">
          <p className="text-xs text-amber-300">
            <span className="font-medium">Comment:</span> {doc.adminComment}
          </p>
        </div>
      )}

      {canReview && doc.status === 'uploaded' && (
        <div className="mt-3 flex items-end gap-2">
          <div className="flex-1">
            <label className="sr-only" htmlFor={`doc-comment-${doc.id}`}>Comment for {doc.fileName}</label>
            <input
              id={`doc-comment-${doc.id}`}
              type="text"
              value={comment}
              onChange={(e) => onCommentChange(e.target.value)}
              placeholder="Optional comment..."
              className={CLASS_INPUT}
            />
          </div>
          <button
            type="button"
            onClick={() => onAction('approve')}
            disabled={submitting}
            className="rounded bg-emerald-500/15 px-2.5 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/25 disabled:opacity-50"
            aria-label={`Approve ${doc.fileName}`}
          >
            Approve
          </button>
          <button
            type="button"
            onClick={() => onAction('reject')}
            disabled={submitting}
            className="rounded bg-red-500/15 px-2.5 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/25 disabled:opacity-50"
            aria-label={`Reject ${doc.fileName}`}
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
}
