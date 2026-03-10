/**
 * Maps API public film detail to FilmDetailMock for the detail page.
 * When API data exists we use only API (or minimal empty fallbacks). Mock is used only when there is no API (see page.tsx).
 */

import type { ApiPublicFilmDetail } from './films-api';
import type { FilmDetailMock } from '@/markup/film-detail';

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

export function apiFilmToFilmDetailMock(
  api: ApiPublicFilmDetail,
  _defaultMock: FilmDetailMock,
): FilmDetailMock {
  const pc = api.pageContent as Record<string, unknown> | undefined;
  return {
    slug: api.slug,
    tags: (Array.isArray(pc?.tags) ? pc.tags as string[] : []) as string[],
    title: api.title ?? '',
    synopsis: api.synopsis ?? '',
    directorName: api.directorName ?? '',
    directorAvatarUrl: api.directorAvatarUrl,
    posterImageUrl: api.posterImageUrl ?? api.posterUrl,
    videoUrl: api.videoUrl,
    videoLabel: '',
    videoRestrictedMessage: '',
    aiAnalysis: (pc?.aiAnalysis as FilmDetailMock['aiAnalysis']) ?? EMPTY_AI_ANALYSIS,
    similarFilms: (Array.isArray(pc?.similarFilms) ? pc.similarFilms : []) as FilmDetailMock['similarFilms'],
    pledgeVoting: (pc?.pledgeVoting as FilmDetailMock['pledgeVoting']) ?? {
      title: 'Pledge-Based Voting',
      pledgeAmount: 25,
      subtitle: '',
      categories: [],
    },
    treatment: (pc?.treatment as FilmDetailMock['treatment']) ?? { act1: '', act2: '' },
    mainCharacters: (Array.isArray(pc?.mainCharacters) ? pc.mainCharacters : []) as FilmDetailMock['mainCharacters'],
    sampleScenes: (pc?.sampleScenes as FilmDetailMock['sampleScenes']) ?? {
      title: 'Sample Scenes',
      unlockMessage: '',
      pledgeAmount: 50,
      description: '',
    },
    rateStory: (pc?.rateStory as FilmDetailMock['rateStory']) ?? {
      title: 'Rate the Story & Characters',
      subtitle: '',
      categories: [],
      thoughtsPlaceholder: '',
    },
    tabbedSection: (pc?.tabbedSection as FilmDetailMock['tabbedSection']) ?? EMPTY_TABBED_SECTION,
    sidebar: {
      pledged: api.sidebar.pledged,
      goal: api.sidebar.goal,
      investorsCount: api.sidebar.investorsCount,
      daysLeft: api.sidebar.daysLeft ?? 0,
      averageScore: api.sidebar.averageScore ?? 0,
      votesCount: api.sidebar.votesCount ?? 0,
      trendingText: api.sidebar.trendingText ?? '',
      tiers: Array.isArray(api.sidebar.tiers) ? (api.sidebar.tiers as FilmDetailMock['sidebar']['tiers']) : [],
    },
  };
}
