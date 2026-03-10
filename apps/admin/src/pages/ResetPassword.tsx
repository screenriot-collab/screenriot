import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { resetPassword } from '@/lib/api';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) {
      setError('Missing or invalid reset link.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Invalid or expired reset link. Request a new one from the sign-in page.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-lg border border-gray-600 bg-admin-sidebar p-6 text-center">
          <p className="text-sm text-red-400" role="alert">
            Invalid or missing reset link. Please use the link from your email.
          </p>
          <Link to="/login" className="mt-4 inline-block text-admin-accent hover:underline">
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-lg border border-gray-600 bg-admin-sidebar p-6 text-center">
          <p className="text-sm text-gray-300" role="status">
            Password updated. You can now sign in with your new password.
          </p>
          <Link to="/login" className="mt-4 inline-block text-admin-accent hover:underline">
            Go to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-lg border border-gray-600 bg-admin-sidebar p-6">
        <h1 className="mb-2 text-xl font-semibold text-white">Set new password</h1>
        <p className="mb-4 text-sm text-gray-400">
          Enter your new password below. The link from your email is required.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          )}
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-300">
              New password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border border-gray-500 bg-admin-bg px-3 py-2 text-white focus:border-admin-accent focus:outline-none focus:ring-1 focus:ring-admin-accent"
              required
              minLength={8}
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded bg-admin-accent py-2 font-medium text-admin-bg hover:bg-admin-accent/90 disabled:opacity-50"
          >
            {submitting ? 'Updating…' : 'Update password'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-400">
          <Link to="/login" className="text-admin-accent hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
