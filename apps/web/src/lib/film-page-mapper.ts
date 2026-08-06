/**
 * Maps API public film detail to FilmDetailMock for the detail page.
 * When API data exists we use only API (or minimal empty fallbacks). Mock is used only when there is no API (see page.tsx).
 */

import type { ApiPublicFilmDetail } from './films-api';
import type {
  CommunityDiscussionMock,
  FanVotingMock,
  FilmDetailMock,
  ScreenplayScoreCategory,
  ScreenplayScoreMock,
} from '@/markup/film-detail';

const EMPTY_TABBED_SECTION: FilmDetailMock['tabbedSection'] = {
  synopsis: { storySynopsis: '', whyMatters: '', budgetBreakdown: [] },
  castingVote: { title: '', subtitle: '', cast: [], tip: '' },
  production: { title: '', stages: [] },
  updates: { items: [] },
};

const EMPTY_AI_ANALYSIS: FilmDetailMock['aiAnalysis'] = {
  overallScore: 0,
  maxScore: 100,
  marketInsights: [],
  teamTalent: [],
  investmentMetrics: [],
};

const DEFAULT_FAN_VOTING_SUBTITLE =
  'Rate this project and vote for your dream cast • Voting is free';

const EMPTY_SCREENPLAY_SCORE: ScreenplayScoreMock = {
  aiOverall: 0,
  expertOverall: 0,
  categories: [],
};

function mapAiAnalysis(pc: Record<string, unknown> | undefined): FilmDetailMock['aiAnalysis'] {
  const raw = pc?.aiAnalysis as Record<string, unknown> | undefined;
  if (!raw || typeof raw !== 'object') return EMPTY_AI_ANALYSIS;
  return {
    // maxScore is a fixed display constant (always out of 100) - it's never part of the admin-editable
    // AiAnalysisForm, so it must not be read from pageContent (which never has it).
    ...EMPTY_AI_ANALYSIS,
    overallScore: typeof raw.overallScore === 'number' ? raw.overallScore : 0,
    marketInsights: Array.isArray(raw.marketInsights) ? (raw.marketInsights as FilmDetailMock['aiAnalysis']['marketInsights']) : [],
    teamTalent: Array.isArray(raw.teamTalent) ? (raw.teamTalent as FilmDetailMock['aiAnalysis']['teamTalent']) : [],
    investmentMetrics: Array.isArray(raw.investmentMetrics)
      ? (raw.investmentMetrics as FilmDetailMock['aiAnalysis']['investmentMetrics'])
      : [],
  };
}

function mapScreenplayScore(pc: Record<string, unknown> | undefined): ScreenplayScoreMock {
  const raw = pc?.screenplayScore as Record<string, unknown> | undefined;
  if (!raw || typeof raw !== 'object') return EMPTY_SCREENPLAY_SCORE;
  const categories = Array.isArray(raw.categories)
    ? raw.categories
        .map((c) => {
          const row = c as Record<string, unknown>;
          const name = typeof row.name === 'string' ? row.name.trim() : '';
          const aiScore = typeof row.aiScore === 'number' ? row.aiScore : 0;
          const expertScore = typeof row.expertScore === 'number' ? row.expertScore : 0;
          if (!name) return null;
          return { name, aiScore, expertScore } satisfies ScreenplayScoreCategory;
        })
        .filter((c): c is ScreenplayScoreCategory => c !== null)
    : [];
  return {
    aiOverall: typeof raw.aiOverall === 'number' ? raw.aiOverall : 0,
    expertOverall: typeof raw.expertOverall === 'number' ? raw.expertOverall : 0,
    categories,
  };
}

const EMPTY_COMMUNITY_DISCUSSION: CommunityDiscussionMock = {
  title: 'Community Discussion',
  subtitle: 'Join the conversation — share thoughts and reply to other fans.',
  commentPlaceholder: 'Join the discussion…',
  apiPendingNote: '',
  comments: [],
};

function mapFanVoting(pc: Record<string, unknown> | undefined): FanVotingMock {
  const raw = pc?.pledgeVoting as FanVotingMock | undefined;
  const subtitle = raw?.subtitle?.trim();
  const legacyPledge =
    subtitle?.includes('$') && subtitle.toLowerCase().includes('pledge');
  return {
    title: raw?.title?.trim() || 'Fan Voting',
    subtitle: legacyPledge || !subtitle ? DEFAULT_FAN_VOTING_SUBTITLE : subtitle,
    categories: Array.isArray(raw?.categories) ? raw.categories : [],
  };
}

function mapSampleScenes(pc: Record<string, unknown> | undefined): FilmDetailMock['sampleScenes'] {
  const raw = pc?.sampleScenes as Record<string, unknown> | undefined;
  const title =
    typeof raw?.title === 'string' && raw.title.trim() ? raw.title.trim() : 'Script Sample';
  const emptyMessage =
    typeof raw?.emptyMessage === 'string' && raw.emptyMessage.trim()
      ? raw.emptyMessage.trim()
      : typeof raw?.unlockMessage === 'string' && raw.unlockMessage.trim()
        ? raw.unlockMessage.trim()
        : 'Sample scenes will be published when the filmmaker adds them.';

  const pages: FilmDetailMock['sampleScenes']['pages'] = Array.isArray(raw?.pages)
    ? raw.pages
        .map((p, index) => {
          const row = p as Record<string, unknown>;
          const id =
            typeof row.id === 'string' && row.id.trim() ? row.id.trim() : `page-${index + 1}`;
          const pageTitle = typeof row.title === 'string' ? row.title.trim() : `Scene ${index + 1}`;
          const locked = row.locked === true;
          const content = typeof row.content === 'string' ? row.content : undefined;
          return { id, title: pageTitle, locked, content: locked ? undefined : content };
        })
        .filter((p) => p.title)
    : [];

  const freePreviewCount =
    typeof raw?.freePreviewCount === 'number'
      ? raw.freePreviewCount
      : typeof raw?.unlockedPageCount === 'number'
        ? raw.unlockedPageCount
        : 0;

  const creditsPerPage =
    typeof raw?.creditsPerPage === 'number' && raw.creditsPerPage > 0 ? raw.creditsPerPage : 1;

  const totalPages =
    typeof raw?.totalPages === 'number' && raw.totalPages > 0 ? raw.totalPages : pages.length;

  const scriptCredits =
    typeof raw?.scriptCredits === 'number' && raw.scriptCredits >= 0
      ? raw.scriptCredits
      : undefined;

  return {
    title,
    emptyMessage,
    pages,
    freePreviewCount,
    creditsPerPage,
    totalPages,
    scriptCredits,
  };
}

