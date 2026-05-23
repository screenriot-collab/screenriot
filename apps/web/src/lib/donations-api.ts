import { fetchApi } from './api';

export interface MyDonationItem {
  id: string;
  filmId: string;
  filmTitle: string;
  filmSlug: string;
  filmStatus: string;
  amount: number;
  status: string;
  createdAt: string;
}

export async function getMyDonations(
  accessToken: string,
): Promise<MyDonationItem[]> {
  return fetchApi<MyDonationItem[]>('donations/mine', accessToken, {
    method: 'GET',
  });
}

export interface CreateCheckoutSessionParams {
  filmId: string;
  amount: number;
  successUrl: string;
  cancelUrl: string;
}

export interface CreateCheckoutSessionResponse {
  url: string;
}

export async function confirmDonationCheckout(
  sessionId: string,
  accessToken: string,
): Promise<{
  created: boolean;
  donationId: string;
  filmId: string;
  filmTitle: string;
  amount: number;
}> {
  return fetchApi('donations/confirm', accessToken, {
    method: 'POST',
    body: JSON.stringify({ sessionId }),
  });
}

export async function createCheckoutSession(
  params: CreateCheckoutSessionParams,
  accessToken: string,
): Promise<CreateCheckoutSessionResponse> {
  return fetchApi<CreateCheckoutSessionResponse>(
    'donations/checkout-session',
    accessToken,
    {
      method: 'POST',
      body: JSON.stringify({
        filmId: params.filmId,
        amount: params.amount,
        successUrl: params.successUrl,
        cancelUrl: params.cancelUrl,
      }),
    },
  );
}
