import { useState } from 'react';
import { useTeamList } from '@/hooks/useTeamList';
import { getCurrentUser, forgotPassword } from '@/lib/api';

export default function Mods() {
  const currentUser = getCurrentUser();
  const { users, loading, error, setError, remove } = useTeamList();
  const [resetPasswordSent, setResetPasswordSent] = useState(false);

  const mods = users.filter((u) => u.role === 'manager');

  async function handleDelete(id: string) {
    if (!window.confirm('Remove this moderator from the team?')) return;
    try {
      await remove(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  }

  async function handleResetPassword(email: string) {
    setError('');
    setResetPasswordSent(false);
    try {
      await forgotPassword(email);
      setResetPasswordSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset link');
    }
  }

  if (loading) {
    return <p className="text-gray-400">Loading…</p>;
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-white">Moderators</h1>
      <p className="mt-1 text-sm text-gray-400">List of moderators. Only admins can invite new users (see Admins).</p>

      {error && (
        <p className="mt-4 text-sm text-red-400" role="alert">{error}</p>
      )}
      {resetPasswordSent && (
        <p className="mt-4 text-sm text-green-400" role="status">
          Password reset link sent to your email.
        </p>
      )}

      <div className="mt-8 overflow-x-auto rounded-lg border border-gray-600">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-600 bg-admin-sidebar">
              <th className="p-3 font-medium text-gray-300">Username</th>
              <th className="p-3 font-medium text-gray-300">Email</th>
              <th className="p-3 font-medium text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mods.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-3 text-gray-400">No moderators yet.</td>
              </tr>
            ) : (
              mods.map((u) => (
                <tr key={u.id} className="border-b border-gray-700">
                  <td className="p-3 text-white">{u.username ?? '—'}</td>
                  <td className="p-3 text-gray-300">{u.email}</td>
                  <td className="p-3">
                    {u.id === currentUser?.id ? (
                      <button
                        type="button"
                        onClick={() => handleResetPassword(u.email)}
                        className="text-admin-accent hover:underline"
                        aria-label="Send password reset link to your email"
                      >
                        Reset password
                      </button>
                    ) : currentUser?.role === 'admin' || currentUser?.role === 'super_admin' ? (
                      <button
                        type="button"
                        onClick={() => handleDelete(u.id)}
                        className="text-red-400 hover:text-red-300"
                        aria-label={`Remove ${u.username ?? 'user'}`}
                      >
                        Remove
                      </button>
                    ) : (
                      <span className="text-gray-500" aria-hidden>—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
