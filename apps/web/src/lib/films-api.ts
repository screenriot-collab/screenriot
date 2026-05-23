/**
 * Films API client. Maps NestJS responses to app types.
 */

import { fetchApi, getApiUrl } from './api';
import {
  normalizeKeyCastMember,
  normalizeWishListCast,
  emptyKeyCastMember,
} from '@/lib/cast-members';
import type { FilmListItem, ProjectFormDataFromApi } from '@/markup/films';
import type { PlaceholderFilm } from '@/markup/home';

/** API list item (GET /films) */
export interface ApiFilmListItem {
  id: string;
  slug: string;
  title: string;
  status: string;
  reviewStatus: string | null;
  submissionFeePaid: boolean;
  pagePublished: boolean;
  filmmakerId: string;
  filmmaker: { id: string; email: string };
}

/** API film full (GET /films/:id) */
export interface ApiFilm {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  goalAmount: string | number;
  currentAmount: string | number;
  status: string;
  deadline: string | null;
  pagePublished: boolean;
  posterKey: string | null;
  posterUrl: string | null;
  reviewStatus: string | null;
  submissionFeePaid: boolean;
  logline: string | null;
  synopsis: string | null;
  genre: string | null;
  runtime: string | null;
  rating: string | null;
  directorName: string | null;
  screenplayKey: string | null;
  videoKey: string | null;
  chainOfTitleKey: string | null;
  step3: unknown;
  step4: unknown;
  reviewComments: unknown;
  filmmakerId: string;
  createdAt: string;
  updatedAt: string;
}

function mapListItem(api: ApiFilmListItem): FilmListItem {
  return {
    id: api.id,
    slug: api.slug,
    title: api.title,
    createdBy: api.filmmaker?.email ?? '',
    verificationStatus: api.status as FilmListItem['verificationStatus'],
    paymentStatus: api.submissionFeePaid ? 'paid' : 'unpaid',
    pagePublished: api.pagePublished,
    reviewStatus: (api.reviewStatus as FilmListItem['reviewStatus']) ?? undefined,
  };
}

/** Map API film to form data for SubmitProjectWizard. Normalizes legacy step3 shapes. */
export function apiFilmToFormData(api: ApiFilm): ProjectFormDataFromApi {
  const rawStep3 = api.step3 as Record<string, unknown> | null;
  const step4 = api.step4 as ProjectFormDataFromApi['step4'] | null;
  const step3: ProjectFormDataFromApi['step3'] | undefined = rawStep3
    ? {
        cast: (Array.isArray(rawStep3.cast) ? rawStep3.cast : []).map((c) => {
          const row = normalizeKeyCastMember((c ?? {}) as Record<string, unknown>);
          const actorEmail = row.actorEmail;
          const actorName =
            row.actorName || (/@/.test(actorEmail) ? '' : actorEmail);
          return { ...row, actorName, actorEmail };
        }),
        crew: (rawStep3.crew ?? []) as NonNullable<ProjectFormDataFromApi['step3']>['crew'],
        wishListCast: normalizeWishListCast(rawStep3.wishListCast),
      }
    : undefined;
  if (step3 && step3.cast.length === 0) {
    step3.cast = [emptyKeyCastMember()];
  }
  return {
    step1: {
      filmTitle: api.title ?? '',
      logline: api.logline ?? '',
      synopsis: api.synopsis ?? api.description ?? '',
      genre: api.genre ?? '',
      runtime: api.runtime ?? '',
      rating: api.rating ?? '',
      directorName: api.directorName ?? '',
    },
    step2: {
      screenplayFileName: api.screenplayKey ? api.screenplayKey.split('/').pop() ?? undefined : undefined,
      posterFileName: api.posterKey ? api.posterKey.split('/').pop() ?? undefined : undefined,
      videoFileName: api.videoKey ? api.videoKey.split('/').pop() ?? undefined : undefined,
    },
    step3,
    step4: step4 ?? undefined,
    step5: {
      agreeTerms: false,
      agreeAgreement: false,
      currency: 'USD',
      chainOfTitleFileName: api.chainOfTitleKey ? api.chainOfTitleKey.split('/').pop() ?? undefined : undefined,
    },
  };
}

