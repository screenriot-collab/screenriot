import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login, setToken, setUser } from '@/lib/api';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(username.trim(), password);
      setToken(data.access_token);
      if (data.user) setUser(data.user);
      navigate('/', { replace: true });
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-lg border border-gray-600 bg-admin-sidebar p-6 shadow-lg">
        <h1 className="mb-6 text-xl font-semibold text-white">Admin sign in</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          )}
          <div>
            <label htmlFor="username" className="mb-1 block text-sm font-medium text-gray-300">
              Username
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded border border-gray-500 bg-admin-bg px-3 py-2 text-white focus:border-admin-accent focus:outline-none focus:ring-1 focus:ring-admin-accent"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border border-gray-500 bg-admin-bg px-3 py-2 text-white focus:border-admin-accent focus:outline-none focus:ring-1 focus:ring-admin-accent"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-admin-accent py-2 font-medium text-admin-bg hover:bg-admin-accent/90 disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-400">
          <Link to="/forgot-password" className="text-admin-accent hover:underline">
            Forgot password?
          </Link>
        </p>
      </div>
    </div>
  );
}
