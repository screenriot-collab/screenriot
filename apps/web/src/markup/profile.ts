/**
 * Profile page markup / placeholder data.
 * Replace with API later (e.g. GET /users/me, GET /users/me/preferences).
 */

// ——— Profile tab: types & mock ———

export type UserRole = 'fan' | 'filmmaker';

export type ProfileData = {
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  emailVerifiedAt: string | null;
  phone: string;
  dateOfBirth: string;
  country: string;
  city: string;
  bio: string;
  website: string;
  socialTwitter: string;
  socialInstagram: string;
  socialLinkedin: string;
  avatarUrl: string | null;
  memberSince: string;
  role: UserRole;
  identityLocked?: boolean;
  verification: VerificationData;
  filmmaker?: {
    productionCompany: string;
    imdbUrl: string;
    filmmakerStatement: string;
    yearsOfExperience: string;
    specialization: string[];
  };
};

export const FILMMAKER_SPECIALIZATIONS = [
  'Director',
  'Producer',
  'Writer',
  'Cinematographer',
  'Editor',
  'Production Designer',
  'Composer',
  'Sound Designer',
  'VFX Supervisor',
  'Other',
] as const;

export const PROFILE_COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia',
  'Germany', 'France', 'Spain', 'Italy', 'Netherlands',
  'Sweden', 'Norway', 'Denmark', 'Japan', 'South Korea',
  'Brazil', 'Mexico', 'India', 'Nigeria', 'South Africa', 'Other',
] as const;

// ——— Preferences tab ———

export const PREFERENCES_GENRES = [
  'Sci-Fi Thriller',
  'Mystery Drama',
  'Romance/Sci-Fi',
  'Psychological Thriller',
  'Horror',
  'Documentary',
] as const;

export const PREFERENCES_ACTORS = [
  'Emma Stone',
  'Michael B. Jordan',
  'Florence Pugh',
  'Oscar Isaac',
] as const;

export type FollowingFilmmaker = {
  id: string;
  name: string;
  projectsCount: number;
  initial: string;
};

export const FOLLOWING_FILMMAKERS: FollowingFilmmaker[] = [
  { id: '1', name: 'Sarah Chen', projectsCount: 2, initial: 'S' },
  { id: '2', name: 'Marcus Williams', projectsCount: 1, initial: 'M' },
  { id: '3', name: 'Elena Rodriguez', projectsCount: 1, initial: 'E' },
];

export const NOTIFICATION_OPTIONS = [
  {
    id: 'new_films',
    label: 'New Film Projects',
    description: "Get notified when new films match your preferences",
  },
  {
    id: 'casting_updates',
    label: 'Casting & Creative Updates',
    description: "Updates on films you've voted on or invested in",
  },
  {
    id: 'roi_distributions',
    label: 'ROI Distributions',
    description: 'Alerts when earnings are added to your wallet',
  },
  {
    id: 'campaign_milestones',
    label: 'Campaign Milestones',
    description: 'Funding goals reached, production updates, etc.',
  },
] as const;

export const PLACEHOLDER_BADGES = [
  { label: 'Gold Investor', highlight: true },
  { label: 'Early Adopter', highlight: false },
  { label: 'Community Voter', highlight: false },
  { label: '3 Films Backed', highlight: false },
] as const;

export type ConnectedServiceId = 'imdb' | 'letterboxd';

export type ConnectedService = {
  id: ConnectedServiceId;
  name: string;
  description: string;
  iconKey: 'linkImdb' | 'linkLetterboxd';
};

export const CONNECTED_SERVICES: ConnectedService[] = [
  {
    id: 'imdb',
    name: 'IMDb',
    description: 'Connect to import your watchlist and ratings',
    iconKey: 'linkImdb',
  },
  {
    id: 'letterboxd',
    name: 'Letterboxd',
    description: 'Connect to sync your film diary and favorites',
    iconKey: 'linkLetterboxd',
  },
];

export const INTEGRATIONS_RECOMMENDATIONS = {
  title: 'Personalized Recommendations',
  description:
    "Connect your IMDb or Letterboxd account to get film project recommendations based on your taste. Our AI analyzes your viewing history to suggest projects you'll love.",
} as const;

