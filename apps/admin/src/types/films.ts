export type ReviewComments = {
  step1?: string;
  step2?: string;
  step3?: string;
  step4?: string;
  step5?: string;
};

export type CastMember = {
  actorName?: string;
  actorEmail?: string;
  /** @deprecated use character */
  role?: string;
  character?: string;
  tier?: string;
  characterDescription?: string;
};

export type CrewMember = {
  name?: string;
  position?: string;
  email?: string;
};

export type WishListCastMember = {
  actorName?: string;
  character?: string;
  role?: string;
  tier?: string;
  characterDescription?: string;
  status?: 'wish_list' | 'verified';
};

export type Step3Data = {
  cast?: CastMember[];
  crew?: CrewMember[];
  /** Legacy: comma-separated string. New: array of wish list rows. */
  wishListCast?: string | WishListCastMember[];
};

export type BudgetBreakdownItem = {
  id?: string;
  label?: string;
  percent?: number;
};

export type TimelineData = {
  preProductionStart?: string;
  principalPhotography?: string;
  postProduction?: string;
  expectedRelease?: string;
};

export type Step4Data = {
  totalBudget?: number;
  breakdown?: BudgetBreakdownItem[];
  timeline?: TimelineData;
  campaignDuration?: number;
};

export type FileSlot = { key: string; url: string } | null;

export type AdminFilm = {
  id: string;
  slug: string;
  title: string;
  status: string;
  reviewStatus: 'action_required' | 'no_action' | 'changes_submitted' | null;
  submissionFeePaid: boolean;
  logline: string | null;
  synopsis: string | null;
  genre: string | null;
  runtime: string | null;
  rating: string | null;
  directorName: string | null;
  goalAmount: string;
  currentAmount: string;
  deadline: string | null;
  posterUrl: string | null;
  pageContent: Record<string, unknown> | null;
  pagePublished: boolean;
  trendingText: string | null;
  cachedVotesCount: number | null;
  cachedAverageScore: number | string | null;
  step3: Step3Data | null;
  step4: Step4Data | null;
  reviewComments: ReviewComments | null;
  filmmaker: { id: string; email: string };
  createdAt: string;
  updatedAt: string;
};

export type AdminFilmDetail = {
  film: AdminFilm;
  files: {
    screenplay: FileSlot;
    poster: FileSlot;
    teaser: FileSlot;
    chainOfTitle: FileSlot;
  };
};

export type AdminFilmListItem = {
  id: string;
  slug: string;
  title: string;
  status: string;
  reviewStatus: string | null;
  submissionFeePaid: boolean;
  pagePublished?: boolean;
  createdAt: string;
  updatedAt: string;
  filmmaker: { id: string; email: string };
  lastReviewedBy?: { id: string; username: string | null } | null;
};

export type FilmsListResponse = {
  films: AdminFilmListItem[];
  total: number;
  page: number;
  limit: number;
};

/** Payload for PATCH /admin/films/:id/page (edit public film page). Slug is read-only from application. */
export type FilmPageUpdate = {
  title?: string;
  logline?: string;
  synopsis?: string;
  directorName?: string;
  genre?: string;
  goalAmount?: number;
  deadline?: string;
  posterUrl?: string;
  pageContent?: Record<string, unknown>;
  trendingText?: string;
  cachedVotesCount?: number;
  cachedAverageScore?: number;
  pagePublished?: boolean;
};

/** One main character for film page (Story & Characters). actorEmail is admin-only, not sent to public frontend. */
export type MainCharacterForm = {
  id: string;
  name: string;
  /** Computed display text ("Character · Tier label") shown on the public film page. */
  role: string;
  /** Character name, edited separately from the computed `role` display text. */
  character?: string;
  /** Cast tier id (see CAST_TIER_OPTIONS in constants/films.ts) - kept structured so it can be re-edited via select. */
  tier?: string;
  description: string;
  imageUrl?: string | null;
  actorEmail?: string;
  /** Fields below are optional TMDB enrichment — stored for future use even where the public page doesn't render them yet. */
  tmdbBio?: string;
  tmdbBirthday?: string;
  tmdbPlaceOfBirth?: string;
  tmdbAlsoKnownAs?: string[];
  tmdbPopularity?: number;
};

