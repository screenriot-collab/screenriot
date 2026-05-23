import { fetchApi } from './api';

export async function getMyScriptCredits(accessToken: string): Promise<number> {
  const res = await fetchApi<{ scriptCredits: number }>('users/me/script-credits', accessToken, {
    cache: 'no-store',
  });
  return res.scriptCredits;
}
