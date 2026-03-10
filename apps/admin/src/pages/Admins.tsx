import { useState } from 'react';
import { useTeamList } from '@/hooks/useTeamList';
import { getCurrentUser, forgotPassword } from '@/lib/api';
import { ADMIN_ROLES } from '@/constants/films';

export default function Admins() {
  const currentUser = getCurrentUser();
  const { users, loading, error, setError, invite, remove } = useTeamList();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'manager'>('manager');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteMessage, setInviteMessage] = useState('');
  const [resetPasswordSent, setResetPasswordSent] = useState(false);

  const admins = users.filter((u) => ADMIN_ROLES.includes(u.role));

  function canRemove(targetRole: string): boolean {
    if (targetRole === 'super_admin') return false;
    const r = currentUser?.role ?? '';
    if (targetRole === 'manager') return r === 'admin' || r === 'super_admin';
    if (targetRole === 'admin') return r === 'super_admin';
    return false;
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setInviteMessage('');
    setInviteLoading(true);
    try {
      const msg = await invite(username.trim(), email.trim(), role);
      setInviteMessage(msg);
      setUsername('');
      setEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invite failed');
    } finally {
      setInviteLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Remove this user from the team?')) return;
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
      <h1 className="text-2xl font-bold text-white">Admins</h1>
      <p className="mt-1 text-sm text-gray-400">
        Invite new admins and moderators. They will receive an email with a link to set their password.
      </p>

      {error && (
        <p className="mt-4 text-sm text-red-400" role="alert">{error}</p>
      )}
      {inviteMessage && (
        <p className="mt-4 text-sm text-green-400">{inviteMessage}</p>
      )}
      {resetPasswordSent && (
        <p className="mt-4 text-sm text-green-400" role="status">
          Password reset link sent to your email.
        </p>
      )}

      <div className="mt-6 rounded-lg border border-gray-600 bg-admin-sidebar p-4">
        <h2 className="mb-3 font-semibold text-white">Invite user</h2>
        <form onSubmit={handleInvite} className="flex flex-wrap items-end gap-4">
          <div>
            <label htmlFor="invite-username" className="mb-1 block text-xs text-gray-400">Username</label>
            <input
              id="invite-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="rounded border border-gray-500 bg-admin-bg px-3 py-1.5 text-white focus:border-admin-accent focus:outline-none"
              required
            />
          </div>
          <div>
            <label htmlFor="invite-email" className="mb-1 block text-xs text-gray-400">Email</label>
            <input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded border border-gray-500 bg-admin-bg px-3 py-1.5 text-white focus:border-admin-accent focus:outline-none"
              required
            />
          </div>
          <div>
            <label htmlFor="invite-role" className="mb-1 block text-xs text-gray-400">Role</label>
            <select
              id="invite-role"
              value={role}
              onChange={(e) => setRole(e.target.value as 'admin' | 'manager')}
              className="rounded border border-gray-500 bg-admin-bg px-3 py-1.5 text-white focus:border-admin-accent focus:outline-none"
            >
              <option value="manager">Moderator</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={inviteLoading}
            className="rounded bg-admin-accent px-4 py-1.5 font-medium text-admin-bg hover:bg-admin-accent/90 disabled:opacity-50"
          >
            {inviteLoading ? 'Sending…' : 'Invite'}
          </button>
        </form>
      </div>

      <div className="mt-8 overflow-x-auto rounded-lg border border-gray-600">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-600 bg-admin-sidebar">
              <th className="p-3 font-medium text-gray-300">Username</th>
              <th className="p-3 font-medium text-gray-300">Email</th>
              <th className="p-3 font-medium text-gray-300">Role</th>
              <th className="p-3 font-medium text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((u) => (
              <tr key={u.id} className="border-b border-gray-700">
                <td className="p-3 text-white">{u.username ?? '—'}</td>
                <td className="p-3 text-gray-300">{u.email}</td>
                <td className="p-3 text-gray-300">{u.role}</td>
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
                  ) : canRemove(u.role) ? (
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
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
