import { useCallback, useEffect, useState } from 'react';
import { listSiteUsers } from '@/lib/api';
import type { SiteUser } from '@/types/site-users';
import { USERS_PAGE_SIZE, USER_TABS, VERIFICATION_TABS } from '@/constants/site-users';

export function useUsersList() {
  const [roleTab, setRoleTab] = useState('all');
  const [verificationTab, setVerificationTab] = useState('all');
  const [search, setSearch] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [users, setUsers] = useState<SiteUser[]>([]);
  const [total, setTotal] = useState(0);

  const totalPages = Math.max(1, Math.ceil(total / USERS_PAGE_SIZE));

  const reload = useCallback(
    async (p: number, role: string, vStatus: string, searchStr: string) => {
      setLoading(true);
      setError('');
      try {
        const roleFilter = USER_TABS.find((t) => t.id === role)?.role;
        const verFilter = VERIFICATION_TABS.find((t) => t.id === vStatus)?.status;
        const res = await listSiteUsers({
          role: roleFilter,
          verificationStatus: verFilter,
          search: searchStr || undefined,
          page: p,
          limit: USERS_PAGE_SIZE,
        });
        setUsers(res.users);
        setTotal(res.total);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void reload(page, roleTab, verificationTab, submittedSearch);
  }, [page, roleTab, verificationTab, submittedSearch, reload]);

  function changeRoleTab(tabId: string) {
    setRoleTab(tabId);
    setPage(1);
  }

  function changeVerificationTab(tabId: string) {
    setVerificationTab(tabId);
    setPage(1);
  }

  function submitSearch() {
    setSubmittedSearch(search.trim());
    setPage(1);
  }

  function clearSearch() {
    setSearch('');
    setSubmittedSearch('');
    setPage(1);
  }

  return {
    users,
    loading,
    error,
    roleTab,
    verificationTab,
    search,
    submittedSearch,
    page,
    total,
    totalPages,
    setSearch,
    setPage,
    changeRoleTab,
    changeVerificationTab,
    submitSearch,
    clearSearch,
  };
}
