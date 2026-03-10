import Link from 'next/link';
import { VerifyEmailClient } from './VerifyEmailClient';

type Props = {
  searchParams: Promise<{ token?: string }>;
};

export default async function VerifyEmailPage({ searchParams }: Props) {
  const params = await searchParams;
  const token = params.token ?? '';

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-lg border border-white/10 bg-screenriot-bg-card p-6 text-center">
        <h1 className="text-xl font-semibold text-white">Confirm your email</h1>
        <VerifyEmailClient token={token} />
        <p className="mt-6 text-sm text-screenriot-muted">
          <Link href="/profile" className="text-screenriot-accent-blue hover:underline">
            Back to profile
          </Link>
          {' · '}
          <Link href="/" className="text-screenriot-accent-blue hover:underline">
            Home
          </Link>
        </p>
      </div>
    </main>
  );
}