// ——— Verification types & mock ———

export type VerificationStatus = 'not_started' | 'pending' | 'verified' | 'rejected';

export type VerificationDocType =
  | 'government_id'
  | 'proof_of_address'
  | 'selfie_with_id'
  | 'business_registration'
  | 'guild_membership'
  | 'festival_certificate'
  | 'credits_documentation';

export type VerificationDocument = {
  id: string;
  type: VerificationDocType;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  status: 'uploaded' | 'approved' | 'rejected';
  adminComment?: string;
};

export type VerificationData = {
  status: VerificationStatus;
  documents: VerificationDocument[];
  adminFeedback?: string;
  submittedAt?: string;
  reviewedAt?: string;
};

export const VERIFICATION_ACCEPTED_FORMATS = '.pdf,.jpg,.jpeg,.png,.webp';
export const VERIFICATION_MAX_FILE_SIZE_MB = 10;

type DocRequirement = {
  type: VerificationDocType;
  label: string;
  description: string;
  required: boolean;
};

export const FAN_DOCUMENT_REQUIREMENTS: DocRequirement[] = [
  {
    type: 'government_id',
    label: 'Government-Issued Photo ID',
    description: 'Passport, driver\'s license, or national identity card. Must be valid and not expired.',
    required: true,
  },
  {
    type: 'proof_of_address',
    label: 'Proof of Address',
    description: 'Utility bill, bank statement, or official government letter dated within the last 3 months.',
    required: true,
  },
  {
    type: 'selfie_with_id',
    label: 'Selfie Holding Your ID',
    description: 'A clear photo of you holding the same ID document next to your face. Helps confirm identity.',
    required: false,
  },
];

export const FILMMAKER_DOCUMENT_REQUIREMENTS: DocRequirement[] = [
  ...FAN_DOCUMENT_REQUIREMENTS,
  {
    type: 'business_registration',
    label: 'Business / Company Registration',
    description: 'Certificate of incorporation or business registration for your production company.',
    required: false,
  },
  {
    type: 'guild_membership',
    label: 'Guild / Union Membership',
    description: 'SAG-AFTRA, DGA, WGA, or equivalent guild/union membership card or letter.',
    required: false,
  },
  {
    type: 'festival_certificate',
    label: 'Film Festival Certificate',
    description: 'Official selection or award certificate from a recognized film festival.',
    required: false,
  },
  {
    type: 'credits_documentation',
    label: 'Previous Credits Documentation',
    description: 'IMDb page screenshot, credit list, or contract showing your role on previous productions.',
    required: false,
  },
];

export const FILMMAKER_PROFESSIONAL_DOCS_NOTE =
  'At least one professional document (Business Registration, Guild Membership, Festival Certificate, or Credits Documentation) is required for filmmaker verification.';

export const MOCK_VERIFICATION_NOT_STARTED: VerificationData = {
  status: 'not_started',
  documents: [],
};

export const MOCK_VERIFICATION_PENDING: VerificationData = {
  status: 'pending',
  submittedAt: '2025-02-20T14:30:00Z',
  documents: [
    {
      id: 'doc-1',
      type: 'government_id',
      fileName: 'passport_scan.pdf',
      fileSize: 2_400_000,
      uploadedAt: '2025-02-20T14:28:00Z',
      status: 'uploaded',
    },
    {
      id: 'doc-2',
      type: 'proof_of_address',
      fileName: 'utility_bill_jan2025.jpg',
      fileSize: 1_100_000,
      uploadedAt: '2025-02-20T14:29:00Z',
      status: 'uploaded',
    },
  ],
};

export const MOCK_VERIFICATION_VERIFIED: VerificationData = {
  status: 'verified',
  submittedAt: '2025-01-10T10:00:00Z',
  reviewedAt: '2025-01-12T09:15:00Z',
  documents: [
    {
      id: 'doc-1',
      type: 'government_id',
      fileName: 'passport_scan.pdf',
      fileSize: 2_400_000,
      uploadedAt: '2025-01-10T09:55:00Z',
      status: 'approved',
    },
    {
      id: 'doc-2',
      type: 'proof_of_address',
      fileName: 'bank_statement_dec2024.pdf',
      fileSize: 890_000,
      uploadedAt: '2025-01-10T09:58:00Z',
      status: 'approved',
    },
  ],
};

