import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '@/lib/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-lg border border-gray-600 bg-admin-sidebar p-6 text-center">
          <p className="text-gray-300">
            If an admin account exists with this email, you will receive a reset link.
          </p>
          <Link to="/login" className="mt-4 inline-block text-admin-accent hover:underline">
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-lg border border-gray-600 bg-admin-sidebar p-6">
        <h1 className="mb-6 text-xl font-semibold text-white">Reset password</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          )}
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-300">
              Email (for reset link)
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border border-gray-500 bg-admin-bg px-3 py-2 text-white focus:border-admin-accent focus:outline-none focus:ring-1 focus:ring-admin-accent"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-admin-accent py-2 font-medium text-admin-bg hover:bg-admin-accent/90 disabled:opacity-50"
          >
            {loading ? 'Sending…' : 'Send reset link'}
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