export async function fetchFilms(accessToken: string | undefined): Promise<FilmListItem[]> {
  const data = await fetchApi<{ films: ApiFilmListItem[] }>(`films`, accessToken, { method: 'GET' });
  return data.films.map(mapListItem);
}

export async function fetchFilmById(
  id: string,
  accessToken: string | undefined,
): Promise<ApiFilm | null> {
  try {
    const data = await fetchApi<{ film: ApiFilm }>(`films/${id}`, accessToken, { method: 'GET' });
    return data.film;
  } catch {
    return null;
  }
}

export async function checkSlug(
  slug: string,
  accessToken: string | undefined,
  excludeFilmId?: string,
): Promise<{ available: boolean }> {
  const params = new URLSearchParams({ slug });
  if (excludeFilmId) params.set('excludeFilmId', excludeFilmId);
  return fetchApi<{ available: boolean }>(`films/check-slug?${params}`, accessToken);
}

export interface CreateFilmBody {
  title: string;
  logline?: string;
  synopsis?: string;
  genre?: string;
  runtime?: string;
  rating?: string;
  directorName?: string;
  goalAmount?: number;
}

export async function createFilm(
  body: CreateFilmBody,
  accessToken: string | undefined,
): Promise<ApiFilm> {
  const data = await fetchApi<{ film: ApiFilm }>('films', accessToken, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return data.film;
}

export interface UpdateFilmBody {
  title?: string;
  logline?: string;
  synopsis?: string;
  description?: string;
  genre?: string;
  runtime?: string;
  rating?: string;
  directorName?: string;
  goalAmount?: number;
  step3?: unknown;
  step4?: unknown;
  submissionFeePaid?: boolean;
}

export async function updateFilm(
  id: string,
  body: UpdateFilmBody,
  accessToken: string | undefined,
): Promise<ApiFilm> {
  const data = await fetchApi<{ film: ApiFilm }>(`films/${id}`, accessToken, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
  return data.film;
}

export async function createSubmissionFeeCheckoutSession(
  filmId: string,
  successUrl: string,
  cancelUrl: string,
  accessToken: string | undefined,
): Promise<{ url: string }> {
  return fetchApi<{ url: string }>(`films/${filmId}/pay/checkout`, accessToken, {
    method: 'POST',
    body: JSON.stringify({ successUrl, cancelUrl }),
  });
}

export async function confirmSubmissionFeePayment(
  filmId: string,
  sessionId: string,
  accessToken: string | undefined,
): Promise<ApiFilm> {
  const data = await fetchApi<{ film: ApiFilm }>(
    `films/${filmId}/pay/confirm`,
    accessToken,
    {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    },
  );
  return data.film;
}

export async function deleteFilm(
  id: string,
  accessToken: string | undefined,
): Promise<void> {
  await fetchApi(`films/${id}`, accessToken, { method: 'DELETE' });
}

// --- Public film page API (no auth) ---

/** Card item from GET /films/public */
export interface ApiPublicFilmCard {
  id: string;
  slug: string;
  title: string;
  genre?: string;
  director?: string;
  synopsis?: string;
  goalAmount: number;
  raised: number;
  progress: number;
  investors: number;
  votes: number;
  daysLeft?: number;
  rating?: number;
  posterUrl?: string;
  aiMarketScore?: number;
  predictedROI?: string;
  hasCommunityScore: boolean;
  hasAiMarketScore: boolean;
  hasPredictedRoi: boolean;
}

export interface PublicFilmsListResponse {
  films: ApiPublicFilmCard[];
  total: number;
  page: number;
  limit: number;
}

/** Film page detail from GET /films/slug/:slug */
export interface ApiPublicFilmDetail {
  id: string;
  slug: string;
  title: string;
  logline?: string;
  synopsis?: string;
  runtime?: string;
  directorName?: string;
  directorAvatarUrl?: string;
  genre?: string;
  goalAmount: number;
  currentAmount: number;
  deadline?: string;
  posterUrl?: string;
  posterImageUrl?: string;
  videoUrl?: string;
  posterKey?: string;
  videoKey?: string;
  rating?: string;
  cachedVotesCount?: number;
  cachedAverageScore?: number;
  trendingText?: string;
  hasAiMarketScore?: boolean;
  aiMarketScore?: number;
  hasCommunityScore?: boolean;
  communityAverageScore?: number;
  hasScreenplayScore?: boolean;
  pageContent?: Record<string, unknown>;
  investorsCount: number;
  daysLeft?: number | null;
  progressPercent: number;
  sidebar: {
    pledged: number;
    goal: number;
    investorsCount: number;
    daysLeft?: number;
    averageScore?: number;
    votesCount: number;
    trendingText?: string;
    tiers: unknown[];
  };
  communityReviews?: {
    id: string;
    authorName: string;
    authorInitials: string;
    rating: number;
    reviewText: string | null;
    createdAt: string;
  }[];
}

/** Map API card to card view shape for FilmCard (slug, posterUrl from API). */
export function apiCardToPlaceholder(
  api: ApiPublicFilmCard,
): PlaceholderFilm & {
  slug?: string;
  posterUrl?: string;
  aiMarketScore?: number;
  predictedROI?: string;
  hasCommunityScore: boolean;
  hasAiMarketScore: boolean;
  hasPredictedRoi: boolean;
} {
  return {
    id: api.id,
    slug: api.slug,
    title: api.title,
    genre: api.genre ?? '',
    rating: api.hasCommunityScore ? (api.rating ?? 0) : 0,
    progress: api.progress,
    goal: 100,
    raised: api.raised,
    goalAmount: api.goalAmount,
    director: api.director ?? '',
    synopsis: api.synopsis ?? '',
    investors: api.investors,
    votes: api.votes,
    daysLeft: api.daysLeft ?? 0,
    posterUrl: api.posterUrl,
    aiMarketScore: api.hasAiMarketScore ? api.aiMarketScore : undefined,
    predictedROI: api.hasPredictedRoi ? api.predictedROI : undefined,
    hasCommunityScore: api.hasCommunityScore ?? false,
    hasAiMarketScore: api.hasAiMarketScore ?? false,
    hasPredictedRoi: api.hasPredictedRoi ?? false,
  };
}

/** Fetch public list with pagination and filters (no auth) */
export async function fetchPublicFilmsList(params?: {
  page?: number;
  limit?: number;
  genre?: string;
  search?: string;
}): Promise<PublicFilmsListResponse> {
  const q = new URLSearchParams();
  if (params?.page != null) q.set('page', String(params.page));
  if (params?.limit != null) q.set('limit', String(params.limit));
  if (params?.genre) q.set('genre', params.genre);
  if (params?.search) q.set('search', params.search);
  const url = `films/public${q.toString() ? `?${q}` : ''}`;
  return fetchApi<PublicFilmsListResponse>(url, undefined, { method: 'GET' });
}

/** Fetch film page by slug for detail view (optional auth for script unlocks). */
export async function fetchFilmPageBySlug(
  slug: string,
  accessToken?: string,
): Promise<ApiPublicFilmDetail | null> {
  try {
    const data = await fetchApi<{ film: ApiPublicFilmDetail }>(
      `films/slug/${encodeURIComponent(slug)}`,
      accessToken,
      { method: 'GET' },
    );
    return data.film;
  } catch {
    return null;
  }
}

export async function unlockScriptPage(
  filmId: string,
  pageId: string,
  accessToken: string,
): Promise<{ page: { id: string; title: string; content: string }; scriptCredits: number }> {
  return fetchApi(`films/${filmId}/script-sample/unlock`, accessToken, {
    method: 'POST',
    body: JSON.stringify({ pageId }),
  });
}

export async function createScriptCreditsCheckout(
  successUrl: string,
  cancelUrl: string,
  accessToken: string,
): Promise<{ url: string }> {
  return fetchApi('films/script-credits/checkout', accessToken, {
    method: 'POST',
    body: JSON.stringify({ successUrl, cancelUrl }),
  });
}

export async function confirmScriptCreditsPurchase(
  sessionId: string,
  accessToken: string,
): Promise<{ credited: boolean; creditsAdded: number; scriptCredits: number }> {
  return fetchApi('films/script-credits/confirm', accessToken, {
    method: 'POST',
    body: JSON.stringify({ sessionId }),
  });
}

const FILE_SLOTS = ['screenplay', 'poster', 'teaser', 'chain-of-title'] as const;

export async function uploadFilmFile(
  filmId: string,
  slot: (typeof FILE_SLOTS)[number],
  file: File,
  accessToken: string | undefined,
): Promise<{ key: string; url: string }> {
  const url = getApiUrl(`films/${filmId}/files/${slot}`);
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(url, {
    method: 'POST',
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    body: form,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Upload failed: ${res.status}`);
  }
  return res.json();
}

export async function createCastingSuggestion(
  filmId: string,
  actorName: string,
  accessToken: string,
  roleHint?: string,
): Promise<{ id: string; actorName: string; status: string; createdAt: string }> {
  return fetchApi(`films/${filmId}/casting-suggestions`, accessToken, {
    method: 'POST',
    body: JSON.stringify({ actorName, roleHint }),
  });
}

export async function createCastingVote(
  filmId: string,
  optionId: string,
  accessToken: string | undefined,
): Promise<{ ok: boolean }> {
  return fetchApi<{ ok: boolean }>(`films/${filmId}/casting-vote`, accessToken, {
    method: 'POST',
    body: JSON.stringify({ optionId }),
  });
}

export async function fetchMyCastingVotes(
  filmId: string,
  accessToken: string | undefined,
): Promise<{ optionIds: string[] }> {
  return fetchApi<{ optionIds: string[] }>(`films/${filmId}/casting-vote/my`, accessToken, {
    method: 'GET',
  });
}

/** Free fan ratings (legacy route name / DB: FilmPledgeVote). Not a paid voting pledge. */
export async function createPledgeVote(
  filmId: string,
  scores: Record<string, number>,
  accessToken: string | undefined,
  reviewText?: string,
): Promise<{ ok: boolean }> {
  const body: { scores: Record<string, number>; reviewText?: string } = { scores };
  const trimmed = reviewText?.trim();
  if (trimmed) body.reviewText = trimmed;
  return fetchApi<{ ok: boolean }>(`films/${filmId}/pledge-vote`, accessToken, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function fetchMyPledgeVote(
  filmId: string,
  accessToken: string | undefined,
): Promise<{ scores: Record<string, number> | null; reviewText: string | null }> {
  const data = await fetchApi<{ scores: Record<string, number> | null; reviewText?: string | null }>(
    `films/${filmId}/pledge-vote/my`,
    accessToken,
    { method: 'GET' },
  );
  return { scores: data.scores ?? null, reviewText: data.reviewText ?? null };
}

export type DiscussionSort = 'top' | 'new' | 'trending';

export type DiscussionComment = {
  id: string;
  author: string;
  authorInitials: string;
  content: string;
  upvotes: number;
  createdAt: string;
  isRoot: boolean;
  hasUpvoted: boolean;
  replies: DiscussionComment[];
};

export async function fetchFilmDiscussion(
  filmId: string,
  params: { sort?: DiscussionSort; page?: number; limit?: number },
  accessToken?: string,
): Promise<{
  comments: DiscussionComment[];
  total: number;
  page: number;
  sort: DiscussionSort;
}> {
  const q = new URLSearchParams();
  if (params.sort) q.set('sort', params.sort);
  if (params.page) q.set('page', String(params.page));
  if (params.limit) q.set('limit', String(params.limit));
  const suffix = q.toString() ? `?${q.toString()}` : '';
  return fetchApi(`films/${filmId}/discussion${suffix}`, accessToken, { method: 'GET' });
}

export async function createDiscussionComment(
  filmId: string,
  body: string,
  accessToken: string,
  parentId?: string,
): Promise<{ id: string; rootId: string }> {
  return fetchApi(`films/${filmId}/discussion`, accessToken, {
    method: 'POST',
    body: JSON.stringify({ body, parentId }),
  });
}

export async function toggleDiscussionUpvote(
  filmId: string,
  commentId: string,
  accessToken: string,
): Promise<{ upvoted: boolean; upvotes: number }> {
  return fetchApi(`films/${filmId}/discussion/${commentId}/upvote`, accessToken, {
    method: 'POST',
  });
}