export type CastingVoteOptionForm = {
  id: string;
  name: string;
  role: string;
  status?: 'wish_list' | 'verified';
  characterDescription?: string;
  votePercent: number;
  votes: number;
};

export type CastingVoteForm = {
  title: string;
  subtitle: string;
  cast: CastingVoteOptionForm[];
  tip: string;
};

export type ProductionStageForm = {
  id: string;
  title: string;
  period: string;
  status: 'completed' | 'in_progress' | 'upcoming' | 'planned';
};

export type ProductionForm = {
  title: string;
  stages: ProductionStageForm[];
};

export type UpdateItemForm = {
  id: string;
  date: string;
  title: string;
  description: string;
};

export type ScriptSamplePageForm = {
  id?: string;
  title: string;
  content: string;
};

export type MetricForm = {
  id: string;
  label: string;
  value: string;
  description: string;
};

export type SimilarFilmForm = {
  id: string;
  title: string;
  boxOffice: string;
  roi: string;
  rating: string;
  matchPercent: number;
  /** TMDB poster link — stored as a URL, not re-hosted, per TMDB's free CDN usage. Not yet shown on the public page. */
  posterUrl?: string;
};

export type ScreenplayScoreCategoryForm = {
  name: string;
  aiScore: number;
  expertScore: number;
};

export type ScreenplayScoreForm = {
  aiOverall: number;
  expertOverall: number;
  categories: ScreenplayScoreCategoryForm[];
};

export type AiAnalysisForm = {
  overallScore: number;
  marketInsights: MetricForm[];
  teamTalent: MetricForm[];
  investmentMetrics: MetricForm[];
};

export type SampleScenesForm = {
  title: string;
  unlockMessage: string;
  pledgeAmount: number;
  description: string;
  pages?: ScriptSamplePageForm[];
  unlockedPageCount?: number;
  lockedPageCount?: number;
  creditsPerPage?: number;
};

export type PledgeVotingCategoryForm = {
  id: string;
  label: string;
  icon: 'story' | 'script' | 'casting';
  labelLeft: string;
  labelRight: string;
  communityScore?: number;
  communityMax?: number;
};

export type PledgeVotingForm = {
  title: string;
  subtitle: string;
  pledgeAmount: number;
  categories: PledgeVotingCategoryForm[];
};

/** One investment tier for film page sidebar (donation options). Matches web FilmDetailSidebar. */
export type InvestmentTierForm = {
  id: string;
  amount: number;
  name: string;
  benefits: string[];
  investorsCount?: number;
};

export const KEY_CREW_ROLE_OPTIONS = ['Director', 'Screenwriter', 'Cinematographer', 'Other'] as const;
export type KeyCrewRole = (typeof KEY_CREW_ROLE_OPTIONS)[number];

/** One key crew member (Director / Screenwriter / Cinematographer) for the film page. Pre-filled from the application's Step 3 crew list, then editable here. */
export type KeyCrewMemberForm = {
  id: string;
  name: string;
  role: KeyCrewRole | string;
  /** Shown on the public film page — same field as Main Characters' description, filled in here (not sourced from the application). */
  description: string;
  email?: string;
  imageUrl?: string | null;
  tmdbBio?: string;
  tmdbBirthday?: string;
  tmdbPlaceOfBirth?: string;
};

/** Film page edit form state (includes slug for display and pageContent-derived fields). */
export type FilmPageFormState = FilmPageUpdate & {
  slug?: string;
  treatment?: string;
  storySynopsis?: string;
  whyMatters?: string;
  tags?: string;
  mainCharacters?: MainCharacterForm[];
  keyCrew?: KeyCrewMemberForm[];
  /** Whether the Key Crew block is shown on the public film page — separate from whether it's filled in. */
  keyCrewVisible?: boolean;
  castingVote?: CastingVoteForm;
  productionTitle?: string;
  productionStages?: ProductionStageForm[];
  updatesItems?: UpdateItemForm[];
  sampleScenes?: SampleScenesForm;
  screenplayScore?: ScreenplayScoreForm;
  aiAnalysis?: AiAnalysisForm;
  similarFilms?: SimilarFilmForm[];
  pledgeVoting?: PledgeVotingForm;
  /** Sidebar donation tiers (Investment Tiers) shown on film detail page. */
  sidebarTiers?: InvestmentTierForm[];
};
