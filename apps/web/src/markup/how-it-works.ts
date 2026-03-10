/**
 * How it Works — platform architecture (Money & Token Flow).
 * Content for the dedicated How it Works page.
 */

export type ArchitectureBlockId =
  | 'filmmaker'
  | 'fan-investor'
  | 'screenriot-core'
  | 'film-spv'
  | 'roi-engine'
  | 'external';

export type ArchitectureBlock = {
  id: ArchitectureBlockId;
  title: string;
  iconKey: 'clapperboard' | 'users' | 'database' | 'filmReel' | 'chart' | 'globe';
  borderColorClass: string;
  points: readonly string[];
};

export const ARCHITECTURE_BLOCKS: ArchitectureBlock[] = [
  {
    id: 'filmmaker',
    title: 'Filmmaker',
    iconKey: 'clapperboard',
    borderColorClass: 'border-violet-500',
    points: [
      'Registers and completes KYC/AML verification.',
      'Uploads script, cast, and production package.',
      'Signs ScreenRiot legal agreement and submits for review.',
      'Once approved, project SPV (Special Purpose Vehicle) is created.',
    ],
  },
  {
    id: 'fan-investor',
    title: 'Fan-Investor',
    iconKey: 'users',
    borderColorClass: 'border-blue-500',
    points: [
      'Registers and passes KYC.',
      'Browses projects and pledges or invests.',
      'Funds go into escrow via Stripe or Mangopay.',
      'Receives tokenised ScreenRiot Note (ERC-1400) upon investment.',
    ],
  },
  {
    id: 'screenriot-core',
    title: 'ScreenRiot Core',
    iconKey: 'database',
    borderColorClass: 'border-green-500',
    points: [
      'Manages identity verification (Sumsub / Trulioo).',
      'Handles payment processing and escrow (Stripe / Mangopay).',
      'Smart contracts on Polygon mint tokens per project.',
      'Funds released to SPV upon project approval.',
    ],
  },
  {
    id: 'film-spv',
    title: 'Film SPV',
    iconKey: 'filmReel',
    borderColorClass: 'border-amber-500',
    points: [
      'Receives escrowed funds and manages film budget.',
      'Handles production payments to cast and crew.',
      'Collects film revenues from distributors and streamers.',
      'Transfers ROI to ScreenRiot\'s ROI engine.',
    ],
  },
  {
    id: 'roi-engine',
    title: 'ROI & Token Engine',
    iconKey: 'chart',
    borderColorClass: 'border-pink-500',
    points: [
      'Calculates automatic revenue distribution.',
      'Smart contract allocates: 50% investors, 40-45% filmmaker, 5-10% ScreenRiot.',
      'Payouts in fiat or stablecoin (USDC/GBPe).',
      'Updates token status to "settled".',
    ],
  },
  {
    id: 'external',
    title: 'External Systems',
    iconKey: 'globe',
    borderColorClass: 'border-gray-500',
    points: [
      'Partners: Distributors, Payment Banks, Wallets.',
      'Custody Partners (Securitize / Tokeny).',
      'Regulatory Compliance (FCA / SEC / ECSP).',
    ],
  },
];

export const FLOW_LEGEND = [
  { colorClass: 'bg-green-500', label: 'Money (Fiat) flow through Stripe / Mangopay & Escrow' },
  { colorClass: 'bg-violet-500', label: 'Token flow via Smart Contracts on Polygon' },
  { colorClass: 'bg-blue-500', label: 'KYC / Identity data flow between parties' },
] as const;

export const HOW_IT_WORKS_PAGE = {
  title: 'ScreenRiot Platform Architecture',
  subtitle: 'Money & Token Flow',
} as const;
