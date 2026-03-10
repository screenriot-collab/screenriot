/**
 * Film detail page — mock data for main content blocks.
 * Replace with API when backend is ready.
 */

export type FilmDetailMetric = {
  id: string;
  label: string;
  value: string;
  description: string;
};

export type SimilarFilm = {
  id: string;
  title: string;
  boxOffice: string;
  roi: string;
  rating: string;
  matchPercent: number;
};

export type VotingCategory = {
  id: string;
  label: string;
  icon: 'story' | 'script' | 'casting';
  labelLeft: string;
  labelRight: string;
  communityScore: number;
  communityMax: number;
};

export type PledgeVotingMock = {
  title?: string;
  pledgeAmount: number;
  subtitle: string;
  categories: VotingCategory[];
};

export type CharacterMock = {
  id: string;
  name: string;
  role: string;
  description: string;
  imageUrl: string | null;
};

export type TreatmentMock = {
  act1: string;
  act2: string;
};

export type SampleScenesMock = {
  title: string;
  unlockMessage: string;
  pledgeAmount: number;
  /** Content shown after unlock (paid). Plain text or markdown-style; frontend may render with line breaks. */
  description?: string;
  unlocked?: boolean;
};

export type RateStoryCategory = {
  id: string;
  label: string;
  icon: 'story_engagement' | 'character_depth' | 'emotional_impact';
  comparisonScore: number;
  comparisonMax: number;
  comparisonVariant: 'yellow' | 'red';
};

export type RateStoryMock = {
  title: string;
  subtitle: string;
  categories: RateStoryCategory[];
  thoughtsPlaceholder: string;
};

export type TabbedSectionSynopsis = {
  storySynopsis: string;
  whyMatters: string;
  budgetBreakdown: { label: string; percent: number }[];
};

export type CastingVoteOption = {
  id: string;
  name: string;
  role: string;
  votePercent: number;
  votes: number;
};

export type TabbedSectionCasting = {
  title: string;
  subtitle: string;
  cast: CastingVoteOption[];
  tip: string;
};

export type ProductionStage = {
  id: string;
  title: string;
  period: string;
  status: 'completed' | 'in_progress' | 'upcoming' | 'planned';
};

export type TabbedSectionProduction = {
  title: string;
  stages: ProductionStage[];
};

export type UpdateItem = {
  id: string;
  date: string;
  title: string;
  description: string;
};

export type TabbedSectionMock = {
  synopsis: TabbedSectionSynopsis;
  castingVote: TabbedSectionCasting;
  production: TabbedSectionProduction;
  updates: { items: UpdateItem[] };
};

export type InvestmentTier = {
  id: string;
  amount: number;
  name: string;
  benefits: string[];
  investorsCount: number;
};

export type FilmDetailSidebarMock = {
  pledged: number;
  goal: number;
  investorsCount: number;
  daysLeft: number;
  averageScore: number;
  votesCount: number;
  trendingText: string;
  tiers: InvestmentTier[];
};

export type FilmDetailMock = {
  slug: string;
  tags: string[];
  title: string;
  synopsis: string;
  directorName: string;
  /** Director avatar image URL (filmmaker avatar). Shown left of "Directed by". */
  directorAvatarUrl?: string;
  /** URL for poster image (from API or presigned). */
  posterImageUrl?: string;
  /** URL for teaser/trailer video (from API or presigned). */
  videoUrl?: string;
  videoLabel: string;
  videoRestrictedMessage: string;
  aiAnalysis: {
    overallScore: number;
    maxScore: number;
    marketInsights: FilmDetailMetric[];
    teamTalent: FilmDetailMetric[];
    investmentMetrics: FilmDetailMetric[];
  };
  similarFilms: SimilarFilm[];
  pledgeVoting: PledgeVotingMock;
  treatment: TreatmentMock;
  mainCharacters: CharacterMock[];
  sampleScenes: SampleScenesMock;
  rateStory: RateStoryMock;
  tabbedSection: TabbedSectionMock;
  sidebar: FilmDetailSidebarMock;
};

