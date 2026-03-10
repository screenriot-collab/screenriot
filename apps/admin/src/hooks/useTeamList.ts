import { useCallback, useEffect, useState } from 'react';
import { listTeam, inviteUser, deleteUser } from '@/lib/api';
import type { AdminUser } from '@/types/users';

export function useTeamList() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listTeam();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const invite = async (username: string, email: string, role: 'admin' | 'manager') => {
    const res = await inviteUser(username, email, role);
    setUsers((prev) => [
      ...prev,
      { id: res.id, username: res.username, email: res.email, role: res.role },
    ]);
    return res.message ?? 'User created.';
  };

  const remove = async (id: string) => {
    await deleteUser(id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  return { users, loading, error, setError, invite, remove, reload };
}
