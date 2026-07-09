'use client';

import { useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { IMAGES } from '@/lib/constants';
import {
  FAN_DOCUMENT_REQUIREMENTS,
  FILMMAKER_DOCUMENT_REQUIREMENTS,
  FILMMAKER_PROFESSIONAL_DOCS_NOTE,
  VERIFICATION_ACCEPTED_FORMATS,
  VERIFICATION_ACCEPTED_MIME_TYPES,
  VERIFICATION_MAX_FILE_SIZE_MB,
  type UserRole,
  type VerificationData,
  type VerificationDocType,
  type VerificationDocument,
} from '@/markup/profile';
import {
  uploadVerificationDoc,
  deleteVerificationDoc,
  submitVerification,
} from '@/lib/profile-api';
import { ProfileSection } from './ProfileSection';

interface VerificationSectionProps {
  role: UserRole;
  verification: VerificationData;
}

const STATUS_CONFIG = {
  not_started: {
    label: 'Not Verified',
    pillClass: 'bg-white/10 text-gray-300',
    icon: 'checkNotVerified' as const,
  },
  pending: {
    label: 'Under Review',
    pillClass: 'bg-yellow-500/20 text-yellow-400',
    icon: 'checkNotVerified' as const,
  },
  verified: {
    label: 'Verified',
    pillClass: 'bg-green-500/20 text-green-400',
    icon: 'checkVerified' as const,
  },
  rejected: {
    label: 'Action Required',
    pillClass: 'bg-red-500/20 text-red-400',
    icon: 'checkNotVerified' as const,
  },
} as const;

const DOC_STATUS_COLORS: Record<VerificationDocument['status'], string> = {
  uploaded: 'text-yellow-400',
  approved: 'text-green-400',
  rejected: 'text-red-400',
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const SUBMIT_PROJECT_HREF = '/dashboard/submit-project';
const MY_FILMS_HREF = '/dashboard/films';

const submitProjectLinkClass =
  'font-medium text-screenriot-accent underline underline-offset-2 hover:text-screenriot-accent/90';

/** Link phrases in admin feedback (e.g. "upload your film project") to submit flow. */
function linkifyAdminFeedback(text: string): ReactNode {
  const patterns: { regex: RegExp; href: string }[] = [
    { regex: /upload your film project/i, href: SUBMIT_PROJECT_HREF },
    { regex: /submit your project/i, href: SUBMIT_PROJECT_HREF },
    { regex: /\bmy films\b/i, href: MY_FILMS_HREF },
  ];

  for (const { regex, href } of patterns) {
    const match = regex.exec(text);
    if (!match || match.index === undefined) continue;
    const before = text.slice(0, match.index);
    const phrase = match[0];
    const after = text.slice(match.index + phrase.length);
    return (
      <>
        {before}
        <Link href={href} className={submitProjectLinkClass}>
          {phrase}
        </Link>
        {linkifyAdminFeedback(after)}
      </>
    );
  }

  return text;
}

const FEEDBACK_STYLES = {
  pending: {
    border: 'border-yellow-500/30',
    bg: 'bg-yellow-500/5',
    titleColor: 'text-yellow-400',
    icon: '⏳',
  },
  rejected: {
    border: 'border-red-500/30',
    bg: 'bg-red-500/10',
    titleColor: 'text-red-400',
    icon: '⚠',
  },
  verified: {
    border: 'border-green-500/30',
    bg: 'bg-green-500/5',
    titleColor: 'text-green-400',
    icon: '✓',
  },
} as const;

function AdminFeedbackBlock({
  status,
  feedback,
  reviewedAt,
}: {
  status: VerificationData['status'];
  feedback?: string;
  reviewedAt?: string;
}) {
  if (status === 'not_started') return null;

  const style = FEEDBACK_STYLES[status as keyof typeof FEEDBACK_STYLES];
  if (!style) return null;

  return (
    <div
      className={`rounded-lg border ${style.border} ${style.bg} p-4`}
      role={status === 'rejected' ? 'alert' : 'status'}
      aria-label="Admin feedback"
    >
      <div className="flex items-center gap-2">
        <span aria-hidden>{style.icon}</span>
        <p className={`text-sm font-semibold ${style.titleColor}`}>Admin Feedback</p>
        {reviewedAt && (
          <span className="ml-auto text-xs text-screenriot-muted">
            {formatDate(reviewedAt)}
          </span>
        )}
      </div>

      {feedback ? (
        <p className="mt-2 text-sm text-gray-300">{linkifyAdminFeedback(feedback)}</p>
      ) : (
        <p className="mt-2 text-sm text-screenriot-muted italic">
          {status === 'pending' && 'No feedback yet. Your documents are being reviewed.'}
          {status === 'verified' && 'All documents approved. No additional actions needed.'}
          {status === 'rejected' && 'The admin has not left additional details.'}
        </p>
      )}
    </div>
  );
}

export function VerificationSection({ role, verification }: VerificationSectionProps) {
  const { data: session } = useSession();
  const [localVerification, setLocalVerification] = useState(verification);
  const [uploading, setUploading] = useState<VerificationDocType | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const fileInputRefs = useRef<Map<VerificationDocType, HTMLInputElement>>(new Map());

  const docRequirements =
    role === 'filmmaker' ? FILMMAKER_DOCUMENT_REQUIREMENTS : FAN_DOCUMENT_REQUIREMENTS;

  const statusConfig = STATUS_CONFIG[localVerification.status];
  const canUpload =
    localVerification.status === 'not_started' || localVerification.status === 'rejected';

  function getDocForType(type: VerificationDocType): VerificationDocument | undefined {
    return localVerification.documents.find((d) => d.type === type);
  }

  async function handleFileSelect(type: VerificationDocType, file: File | undefined) {
    if (!file) return;

    if (!VERIFICATION_ACCEPTED_MIME_TYPES.includes(file.type)) {
      alert('Unsupported file type. Please upload a PDF, JPG, PNG, or WebP file.');
      return;
    }
    if (file.size > VERIFICATION_MAX_FILE_SIZE_MB * 1024 * 1024) {
      alert(`File too large. Maximum size is ${VERIFICATION_MAX_FILE_SIZE_MB} MB.`);
      return;
    }

    setUploading(type);
    setSubmitMessage('');
    try {
      const doc = await uploadVerificationDoc(session?.accessToken, type, file);
      setLocalVerification((prev) => ({
        ...prev,
        documents: [...prev.documents.filter((d) => d.type !== type), doc],
      }));
    } catch {
      alert('Failed to upload document. Please try again.');
    } finally {
      setUploading(null);
      const input = fileInputRefs.current.get(type);
      if (input) input.value = '';
    }
  }

  async function handleDeleteDoc(docId: string, type: VerificationDocType) {
    try {
      await deleteVerificationDoc(session?.accessToken, docId);
      setLocalVerification((prev) => ({
        ...prev,
        documents: prev.documents.filter((d) => d.id !== docId),
      }));
    } catch {
      alert('Failed to delete document.');
    }
  }

  async function handleSubmitDocuments() {
    const required = docRequirements.filter((r) => r.required);
    const missing = required.filter((r) => !getDocForType(r.type));

    if (role === 'filmmaker') {
      const professionalTypes: VerificationDocType[] = [
        'business_registration',
        'guild_membership',
        'festival_certificate',
        'credits_documentation',
      ];
      const hasProfessional = professionalTypes.some((t) => getDocForType(t));
      if (!hasProfessional) {
        alert('Please upload at least one professional document (Business Registration, Guild Membership, Festival Certificate, or Credits Documentation).');
        return;
      }
    }

    if (missing.length > 0) {
      alert(`Please upload required documents: ${missing.map((m) => m.label).join(', ')}`);
      return;
    }

    setSubmitting(true);
    setSubmitMessage('');
    try {
      const updated = await submitVerification(session?.accessToken);
      setLocalVerification(updated);
      setSubmitMessage('Documents submitted for review. You will be notified once the review is complete.');
    } catch {
      setSubmitMessage('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ProfileSection
      id="verification-heading"
      heading={
        <span className="flex items-center gap-3">
          Identity Verification
          <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig.pillClass}`}
          >
            {statusConfig.label}
          </span>
        </span>
      }
    >
      <div className="mt-4 space-y-6">
        {/* ——— Status banner ——— */}
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0" aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={IMAGES.icons[statusConfig.icon]}
              alt=""
              width={48}
              height={48}
              className="h-12 w-12"
            />
          </span>
          <div className="min-w-0 flex-1">
            {localVerification.status === 'not_started' && (
              <>
                <p className="font-semibold text-white">Verify your identity</p>
                <p className="mt-1 text-sm text-screenriot-muted">
                  Upload the required documents below to verify your identity.
                  {role === 'fan'
                    ? ' Verification is required to invest in film projects.'
                    : ' Verification is required to submit films and receive funding.'}
                </p>
              </>
            )}
            {localVerification.status === 'pending' && (
              <>
                <p className="font-semibold text-white">Documents under review</p>
                <p className="mt-1 text-sm text-screenriot-muted">
                  Your documents were submitted
                  {localVerification.submittedAt &&
                    ` on ${formatDate(localVerification.submittedAt)}`}
                  . Our team typically reviews within 1–3 business days.
                </p>
              </>
            )}
            {localVerification.status === 'verified' && (
              <>
                <p className="font-semibold text-white">Identity Verified</p>
                <p className="mt-1 text-sm text-screenriot-muted">
                  Your identity was verified
                  {localVerification.reviewedAt &&
                    ` on ${formatDate(localVerification.reviewedAt)}`}
                  .
                  {role === 'fan'
                    ? ' You can now invest up to $10,000 per project.'
                    : ' You can submit films and receive funding.'}
                </p>
              </>
            )}
            {localVerification.status === 'rejected' && (
              <>
                <p className="font-semibold text-red-400">Verification unsuccessful</p>
                <p className="mt-1 text-sm text-screenriot-muted">
                  Your verification was reviewed
                  {localVerification.reviewedAt &&
                    ` on ${formatDate(localVerification.reviewedAt)}`}
                  . Please review the feedback below and re-upload the requested documents.
                </p>
              </>
            )}
          </div>
        </div>

        {/* ——— Admin Feedback (visible once documents submitted) ——— */}
        {localVerification.status !== 'not_started' && (
          <AdminFeedbackBlock
            status={localVerification.status}
            feedback={localVerification.adminFeedback}
            reviewedAt={localVerification.reviewedAt}
          />
        )}

        {/* ——— Document requirements & upload ——— */}
        <div>
          <h4 className="text-sm font-semibold text-white">
            {canUpload ? 'Upload Documents' : 'Submitted Documents'}
          </h4>
          {role === 'filmmaker' && canUpload && (
            <p className="mt-1 text-xs text-screenriot-accent-blue">
              {FILMMAKER_PROFESSIONAL_DOCS_NOTE}
            </p>
          )}
          <p className="mt-1 text-xs text-screenriot-muted">
            Accepted formats: PDF, JPG, PNG, WebP. Max {VERIFICATION_MAX_FILE_SIZE_MB} MB per file.
          </p>

          <ul className="mt-4 space-y-3" role="list">
            {docRequirements.map((req) => {
              const existing = getDocForType(req.type);
              const isUploading = uploading === req.type;
              /** Admin can reject a single document without rejecting the whole
               * verification (e.g. everything else is fine, just this one needs
               * redoing) - allow re-upload for that document even if the overall
               * status is "pending" or "verified". */
              const canReuploadThis = canUpload || existing?.status === 'rejected';

              return (
                <li
                  key={req.type}
                  className="rounded-lg border border-white/10 bg-screenriot-bg p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white">
                        {req.label}
                        {req.required && (
                          <span className="ml-1 text-red-400" aria-label="required">*</span>
                        )}
                      </p>
                      <p className="mt-0.5 text-xs text-screenriot-muted">
                        {req.description}
                      </p>
                    </div>

                    {existing && (
                      <span
                        className={`shrink-0 text-xs font-medium ${DOC_STATUS_COLORS[existing.status]}`}
                      >
                        {existing.status === 'uploaded' && '● Uploaded'}
                        {existing.status === 'approved' && '✓ Approved'}
                        {existing.status === 'rejected' && '✗ Rejected'}
                      </span>
                    )}
                  </div>

                  {existing && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-screenriot-muted">
                      <span>{existing.fileName}</span>
                      <span>·</span>
                      <span>{formatFileSize(existing.fileSize)}</span>
                      <span>·</span>
                      <span>{formatDate(existing.uploadedAt)}</span>
                      {canUpload && existing.status === 'uploaded' && (
                        <>
                          <span>·</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteDoc(existing.id, req.type)}
                            className="text-red-400 hover:text-red-300 focus:outline-none"
                            aria-label={`Delete ${existing.fileName}`}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  )}

                  {existing?.adminComment && (
                    <div className="mt-2 rounded border border-red-500/20 bg-red-500/5 px-3 py-2">
                      <p className="text-xs text-red-400">
                        <span className="font-medium">Note:</span> {existing.adminComment}
                      </p>
                    </div>
                  )}

                  {isUploading && (
                    <p className="mt-2 text-xs text-screenriot-accent-blue">Uploading…</p>
                  )}

                  {canReuploadThis && !isUploading && (
                    <div className="mt-3">
                      <input
                        type="file"
                        accept={VERIFICATION_ACCEPTED_FORMATS}
                        className="hidden"
                        ref={(el) => {
                          if (el) fileInputRefs.current.set(req.type, el);
                        }}
                        onChange={(e) =>
                          handleFileSelect(req.type, e.target.files?.[0])
                        }
                        aria-label={`Upload ${req.label}`}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRefs.current.get(req.type)?.click()}
                        className="rounded bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20 focus:outline-none focus:ring-1 focus:ring-screenriot-accent-blue"
                      >
                        {existing ? 'Re-upload' : 'Choose File'}
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* ——— Submit button ——— */}
        {canUpload && (
          <div>
            {submitMessage && (
              <p className="mb-3 text-sm text-green-400" role="status">
                {submitMessage}
              </p>
            )}
            <button
              type="button"
              onClick={handleSubmitDocuments}
              disabled={submitting || localVerification.documents.length === 0}
              className="rounded bg-screenriot-accent-blue px-5 py-2.5 text-sm font-medium text-white hover:bg-screenriot-accent-blue/90 focus:outline-none focus:ring-2 focus:ring-screenriot-accent-blue focus:ring-offset-2 focus:ring-offset-screenriot-bg disabled:opacity-50"
            >
              {submitting ? 'Submitting…' : 'Submit for Verification'}
            </button>
          </div>
        )}

        {/* ——— Verified: summary list ——— */}
        {localVerification.status === 'verified' && (
          <div className="mt-2">
            <h4 className="text-sm font-semibold text-white">Verified Documents</h4>
            <ul className="mt-2 space-y-1.5" role="list">
              {localVerification.documents.map((doc) => (
                <li key={doc.id} className="flex items-center gap-2 text-sm text-white">
                  <span className="flex h-5 w-5 shrink-0" aria-hidden>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={IMAGES.icons.checkVerified}
                      alt=""
                      width={20}
                      height={20}
                      className="h-5 w-5"
                    />
                  </span>
                  {docRequirements.find((r) => r.type === doc.type)?.label ?? doc.type}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </ProfileSection>
  );
}