function mapMediaLabels(pc: Record<string, unknown> | undefined): {
  trailer: string;
  poster: string;
} {
  const raw = pc?.mediaLabels as { trailer?: string; poster?: string } | undefined;
  return {
    trailer:
      typeof raw?.trailer === 'string' && raw.trailer.trim()
        ? raw.trailer.trim()
        : 'Official Trailer',
    poster:
      typeof raw?.poster === 'string' && raw.poster.trim()
        ? raw.poster.trim()
        : 'Film Poster',
  };
}

function mapCommunityDiscussion(
  pc: Record<string, unknown> | undefined,
): CommunityDiscussionMock {
  const raw = pc?.communityDiscussion as Partial<CommunityDiscussionMock> | undefined;
  return {
    title: raw?.title?.trim() || EMPTY_COMMUNITY_DISCUSSION.title,
    subtitle: raw?.subtitle?.trim() || EMPTY_COMMUNITY_DISCUSSION.subtitle,
    commentPlaceholder:
      raw?.commentPlaceholder?.trim() || EMPTY_COMMUNITY_DISCUSSION.commentPlaceholder,
    apiPendingNote: '',
    comments: [],
  };
}

export function apiFilmToFilmDetailMock(
  api: ApiPublicFilmDetail,
  _defaultMock: FilmDetailMock,
): FilmDetailMock {
  const pc = api.pageContent as Record<string, unknown> | undefined;
  const mediaLabels = mapMediaLabels(pc);
  const hasVideo = Boolean(api.videoUrl);
  const tags = Array.isArray(pc?.tags) ? (pc.tags as string[]) : [];
  const genre = api.genre?.trim() || undefined;

  return {
    slug: api.slug,
    tags: tags.length > 0 ? tags : genre ? [genre] : [],
    title: api.title ?? '',
    logline: api.logline?.trim() || api.synopsis?.trim() || '',
    synopsis: api.synopsis ?? '',
    genre,
    runtime: api.runtime?.trim() || undefined,
    rating: api.rating?.trim() || undefined,
    directorName: api.directorName ?? '',
    directorAvatarUrl: api.directorAvatarUrl,
    posterImageUrl: api.posterImageUrl ?? api.posterUrl,
    videoUrl: api.videoUrl,
    videoLabel: hasVideo ? mediaLabels.trailer : mediaLabels.poster,
    videoRestrictedMessage: 'This video is not available for this project.',
    hasAiMarketScore: api.hasAiMarketScore ?? false,
    hasScreenplayScore: api.hasScreenplayScore ?? false,
    screenplayScore: mapScreenplayScore(pc),
    hasCommunityScore: api.hasCommunityScore ?? false,
    aiAnalysis: mapAiAnalysis(pc),
    similarFilms: (Array.isArray(pc?.similarFilms) ? pc.similarFilms : []) as FilmDetailMock['similarFilms'],
    fanVoting: mapFanVoting(pc),
    treatment: (pc?.treatment as FilmDetailMock['treatment']) ?? { act1: '', act2: '' },
    mainCharacters: (Array.isArray(pc?.mainCharacters) ? pc.mainCharacters : []) as FilmDetailMock['mainCharacters'],
    keyCrew: (Array.isArray(pc?.keyCrew) ? pc.keyCrew : []) as FilmDetailMock['keyCrew'],
    keyCrewVisible: pc?.keyCrewVisible === true,
    sampleScenes: mapSampleScenes(pc),
    rateStory: (pc?.rateStory as FilmDetailMock['rateStory']) ?? {
      title: 'Rate the Story & Characters',
      subtitle: '',
      categories: [],
      thoughtsPlaceholder: 'Share your thoughts about the story, characters, or script…',
    },
    communityDiscussion: mapCommunityDiscussion(pc),
    tabbedSection: (pc?.tabbedSection as FilmDetailMock['tabbedSection']) ?? EMPTY_TABBED_SECTION,
    sidebar: {
      pledged: api.sidebar.pledged,
      goal: api.sidebar.goal,
      investorsCount: api.sidebar.investorsCount,
      daysLeft: api.sidebar.daysLeft ?? 0,
      averageScore:
        api.hasCommunityScore && api.communityAverageScore != null
          ? api.communityAverageScore
          : api.sidebar.averageScore ?? 0,
      votesCount: api.sidebar.votesCount ?? 0,
      trendingText: api.sidebar.trendingText ?? '',
      tiers: Array.isArray(api.sidebar.tiers) ? (api.sidebar.tiers as FilmDetailMock['sidebar']['tiers']) : [],
    },
    communityReviews: Array.isArray(api.communityReviews) ? api.communityReviews : [],
  };
}
