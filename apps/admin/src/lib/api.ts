import type { AdminUser } from '@/types/users';
import type {
  AdminFilmDetail,
  AdminFilmListItem,
  FilmsListResponse,
  FilmPageUpdate,
} from '@/types/films';
import type { SiteUsersListResponse, SiteUserDetail, VerificationDocument } from '@/types/site-users';
import type { DashboardStats } from '@/types/dashboard';

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) || '/api';

function getToken(): string | null {
  return localStorage.getItem('admin_token');
}

const ADMIN_USER_KEY = 'admin_user';

export function setToken(token: string) {
  localStorage.setItem('admin_token', token);
}

export function setUser(user: { id: string; email: string; role: string; username?: string }) {
  localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
}

export function clearToken() {
  localStorage.removeItem('admin_token');
  localStorage.removeItem(ADMIN_USER_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

/** Current user from stored login response or JWT decode. Prefer stored user so username is always available. */
export function getCurrentUser(): { id: string; email: string; role: string; username?: string } | null {
  const token = getToken();
  if (!token) return null;
  try {
    const stored = localStorage.getItem(ADMIN_USER_KEY);
    if (stored) {
      const user = JSON.parse(stored) as { id: string; email: string; role: string; username?: string };
      const payload = JSON.parse(atob(token.split('.')[1] ?? ''));
      if (user.id === payload.sub) return user;
    }
    const payload = JSON.parse(atob(token.split('.')[1] ?? ''));
    const sub = payload.sub;
    if (!sub) return null;
    return {
      id: sub,
      email: payload.email ?? '',
      role: payload.role ?? '',
      username: payload.username ?? undefined,
    };
  } catch {
    return null;
  }
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    clearToken();
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? res.statusText ?? 'Request failed');
  }
  return res.json();
}

// --- Auth ---

export async function login(username: string, password: string) {
  return api<{ access_token: string; user: { id: string; email: string; role: string } }>(
    '/admin/auth/login',
    { method: 'POST', body: JSON.stringify({ username, password }) },
  );
}

export async function forgotPassword(email: string) {
  return api<{ message: string }>('/admin/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(token: string, newPassword: string) {
  return api<{ ok: boolean }>('/admin/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
  });
}

export async function acceptInvite(token: string, password: string) {
  return api<{ ok: boolean }>('/admin/auth/accept-invite', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  });
}

// --- Team ---

export async function listTeam(): Promise<AdminUser[]> {
  const data = await api<{ users: AdminUser[] }>('/admin/users');
  return data.users;
}

export async function inviteUser(username: string, email: string, role: 'admin' | 'manager') {
  return api<{ id: string; username: string; email: string; role: string; message: string }>(
    '/admin/users/invite',
    { method: 'POST', body: JSON.stringify({ username, email, role }) },
  );
}

export async function deleteUser(id: string) {
  return api<{ ok: boolean }>(`/admin/users/${id}`, { method: 'DELETE' });
}

// --- Dashboard stats ---

export async function getDashboardStats(): Promise<DashboardStats> {
  return api<DashboardStats>('/admin/stats');
}

// --- Films ---

