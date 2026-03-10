import Link from 'next/link';

type Props = {
  title?: string;
  description?: string;
};

export function VerificationRequired({
  title = 'Verification Required',
  description = 'You need to complete identity verification before accessing this feature. Please go to your profile and submit the required documents.',
}: Props) {
  return (
    <div className="mx-auto mt-16 max-w-lg text-center">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/10">
        <svg
          className="h-10 w-10 text-amber-400"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
          />
        </svg>
      </div>

      <h2 className="text-xl font-bold text-white">{title}</h2>
      <p className="mt-3 text-sm leading-relaxed text-gray-400">{description}</p>

      <div className="mt-8 flex flex-col items-center gap-3">
        <Link
          href="/profile?tab=security"
          className="inline-flex items-center gap-2 rounded-lg bg-screenriot-red px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-screenriot-red/80 focus:outline-none focus:ring-2 focus:ring-screenriot-red/50"
        >
          Go to Verification
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </Link>
        <Link
          href="/dashboard"
          className="text-sm text-gray-500 transition-colors hover:text-gray-300"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
