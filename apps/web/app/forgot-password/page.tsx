import Link from 'next/link';
import { ForgotPasswordForm } from './ForgotPasswordForm';

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-lg border border-white/10 bg-screenriot-bg-card p-6">
        <h1 className="text-xl font-semibold text-white">Reset password</h1>
        <p className="mt-1 text-sm text-screenriot-muted">
          Enter your email and we&apos;ll send you a link to set a new password.
        </p>
        <ForgotPasswordForm />
        <p className="mt-6 text-sm text-screenriot-muted">
          <Link href="/login" className="text-screenriot-accent-blue hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