export async function listFilms(params?: {
  status?: string;
  published?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<FilmsListResponse> {
  const q = new URLSearchParams();
  if (params?.status) q.set('status', params.status);
  if (params?.published === true) q.set('published', 'true');
  if (params?.search) q.set('search', params.search);
  if (params?.page) q.set('page', String(params.page));
  if (params?.limit) q.set('limit', String(params.limit));
  const suffix = q.toString() ? `?${q.toString()}` : '';
  return api<FilmsListResponse>(`/admin/films${suffix}`);
}

export async function getFilm(id: string): Promise<AdminFilmDetail> {
  return api<AdminFilmDetail>(`/admin/films/${id}`);
}

export async function updateFilmReview(
  id: string,
  body: { status?: string; reviewStatus?: string; reviewComments?: Record<string, unknown> },
) {
  return api<{ film: AdminFilmListItem }>(`/admin/films/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function updateFilmPage(id: string, body: FilmPageUpdate) {
  return api<{ film: AdminFilmListItem }>(`/admin/films/${id}/page`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

/** Upload poster or teaser for film page. Same storage path as application; overwrites. */
export async function uploadFilmPageFile(
  id: string,
  slot: 'poster' | 'teaser',
  file: File,
): Promise<{ key: string; url: string }> {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API_BASE}/admin/films/${id}/files/${slot}`, {
    method: 'POST',
    headers,
    body: form,
  });
  if (res.status === 401) {
    clearToken();
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? res.statusText ?? 'Upload failed');
  }
  return res.json();
}

// --- Site Users ---

export async function listSiteUsers(params?: {
  role?: string;
  verificationStatus?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<SiteUsersListResponse> {
  const q = new URLSearchParams();
  if (params?.role) q.set('role', params.role);
  if (params?.verificationStatus) q.set('verificationStatus', params.verificationStatus);
  if (params?.search) q.set('search', params.search);
  if (params?.page) q.set('page', String(params.page));
  if (params?.limit) q.set('limit', String(params.limit));
  const suffix = q.toString() ? `?${q.toString()}` : '';
  return api<SiteUsersListResponse>(`/admin/site-users${suffix}`);
}

export async function getSiteUser(id: string): Promise<SiteUserDetail> {
  const data = await api<{ user: SiteUserDetail }>(`/admin/site-users/${id}`);
  return data.user;
}

export async function updateSiteUser(
  id: string,
  body: Record<string, unknown>,
): Promise<SiteUserDetail> {
  const data = await api<{ user: SiteUserDetail }>(`/admin/site-users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
  return data.user;
}

// --- Verification (admin review) ---

export async function reviewVerification(
  verificationId: string,
  body: { action: 'approve' | 'reject'; adminFeedback?: string },
) {
  return api<{ verification: { id: string; status: string; documents: VerificationDocument[] } }>(
    `/admin/verifications/${verificationId}`,
    { method: 'PATCH', body: JSON.stringify(body) },
  );
}

export async function reviewDocument(
  verificationId: string,
  docId: string,
  body: { action: 'approve' | 'reject'; adminComment?: string },
) {
  return api<{ verification: { id: string; status: string; documents: VerificationDocument[] } }>(
    `/admin/verifications/${verificationId}/documents/${docId}`,
    { method: 'PATCH', body: JSON.stringify(body) },
  );
}

// --- Reports: Films with investments ---

export interface FilmWithInvestments {
  filmId: string;
  title: string;
  slug: string;
  status: string;
  totalRaised: number;
  investorsCount: number;
  lastDonationAt: string | null;
}

export interface FilmDonationRow {
  id: string;
  userId: string;
  amount: number;
  status: string;
  createdAt: string;
  userEmail?: string;
}

export async function getFilmsWithInvestments(params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{ films: FilmWithInvestments[]; total: number }> {
  const q = new URLSearchParams();
  if (params?.status) q.set('status', params.status);
  if (params?.page) q.set('page', String(params.page));
  if (params?.limit) q.set('limit', String(params.limit));
  const suffix = q.toString() ? `?${q.toString()}` : '';
  return api<{ films: FilmWithInvestments[]; total: number }>(
    `/admin/reports/investments${suffix}`,
  );
}

export async function getFilmDonations(filmId: string): Promise<FilmDonationRow[]> {
  return api<FilmDonationRow[]>(`/admin/reports/investments/${filmId}/donations`);
}

// --- Contributions ---
import type { ContributionsListResponse } from '@/types/contributions';

export async function listContributions(params?: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<ContributionsListResponse> {
  const q = new URLSearchParams();
  if (params?.status) q.set('status', params.status);
  if (params?.search) q.set('search', params.search);
  if (params?.page) q.set('page', String(params.page));
  if (params?.limit) q.set('limit', String(params.limit));
  const suffix = q.toString() ? `?${q.toString()}` : '';
  return api<ContributionsListResponse>(`/admin/contributions${suffix}`);
}

export async function approveContribution(id: string): Promise<{ ok: boolean }> {
  return api<{ ok: boolean }>(`/admin/contributions/${id}/approve`, {
    method: 'PATCH',
  });
}

export async function rejectContribution(id: string, adminComment: string): Promise<{ ok: boolean }> {
  return api<{ ok: boolean }>(`/admin/contributions/${id}/reject`, {
    method: 'PATCH',
    body: JSON.stringify({ adminComment }),
  });
}

