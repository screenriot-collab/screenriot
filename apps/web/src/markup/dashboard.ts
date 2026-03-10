/**
 * Investor Dashboard markup / placeholder data.
 * Replace with API later (e.g. GET /users/me/wallet, /investments, /earnings).
 */

export const DASHBOARD_HEADER = {
  title: 'Investor Dashboard',
  subtitle: 'Track your investments, earnings, and voting history',
} as const;

export const WALLET_CARD = {
  label: 'Wallet Balance',
  value: '$492.50',
  unit: 'USD',
  description: 'Available for withdrawal',
  iconKey: 'wallet',
} as const;

export const TOTAL_INVESTED_CARD = {
  label: 'Total Invested',
  value: '$3 100',
  change: '+12.5% this month',
  changePositive: true,
  iconKey: 'chart',
} as const;

export const EARNINGS_CARD = {
  label: 'Total Earnings',
  value: '$492.50',
  description: 'From 3 distributions',
  iconKey: 'dollar',
} as const;

export const PLEDGES_CARD = {
  label: 'Active Pledges',
  value: '1',
  description: '$25 in escrow',
  iconKey: 'clock',
} as const;

export const PAYMENT_PREFERENCE = {
  title: 'Payment Preference',
  description: 'Choose between fiat currency or cryptocurrency',
  options: ['Fiat (USD)', 'Crypto (USDC)'] as const,
} as const;

export const DASHBOARD_TABS = [
  { id: 'investments', label: 'My Investments' },
  { id: 'voting', label: 'Voting History' },
  { id: 'earnings', label: 'Earnings' },
  { id: 'perks', label: 'Perks & Rewards' },
] as const;

export type InvestmentTier = 'Executive Producer' | "Producer's Circle" | 'Film Fan';

export type InvestmentStatus = 'Active Campaign' | 'In Production';

export type DashboardInvestment = {
  id: string;
  title: string;
  investedDate: string;
  amount: string;
  revenueShare: string;
  tier: InvestmentTier;
  status: InvestmentStatus;
  productionProgress?: number;
};

export const DASHBOARD_INVESTMENTS: DashboardInvestment[] = [
  {
    id: '1',
    title: 'Memory Market',
    investedDate: 'Oct 15, 2025',
    amount: '$2 500',
    revenueShare: '0.5% revenue share',
    tier: 'Executive Producer',
    status: 'Active Campaign',
  },
  {
    id: '2',
    title: 'The Last Frame',
    investedDate: 'Oct 28, 2025',
    amount: '$500',
    revenueShare: '0.1% revenue share',
    tier: "Producer's Circle",
    status: 'In Production',
    productionProgress: 65,
  },
  {
    id: '3',
    title: 'Shadows Within',
    investedDate: 'Nov 1, 2025',
    amount: '$100',
    revenueShare: '0.01% revenue share',
    tier: 'Film Fan',
    status: 'Active Campaign',
  },
];

// ——— Voting History ———

export const VOTING_ABOUT = {
  title: 'About Pledge-Based Voting',
  description:
    'Vote on creative decisions by pledging $25. Your pledge is held in escrow until the decision is locked. If your choice wins, the pledge converts to investment. Otherwise, it\'s returned to your wallet.',
} as const;

export type VotingEntryStatus = 'locked' | 'pending';
export type VotingOutcome = 'converted' | 'escrow';

export type VotingEntry = {
  id: string;
  title: string;
  voteType: string;
  status: VotingEntryStatus;
  votedDate: string;
  pledgeAmount: string;
  outcome: VotingOutcome;
};

export const VOTING_ENTRIES: VotingEntry[] = [
  {
    id: '1',
    title: 'Memory Market',
    voteType: 'Cast Vote',
    status: 'locked',
    votedDate: 'Oct 12, 2025',
    pledgeAmount: '$25',
    outcome: 'converted',
  },
  {
    id: '2',
    title: 'Echoes of Tomorrow',
    voteType: 'Script Vote',
    status: 'pending',
    votedDate: 'Oct 20, 2025',
    pledgeAmount: '$25',
    outcome: 'escrow',
  },
  {
    id: '3',
    title: 'The Last Frame',
    voteType: 'Story Vote',
    status: 'locked',
    votedDate: 'Oct 28, 2025',
    pledgeAmount: '$25',
    outcome: 'escrow',
  },
];

// ——— Earnings ———

export type EarningsEntry = {
  id: string;
  projectTitle: string;
  distributionType: string;
  date: string;
  amount: string;
};

export const EARNINGS_ENTRIES: EarningsEntry[] = [
  { id: '1', projectTitle: 'Midnight Dreams', distributionType: 'ROI Distribution', date: 'Sep 15, 2025', amount: '+$342.50' },
  { id: '2', projectTitle: 'Urban Stories', distributionType: 'ROI Distribution', date: 'Oct 5, 2025', amount: '+$125.00' },
  { id: '3', projectTitle: 'Memory Market', distributionType: 'Pledge Return', date: 'Oct 12, 2025', amount: '+$25.00' },
];

// ——— Perks & Rewards ———

export const PERKS_INVESTOR_STATUS = {
  title: 'Your Investor Status',
  badge: 'Gold Investor',
  level: 'Level 3',
  description: "You've invested in 3 films and earned $492.50 in returns. Keep investing to unlock Platinum status!",
  progressLabel: 'Progress to Platinum',
  progressPercent: 60,
} as const;

export type PerkItem = {
  id: string;
  title: string;
  subtitle: string;
  unlocked: boolean;
};

export const PERKS_UNLOCKED: PerkItem[] = [
  { id: '1', title: 'Virtual Table Read Access', subtitle: 'Join exclusive online table reads with cast and director', unlocked: true },
  { id: '2', title: 'Behind-the-Scenes Content', subtitle: 'Access to exclusive livestreams and production updates', unlocked: true },
  { id: '3', title: 'Digital Collectibles', subtitle: 'NFT memorabilia from your invested films', unlocked: true },
  { id: '4', title: 'Set Visit Invitation', subtitle: 'Unlock at Platinum level ($10K+ invested)', unlocked: false },
  { id: '5', title: 'Cameo/Background Role', subtitle: 'Unlock at Diamond level ($25K+ invested)', unlocked: false },
];

export type UpcomingReward = {
  id: string;
  title: string;
  date: string;
  tag?: string;
  detail?: string;
};

export const PERKS_UPCOMING: UpcomingReward[] = [
  { id: '1', title: 'Memory Market - Table Read', date: 'December 15, 2025', tag: 'Registered' },
  { id: '2', title: 'The Last Frame - Premiere', date: 'March 2026', detail: '2 Tickets' },
];
