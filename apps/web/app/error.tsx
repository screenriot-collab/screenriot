'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error('[GlobalError]', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <h1 className="text-3xl font-bold text-white">Something went wrong</h1>
      <p className="mt-3 max-w-md text-screenriot-muted">
        An unexpected error occurred. Please try again or return to the home page.
      </p>
      <div className="mt-6 flex gap-4">
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-screenriot-accent-blue px-5 py-2.5 font-medium text-white hover:bg-screenriot-accent-blue/90 focus:outline-none focus:ring-2 focus:ring-screenriot-accent-blue focus:ring-offset-2 focus:ring-offset-screenriot-bg"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-lg border border-white/20 px-5 py-2.5 font-medium text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-screenriot-bg"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