const MARKET_INSIGHTS: FilmDetailMetric[] = [
  { id: '1', label: 'Popularity & Trend', value: '87', description: "Based on similar films' performance" },
  { id: '2', label: 'Global Appeal', value: '82', description: 'Strong international resonance' },
  { id: '3', label: 'Fan Buzz', value: '91', description: 'High social media engagement' },
  { id: '4', label: 'Topicality', value: '88', description: 'Align with current trends' },
  {
    id: '5',
    label: 'Genre Insights',
    value: 'Strong',
    description: 'Sci-Fi Thriller trending +24% in North America, +18% internationally',
  },
];

const TEAM_TALENT: FilmDetailMetric[] = [
  { id: '1', label: 'Crew Experience', value: '89', description: 'Proven track record in genre' },
  { id: '2', label: 'Talent Draw', value: '85', description: 'Strong cast & crew appeal' },
  { id: '3', label: 'Series Potential', value: 'High', description: 'Franchise opportunity identified' },
];

const INVESTMENT_METRICS: FilmDetailMetric[] = [
  { id: '1', label: 'Expected Return', value: '18-24%', description: 'Conservative projection' },
  { id: '2', label: 'Investment Risk', value: 'Medium', description: 'Balanced risk-reward profile' },
  { id: '3', label: 'Community Interest', value: '93', description: 'Exceptional fan enthusiasm' },
  { id: '4', label: 'Festival / Awards', value: '78', description: 'Good recognition potential' },
  {
    id: '5',
    label: 'Platform Suitability',
    value: 'Excellent',
    description: 'Perfect runtime & format for streaming platforms (Netflix, Apple TV+)',
  },
];

const SIMILAR_FILMS: SimilarFilm[] = [
  { id: '1', title: 'Ex Machina', boxOffice: '$240M', roi: '8.5x', rating: '92% Critical', matchPercent: 94 },
  { id: '2', title: 'Inception', boxOffice: '$836M', roi: '5.2x', rating: '87% Critical', matchPercent: 89 },
  { id: '3', title: 'Blade Runner 2049', boxOffice: '$259M', roi: '6.8x', rating: '88% Critical', matchPercent: 91 },
];

const PLEDGE_VOTING: PledgeVotingMock = {
  title: 'Pledge-Based Voting',
  pledgeAmount: 25,
  subtitle: '$25 pledge per category • Held in escrow • Converts to investment if your choice wins',
  categories: [
    {
      id: 'story',
      label: 'Story Uniqueness',
      icon: 'story',
      labelLeft: 'Not Unique',
      labelRight: 'Highly Original',
      communityScore: 9.2,
      communityMax: 10,
    },
    {
      id: 'script',
      label: 'Script Brilliance',
      icon: 'script',
      labelLeft: 'Needs Work',
      labelRight: 'Exceptional',
      communityScore: 8.8,
      communityMax: 10,
    },
    {
      id: 'casting',
      label: 'Casting Appeal',
      icon: 'casting',
      labelLeft: 'Weak',
      labelRight: 'Perfect Cast',
      communityScore: 8.5,
      communityMax: 10,
    },
  ],
};

const TREATMENT: TreatmentMock = {
  act1: `Act 1: The Memory Market

2087, Neo-Tokyo. Dr. Elena Voss runs a small memory-trading operation from a hidden lab. She extracts and sells valuable memories to clients who want to relive peak experiences—athletic triumphs, first loves, lost moments. Her work is legal but morally gray.

When Marcus Chen, a rogue AI specialist, brings her a batch of corrupted memory fragments from a black-market source, Elena's world tilts. The fragments contain something impossible: memories of events that never happened, yet feel real. As she traces their origin, she uncovers a conspiracy that threatens not just the memory market, but human consciousness itself.`,
  act2: `Act 2: The Conspiracy Unfolds

As Elena and Marcus dig deeper, they discover that MindCorp—the megacorporation that pioneered memory storage—has been secretly implanting false memories in millions of users. The goal: reshape public perception, erase dissent, and control the narrative of history. The "corrupted" fragments are not glitches; they're evidence.

Pursued by corporate enforcers and betrayed by someone she trusted, Elena must forge an alliance with Marcus and a handful of other outcasts. Together they race to expose MindCorp before the next "update" rolls out—one that could rewrite the memories of half the planet.`,
};

