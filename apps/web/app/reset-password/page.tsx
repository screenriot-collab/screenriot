import Link from 'next/link';
import { ResetPasswordForm } from './ResetPasswordForm';

type Props = {
  searchParams: Promise<{ token?: string }>;
};

export default async function ResetPasswordPage({ searchParams }: Props) {
  const params = await searchParams;
  const token = params.token ?? '';

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-lg border border-white/10 bg-screenriot-bg-card p-6">
        <h1 className="text-xl font-semibold text-white">Set new password</h1>
        <p className="mt-1 text-sm text-screenriot-muted">
          Enter your new password below. The link from your email is required.
        </p>
        <ResetPasswordForm token={token} />
        <p className="mt-6 text-sm text-screenriot-muted">
          <Link href="/login" className="text-screenriot-accent-blue hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