export const MOCK_VERIFICATION_REJECTED: VerificationData = {
  status: 'rejected',
  submittedAt: '2025-02-01T11:00:00Z',
  reviewedAt: '2025-02-03T16:45:00Z',
  adminFeedback: 'The uploaded ID document is blurry and unreadable. Please re-upload a clear, high-resolution scan of your government-issued photo ID.',
  documents: [
    {
      id: 'doc-1',
      type: 'government_id',
      fileName: 'id_photo.jpg',
      fileSize: 450_000,
      uploadedAt: '2025-02-01T10:55:00Z',
      status: 'rejected',
      adminComment: 'Image is too blurry to verify.',
    },
    {
      id: 'doc-2',
      type: 'proof_of_address',
      fileName: 'electric_bill.pdf',
      fileSize: 1_200_000,
      uploadedAt: '2025-02-01T10:58:00Z',
      status: 'approved',
    },
  ],
};

// ——— Profile mock data (depends on verification mocks above) ———

export const MOCK_PROFILE_FAN: ProfileData = {
  firstName: 'Alex',
  lastName: 'Morgan',
  displayName: 'AlexFilmFan',
  email: 'alex.morgan@example.com',
  emailVerifiedAt: null,
  phone: '+1 (555) 012-3456',
  dateOfBirth: '1990-05-15',
  country: 'United States',
  city: 'Los Angeles',
  bio: 'Passionate about independent cinema and supporting emerging filmmakers. Early adopter of crowdfunded film projects.',
  website: 'https://alexmorgan.me',
  socialTwitter: '@alexfilmfan',
  socialInstagram: '@alexfilmfan',
  socialLinkedin: '',
  avatarUrl: null,
  memberSince: '2024-08-10',
  role: 'fan',
  verification: MOCK_VERIFICATION_NOT_STARTED,
};

export const MOCK_PROFILE_FILMMAKER: ProfileData = {
  firstName: 'Sarah',
  lastName: 'Chen',
  displayName: 'SarahChenFilms',
  email: 'sarah.chen@example.com',
  emailVerifiedAt: '2024-06-01T12:00:00.000Z',
  phone: '+44 7700 900123',
  dateOfBirth: '1985-11-22',
  country: 'United Kingdom',
  city: 'London',
  bio: 'Award-winning independent filmmaker with a focus on sci-fi and social impact storytelling.',
  website: 'https://sarahchenfilms.com',
  socialTwitter: '@sarahchenfilms',
  socialInstagram: '@sarahchenfilms',
  socialLinkedin: 'sarah-chen-films',
  avatarUrl: null,
  memberSince: '2024-06-01',
  role: 'filmmaker',
  verification: MOCK_VERIFICATION_VERIFIED,
  filmmaker: {
    productionCompany: 'Bright Horizon Pictures',
    imdbUrl: 'https://www.imdb.com/name/nm0000001/',
    filmmakerStatement: 'I believe cinema has the power to change perspectives. My work explores the intersection of technology and humanity, asking questions about where we\'re headed as a society.',
    yearsOfExperience: '12',
    specialization: ['Director', 'Writer', 'Producer'],
  },
};

// ——— Security tab: Account items ———

export const ACCOUNT_SECURITY_ITEMS = [
  {
    id: 'password',
    label: 'Password',
    value: 'Last changed 30 days ago',
    buttonText: 'Change',
  },
  {
    id: '2fa',
    label: 'Two-Factor Authentication',
    value: 'Add an extra layer of security',
    buttonText: 'Enable',
  },
  {
    id: 'email',
    label: 'Email Address',
    value: 'investor@example.com',
    buttonText: 'Change',
  },
] as const;

export const DANGER_ZONE = {
  title: 'Danger Zone',
  deleteLabel: 'Delete Account',
  deleteWarning:
    'Permanently delete your account and all associated data. This action cannot be undone.',
  deleteButtonText: 'Delete Account',
} as const;
