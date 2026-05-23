'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  confirmSubmissionFeePayment,
  createSubmissionFeeCheckoutSession,
} from '@/lib/films-api';
import { formatSubmissionFeeLabel, SUBMISSION_FEE_USD } from '@/lib/submission-fee';

interface PaymentFormProps {
  filmId: string;
  filmTitle: string;
  checkoutSuccess?: boolean;
  checkoutSessionId?: string;
  checkoutCancelled?: boolean;
}

export function PaymentForm({
  filmId,
  filmTitle,
  checkoutSuccess = false,
  checkoutSessionId,
  checkoutCancelled = false,
}: PaymentFormProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const accessToken = session?.accessToken;
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(checkoutSuccess && !!checkoutSessionId);
  const [error, setError] = useState(
    checkoutCancelled ? 'Payment was cancelled. You can try again when ready.' : '',
  );
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!checkoutSuccess || !checkoutSessionId || !accessToken) {
      return;
    }

    let cancelled = false;
    (async () => {
      setConfirming(true);
      setError('');
      try {
        await confirmSubmissionFeePayment(filmId, checkoutSessionId, accessToken);
        if (!cancelled) {
          setSuccess(true);
          setTimeout(() => router.push('/dashboard/films'), 2000);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Could not confirm payment. If you were charged, contact support.',
          );
        }
      } finally {
        if (!cancelled) {
          setConfirming(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [checkoutSuccess, checkoutSessionId, accessToken, filmId, router]);

  async function handlePay() {
    setLoading(true);
    setError('');
    const origin = typeof window !== 'undefined' ? window.location.origin : '';

    try {
      const successUrl = `${origin}/dashboard/films/pay?film=${filmId}&checkout=success&session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${origin}/dashboard/films/pay?film=${filmId}&checkout=cancelled`;
      const { url } = await createSubmissionFeeCheckoutSession(
        filmId,
        successUrl,
        cancelUrl,
        accessToken,
      );
      if (url) {
        window.location.href = url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed. Please try again.');
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-green-500/20 bg-green-500/5 p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
          <svg className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-white">Payment Successful</h2>
        <p className="mt-2 text-sm text-gray-400">
          Your submission fee for &ldquo;{filmTitle}&rdquo; has been processed. Your project is now under review.
        </p>
        <p className="mt-4 text-xs text-gray-500">Redirecting to My Films…</p>
      </div>
    );
  }

  if (confirming) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-white/10 bg-screenriot-bg-card p-8 text-center">
        <svg className="mx-auto h-8 w-8 animate-spin text-screenriot-accent-blue" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <h2 className="mt-4 text-lg font-semibold text-white">Confirming payment…</h2>
        <p className="mt-2 text-sm text-gray-400">Please wait while we verify your submission fee.</p>
      </div>
    );
  }

  const feeLabel = formatSubmissionFeeLabel();

  return (
    <div className="mx-auto max-w-lg rounded-xl border border-white/10 bg-screenriot-bg-card p-8">
      <h2 className="text-xl font-semibold text-white">Pay Submission Fee</h2>
      <p className="mt-2 text-sm text-gray-400">
        Complete the payment for &ldquo;{filmTitle}&rdquo; to submit it for review.
      </p>

      <div className="mt-6 rounded-lg border border-white/10 bg-white/[0.02] p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Project</span>
          <span className="text-sm font-medium text-white">{filmTitle}</span>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3">
          <span className="text-sm text-gray-400">Submission Fee</span>
          <span className="text-lg font-semibold text-white">{feeLabel}</span>
        </div>
      </div>

      <p className="mt-4 text-xs text-gray-500">
        You will be redirected to Stripe to pay securely. Test mode uses sandbox cards (e.g. 4242 4242 4242 4242).
      </p>

      {error && (
        <p className="mt-4 rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-col gap-3">
        <button
          type="button"
          onClick={handlePay}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-screenriot-red px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-screenriot-red/80 focus:outline-none focus:ring-2 focus:ring-screenriot-red/50 disabled:opacity-50"
          aria-label={`Pay submission fee for ${filmTitle}`}
        >
          {loading ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Redirecting to Stripe…
            </>
          ) : (
            `Pay $${SUBMISSION_FEE_USD} & Submit for Review`
          )}
        </button>

        <div className="flex justify-center gap-4">
          <Link
            href="/dashboard/films"
            className="text-sm text-gray-500 transition-colors hover:text-gray-300"
          >
            Back to My Films
          </Link>
          <Link
            href={`/dashboard/submit-project?film=${filmId}`}
            className="text-sm text-screenriot-accent-blue transition-colors hover:text-screenriot-accent-blue/80"
          >
            Edit Project
          </Link>
        </div>
      </div>
    </div>
  );
}
