'use client';

import Link from 'next/link';

export type ParticipationGateVariant = 'signin' | 'verify';

type Purpose = 'invest' | 'participate';

interface ParticipationGateModalProps {
  variant: ParticipationGateVariant;
  onClose: () => void;
  signInCallbackUrl?: string;
  purpose?: Purpose;
}

const CONTENT: Record<
  Purpose,
  Record<ParticipationGateVariant, { title: string; description: string; buttonLabel: string; href: string }>
> = {
  invest: {
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
  },
  participate: {
    signin: {
      title: 'Sign in required',
      description:
        'Sign in or create an account to vote, unlock script pages, and join community activities on film pages.',
      buttonLabel: 'Sign in',
      href: '/auth/signin',
    },
    verify: {
      title: 'Verification required',
      description:
        'Complete identity verification in Profile → Security before you can vote or take part in community activities.',
      buttonLabel: 'Go to Profile → Security',
      href: '/profile?tab=security',
    },
  },
};

export function ParticipationGateModal({
  variant,
  onClose,
  signInCallbackUrl,
  purpose = 'participate',
}: ParticipationGateModalProps) {
  const c = CONTENT[purpose][variant];
  const href =
    variant === 'signin' && signInCallbackUrl
      ? `${c.href}?callbackUrl=${encodeURIComponent(signInCallbackUrl)}`
      : c.href;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="participation-gate-title"
      aria-describedby="participation-gate-desc"
    >
      <div className="absolute inset-0 bg-black/70" aria-hidden="true" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl border border-white/10 bg-screenriot-bg-card p-6 shadow-xl">
        <h2 id="participation-gate-title" className="text-lg font-semibold text-white">
          {c.title}
        </h2>
        <p id="participation-gate-desc" className="mt-2 text-sm text-gray-400">
          {c.description}
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Link
            href={href}
            className="inline-flex justify-center rounded-lg bg-gradient-to-r from-screenriot-accent-blue to-blue-700 px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-screenriot-accent-blue focus:ring-offset-2 focus:ring-offset-screenriot-bg"
          >
            {c.buttonLabel}
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded text-sm text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-screenriot-accent-blue"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