const MAIN_CHARACTERS: CharacterMock[] = [
  {
    id: '1',
    name: 'Dr. Elena Voss',
    role: 'Memory Trader',
    description:
      "A brilliant neuroscientist turned memory trader who specializes in extracting and selling valuable memories.",
    imageUrl: null,
  },
  {
    id: '2',
    name: 'Marcus Chen',
    role: 'Rogue AI Specialist',
    description:
      "An enigmatic hacker who discovers a pattern in corrupted memories that points to a massive conspiracy.",
    imageUrl: null,
  },
  {
    id: '3',
    name: 'The Architect',
    role: 'Antagonist',
    description:
      "A mysterious figure controlling the memory black market with an agenda that goes far beyond profit.",
    imageUrl: null,
  },
  {
    id: '4',
    name: 'Agent Reyes',
    role: 'MindCorp Enforcer',
    description:
      "A ruthless corporate hunter tasked with protecting the conspiracy at any cost—until she begins to question what she's protecting.",
    imageUrl: null,
  },
];

const SAMPLE_SCENES: SampleScenesMock = {
  title: 'Sample Scenes',
  unlockMessage:
    'Unlock sample scenes to get a deeper understanding of the script quality and dialogue.',
  pledgeAmount: 50,
  description: '',
  unlocked: false,
};

const RATE_STORY: RateStoryMock = {
  title: 'Rate the Story & Characters',
  subtitle: 'Your feedback helps other investors evaluate this project.',
  thoughtsPlaceholder: 'Share your thoughts about the story, characters, or script...',
  categories: [
    { id: 'engagement', label: 'Story Engagement', icon: 'story_engagement', comparisonScore: 6, comparisonMax: 10, comparisonVariant: 'yellow' },
    { id: 'depth', label: 'Character Depth', icon: 'character_depth', comparisonScore: 5.5, comparisonMax: 10, comparisonVariant: 'yellow' },
    { id: 'impact', label: 'Emotional Impact', icon: 'emotional_impact', comparisonScore: 4, comparisonMax: 10, comparisonVariant: 'red' },
  ],
};

const TABBED_SYNOPSIS: TabbedSectionSynopsis = {
  storySynopsis: `In a world where memories are commodities, a memory trader uncovers a conspiracy to erase human consciousness. She must decide which memories to keep and which to forget—before the choice is made for her.

A gripping sci-fi thriller that explores identity, power, and what it means to be human. With stunning visuals and a thought-provoking narrative, this film aims to be a landmark achievement in independent cinema.`,
  whyMatters: `This project represents a fresh voice in science fiction, combining cerebral storytelling with emotional depth. A diverse creative team brings unique perspectives to a genre often dominated by formulaic narratives.`,
  budgetBreakdown: [
    { label: 'Production & Filming', percent: 35 },
    { label: 'Post-production & VFX', percent: 25 },
    { label: 'Cast & Crew', percent: 20 },
    { label: 'Marketing & Distribution', percent: 15 },
    { label: 'Contingency', percent: 5 },
  ],
};

