/**
 * Call NestJS API with session access token.
 * Use from server: pass session.accessToken; from client: useSession().data?.accessToken.
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export function getApiUrl(path: string): string {
  return `${API_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

export async function fetchApi<T>(
  path: string,
  accessToken: string | undefined,
  init?: RequestInit,
): Promise<T> {
  const url = getApiUrl(path);
  const isFormData = typeof init?.body !== 'undefined' && init.body instanceof FormData;
  const res = await fetch(url, {
    ...init,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text ? `API ${res.status}: ${text}` : `API ${res.status}: ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}
