/**
 * Home page markup / placeholder data.
 * Replace with API data later (e.g. GET /films, GET /stats, CMS or config for hero copy).
 */

export const HOME_HERO = {
  title: '$42M invested in independent film this year',
  subtitle: 'Invest in the future of cinema',
  description:
    'Vote on stories, shape casting decisions, and invest in independent films. Join a community of fans financing the next generation of filmmakers.',
  searchPlaceholder: 'Search film projects...',
} as const;

export const GENRES = [
  'All',
  'Sci-Fi Thriller',
  'Mystery Drama',
  'Romance/Sci-Fi',
  'Psychological Thriller',
  'Horror',
  'Documentary',
] as const;

export type PlaceholderFilm = {
  id: string;
  title: string;
  genre: string;
  rating: number;
  progress: number;
  goal: number;
  raised: number;
  goalAmount: number;
  director: string;
  synopsis: string;
  investors: number;
  votes: number;
  daysLeft: number;
};

export const PLACEHOLDER_FILMS: PlaceholderFilm[] = [
  {
    id: '1',
    title: 'Memory Murals',
    genre: 'Sci-Fi Thriller',
    rating: 8.8,
    progress: 87,
    goal: 100,
    raised: 8100,
    goalAmount: 18000,
    director: 'Alex Chen',
    synopsis:
      'A painter discovers her memories are being stolen and sold as immersive art.',
    investors: 42,
    votes: 128,
    daysLeft: 19,
  },
  {
    id: '2',
    title: 'Echoes of Tomorrow',
    genre: 'Mystery Drama',
    rating: 6.7,
    progress: 45,
    goal: 100,
    raised: 12500,
    goalAmount: 28000,
    director: 'Jordan Lee',
    synopsis:
      'A journalist uncovers a conspiracy that connects past and future events.',
    investors: 28,
    votes: 95,
    daysLeft: 32,
  },
  {
    id: '3',
    title: 'Silent Signal',
    genre: 'Psychological Thriller',
    rating: 7.9,
    progress: 62,
    goal: 100,
    raised: 18600,
    goalAmount: 30000,
    director: 'Sam Rivera',
    synopsis: 'A deaf hacker must decode messages that only she can perceive.',
    investors: 56,
    votes: 201,
    daysLeft: 14,
  },
  {
    id: '4',
    title: 'The Last Broadcast',
    genre: 'Documentary',
    rating: 8.2,
    progress: 91,
    goal: 100,
    raised: 27300,
    goalAmount: 30000,
    director: 'Morgan Gray',
    synopsis: 'The final days of independent radio in a small town.',
    investors: 89,
    votes: 312,
    daysLeft: 5,
  },
  {
    id: '5',
    title: 'Neon Drift',
    genre: 'Romance/Sci-Fi',
    rating: 7.4,
    progress: 33,
    goal: 100,
    raised: 6600,
    goalAmount: 20000,
    director: 'Casey Kim',
    synopsis: 'Two strangers meet in a city that resets every midnight.',
    investors: 21,
    votes: 67,
    daysLeft: 41,
  },
  {
    id: '6',
    title: 'Hollow Hill',
    genre: 'Horror',
    rating: 8.1,
    progress: 58,
    goal: 100,
    raised: 11600,
    goalAmount: 20000,
    director: 'Riley Walsh',
    synopsis: 'A family moves into a house where the walls remember the dead.',
    investors: 34,
    votes: 156,
    daysLeft: 22,
  },
];

export const STATS = [
  { value: '$4.2M+', label: 'Total invested' },
  { value: '127', label: 'Films funded' },
  { value: '45K+', label: 'Community investors' },
  { value: '8.9', label: 'Avg. community rating' },
] as const;

export const HOW_IT_WORKS = {
  title: 'How ScreenRiot Works',
  subtitle: 'A transparent, community-driven platform for financing independent film.',
  steps: [
    {
      icon: 'search',
      title: 'Discover & Vote',
      description:
        'Browse film projects and vote on story uniqueness, script brilliance and dream casting.',
    },
    {
      icon: 'folder',
      title: 'Invest in Films',
      description:
        'Choose your investment tier and become part of the production with tokenized ownership.',
    },
    {
      icon: 'plus',
      title: 'Earn Returns',
      description:
        'Earn revenue share from distribution, streaming rights, and box office success.',
    },
  ],
  ctaLabel: 'View Platform Architecture',
  ctaHref: '/#architecture',
} as const;
