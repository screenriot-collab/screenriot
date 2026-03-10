'use client';

import Link from 'next/link';

type Variant = 'signin' | 'verify';

interface InvestGateModalProps {
  variant: Variant;
  onClose: () => void;
  /** Optional callback URL after sign in (e.g. current film page). */
  signInCallbackUrl?: string;
}

const CONTENT: Record<
  Variant,
  { title: string; description: string; buttonLabel: string; href: string }
> = {
  signin: {
    title: 'Sign in required',
    description:
      'You need to sign in to invest in this film. Sign in or create an account to continue.',
    buttonLabel: 'Sign in',
    href: '/auth/signin',
  },
  verify: {
    title: 'Verification required',
    description:
      'You need to complete identity verification before investing. Go to your profile → Security to submit the required documents.',
    buttonLabel: 'Go to Profile → Security',
    href: '/profile?tab=security',
  },
};

export function InvestGateModal({
  variant,
  onClose,
  signInCallbackUrl,
}: InvestGateModalProps) {
  const c = CONTENT[variant];
  const href =
    variant === 'signin' && signInCallbackUrl
      ? `${c.href}?callbackUrl=${encodeURIComponent(signInCallbackUrl)}`
      : c.href;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="invest-gate-title"
      aria-describedby="invest-gate-desc"
    >
      <div
        className="absolute inset-0 bg-black/70"
        aria-hidden="true"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md rounded-xl border border-white/10 bg-screenriot-bg-card p-6 shadow-xl">
        <h2 id="invest-gate-title" className="text-lg font-semibold text-white">
          {c.title}
        </h2>
        <p id="invest-gate-desc" className="mt-2 text-sm text-gray-400">
          {c.description}
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Link
            href={href}
            className="inline-flex justify-center rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-screenriot-bg"
          >
            {c.buttonLabel}
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-screenriot-bg rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
