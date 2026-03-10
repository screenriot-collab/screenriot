import { fetchApi } from './api';

export interface Contribution {
  id: string;
  number: string;
  filmId: string;
  userId: string;
  status: 'pending' | 'approved' | 'rejected';
  changes: Record<string, any>;
  comment?: string;
  adminComment?: string;
  createdAt: string;
  updatedAt: string;
  processedAt?: string;
  film: {
    id: string;
    title: string;
    slug: string;
  };
}

export async function fetchMyContributions(token?: string): Promise<Contribution[]> {
  const data = await fetchApi<{ contributions: Contribution[] }>('contributions/my', token, {
    cache: 'no-store',
  });
  return data.contributions;
}

export async function createContribution(
  data: { filmId: string; changes: Record<string, any>; comment?: string },
  token?: string,
): Promise<{ contribution: Contribution }> {
  return fetchApi<{ contribution: Contribution }>('contributions', token, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