const TABBED_CASTING: TabbedSectionCasting = {
  title: 'Vote for Your Dream Cast',
  subtitle: 'Help us choose the perfect actors for this film. Your votes influence casting decisions.',
  tip: 'Tip: Casting decisions are influenced by community votes. The more you invest, the more weight your vote carries.',
  cast: [
    { id: '1', name: 'Emma Stone', role: 'Lead Role - Sarah', votePercent: 82, votes: 342 },
    { id: '2', name: 'Michael B. Jordan', role: 'Lead Role - Marcus', votePercent: 72, votes: 289 },
    { id: '3', name: 'Florence Pugh', role: 'Supporting - Rachel', votePercent: 68, votes: 256 },
    { id: '4', name: 'Oscar Isaac', role: 'Supporting - Dr. Chen', votePercent: 52, votes: 198 },
  ],
};

const TABBED_PRODUCTION: TabbedSectionProduction = {
  title: 'Production Timeline',
  stages: [
    { id: '1', title: 'Pre-production & Casting', period: 'Q1 2026', status: 'completed' },
    { id: '2', title: 'Principal Photography', period: 'Q2 2026', status: 'in_progress' },
    { id: '3', title: 'Post-production', period: 'Q3 2026', status: 'upcoming' },
    { id: '4', title: 'Film Festival Circuit', period: 'Q4 2026', status: 'planned' },
  ],
};

const TABBED_UPDATES = {
  items: [
    { id: '1', date: 'November 2, 2025', title: 'Lead actress confirmed!', description: "We're thrilled to announce that based on your votes, we've secured our lead actress. More details coming soon!" },
    { id: '2', date: 'October 28, 2025', title: '60% funded in first week!', description: "Thank you to our amazing community! We've reached 60% of our goal in just one week." },
  ] as UpdateItem[],
};

const TABBED_SECTION: TabbedSectionMock = {
  synopsis: TABBED_SYNOPSIS,
  castingVote: TABBED_CASTING,
  production: TABBED_PRODUCTION,
  updates: TABBED_UPDATES,
};

const SIDEBAR: FilmDetailSidebarMock = {
  pledged: 645_000,
  goal: 850_000,
  investorsCount: 527,
  daysLeft: 18,
  averageScore: 8.8,
  votesCount: 1247,
  trendingText: 'Trending in Sci-Fi Thriller',
  tiers: [
    {
      id: '1',
      amount: 100,
      name: 'Film Fan',
      benefits: ['Digital copy of the film', 'Name in credits', 'Behind-the-scenes access'],
      investorsCount: 428,
    },
    {
      id: '2',
      amount: 500,
      name: "Producer's Circle",
      benefits: ['All previous rewards', 'Weighted voting power', 'Set visit invitation', 'Revenue share: 0.1%'],
      investorsCount: 87,
    },
    {
      id: '3',
      amount: 2500,
      name: 'Executive Producer',
      benefits: ['All previous rewards', 'Executive Producer credit', 'Premiere tickets (2)', 'Revenue share: 0.5%'],
      investorsCount: 12,
    },
  ],
};

export function getFilmDetailMock(slug: string): FilmDetailMock {
  return {
    slug,
    tags: ['Sci Fi Thriller', 'PG 13', '118 min'],
    title: 'Memory Market',
    synopsis:
      'A memory trader uncovers a conspiracy threatening human consciousness in a world where memories are commodities.',
    directorName: 'Sarah Chen',
    videoLabel: 'Official Trailer',
    videoRestrictedMessage: 'This video has restricted access.',
    aiAnalysis: {
      overallScore: 87,
      maxScore: 100,
      marketInsights: MARKET_INSIGHTS,
      teamTalent: TEAM_TALENT,
      investmentMetrics: INVESTMENT_METRICS,
    },
    similarFilms: SIMILAR_FILMS,
    pledgeVoting: PLEDGE_VOTING,
    treatment: TREATMENT,
    mainCharacters: MAIN_CHARACTERS,
    sampleScenes: SAMPLE_SCENES,
    rateStory: RATE_STORY,
    tabbedSection: TABBED_SECTION,
    sidebar: SIDEBAR,
  };
}
