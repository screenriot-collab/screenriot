import Link from 'next/link';
import { SUBMISSION_FEE_CTA } from '@/markup/submit-project';
import type { UploadWarning } from '@/types/submit-project';

const SLOT_LABELS: Record<UploadWarning['slot'], string> = {
  screenplay: 'Screenplay (PDF)',
  poster: 'Poster/Key Art',
  teaser: 'Teaser/Pitch Video',
  'chain-of-title': 'Chain of Title (PDF)',
};

interface SubmissionSuccessProps {
  title: string;
  description: string;
  buttonLabel: string;
  buttonHref: string;
  uploadWarnings: UploadWarning[];
  filmId?: string | null;
  submissionFeePaid?: boolean;
}

export function SubmissionSuccess({
  title,
  description,
  buttonLabel,
  buttonHref,
  uploadWarnings,
  filmId,
  submissionFeePaid = false,
}: SubmissionSuccessProps) {
  const needsPayment = !submissionFeePaid && !!filmId;
  return (
    <div className="mx-auto max-w-2xl rounded-xl border border-white/10 bg-screenriot-bg-card p-8 text-center">
      <h2 className="text-2xl font-semibold text-white">{title}</h2>
      <p className="mt-4 text-sm text-screenriot-muted">{description}</p>
      {uploadWarnings.length > 0 && (
        <div
          className="mt-6 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-left"
          role="status"
          aria-label="Some files were not uploaded"
        >
          <p className="text-sm font-medium text-amber-300">Some files were not uploaded.</p>
          <p className="mt-1 text-sm text-screenriot-muted">
            Your project was saved. You can upload missing files later by opening the project in
            &ldquo;My Films&rdquo; and updating it.
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-screenriot-muted">
            {uploadWarnings.map((w) => (
              <li key={`${w.slot}:${w.fileName}`}>
                {SLOT_LABELS[w.slot]} —{' '}
                <span className="text-white/90">{w.fileName}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {needsPayment && (
        <div className="mt-6 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-left">
          <p className="text-sm font-semibold text-amber-300">{SUBMISSION_FEE_CTA.title}</p>
          <p className="mt-1 text-sm text-screenriot-muted">{SUBMISSION_FEE_CTA.description}</p>
          <Link
            href={`/dashboard/films/pay?film=${filmId}`}
            className="mt-4 inline-block rounded-lg bg-screenriot-accent-blue px-6 py-3 text-sm font-medium text-white hover:bg-screenriot-accent-blue/90 focus:outline-none focus:ring-2 focus:ring-screenriot-accent-blue focus:ring-offset-2 focus:ring-offset-screenriot-bg"
          >
            {SUBMISSION_FEE_CTA.buttonLabel}
          </Link>
        </div>
      )}
      <Link
        href={buttonHref}
        className={
          needsPayment
            ? 'mt-4 inline-block text-sm font-medium text-screenriot-muted underline hover:text-white'
            : 'mt-6 inline-block rounded-lg bg-screenriot-accent-blue px-6 py-3 text-sm font-medium text-white hover:bg-screenriot-accent-blue/90 focus:outline-none focus:ring-2 focus:ring-screenriot-accent-blue focus:ring-offset-2 focus:ring-offset-screenriot-bg'
        }
      >
        {buttonLabel}
      </Link>
    </div>
  );
}
