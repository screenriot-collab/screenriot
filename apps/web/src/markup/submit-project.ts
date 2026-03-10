/**
 * Submit Project — multi-step application markup.
 * Replace with API submission when backend is ready.
 */

export const SUBMIT_PROJECT_PAGE = {
  title: 'Submit Your Film Project',
  subtitle: 'Complete the application to get your film project funded by our community',
} as const;

export const UPDATE_PROJECT_PAGE = {
  title: 'Update Your Film Project',
  subtitle: 'Edit your project details. Changes will be saved and sent for review if needed.',
} as const;

export const SUBMIT_SUCCESS = {
  title: 'Application submitted!',
  description:
    'Thank you for submitting your project. After you complete the submission fee payment, our team will review your application within 5 business days. We will contact you with next steps.',
  buttonLabel: 'Go to My Films',
  buttonHref: '/dashboard/films',
} as const;

export const UPDATE_SUCCESS = {
  title: 'Project updated!',
  description:
    'Your changes have been saved. Our team will review updates if applicable. We will contact you with next steps.',
  buttonLabel: 'Go to My Films',
  buttonHref: '/dashboard/films',
} as const;

export const WIZARD_ACTIONS = {
  submitButton: 'Submit Project',
  updateButton: 'Update Project',
} as const;

export const SUBMIT_STEPS = [
  { id: 1, label: 'Project Details', iconKey: 'filmReel' as const },
  { id: 2, label: 'Script & Materials', iconKey: 'document' as const },
  { id: 3, label: 'Cast & Crew', iconKey: 'users' as const },
  { id: 4, label: 'Budget & Timeline', iconKey: 'dollar' as const },
  { id: 5, label: 'Legal & Payment', iconKey: 'shield' as const },
] as const;

export const STEP_1_FIELDS = {
  sectionTitle: 'Project Details',
  filmTitle: { label: 'Film Title', placeholder: 'Enter your film title', required: true },
  logline: {
    label: 'Logline',
    placeholder: "A compelling one-sentence description of your film",
    maxLength: 200,
    required: true,
  },
  synopsis: {
    label: 'Synopsis',
    placeholder: "Detailed synopsis of your film's story",
    required: true,
  },
  genre: { label: 'Genre', placeholder: 'e.g., Sci-Fi Thriller', required: true },
  runtime: { label: 'Runtime', placeholder: 'e.g., 120 min', required: true },
  rating: { label: 'Rating', placeholder: 'e.g., PG-13', required: true },
  directorName: { label: 'Director Name', placeholder: 'Your name', required: true },
} as const;

export const STEP_2_SECTION = {
  title: 'Script & Marketing Materials',
} as const;

export const STEP_2_UPLOADS = [
  {
    id: 'screenplay',
    label: 'Upload Screenplay',
    required: true,
    format: 'PDF format, maximum 50MB.',
    accept: '.pdf',
  },
  {
    id: 'poster',
    label: 'Upload Poster/Key Art',
    required: false,
    format: 'JPG or PNG, minimum 1080x1080px.',
    accept: '.jpg,.jpeg,.png',
  },
  {
    id: 'video',
    label: 'Upload Teaser/Pitch Video (Optional)',
    required: false,
    format: 'MP4 format, maximum 500MB.',
    accept: '.mp4',
  },
] as const;

export const AI_SCRIPT_ANALYSIS = {
  title: 'AI Script Analysis',
  description:
    'Once you upload your screenplay, our AI will analyze it for marketability, genre trends, and audience appeal. This helps us provide you with feedback and improves your project\'s visibility to investors.',
} as const;

// ——— Step 3: Cast & Crew ———

export const STEP_3_SECTION = {
  title: 'Cast & Crew Information',
  infoText:
    'ScreenRiot will send automated verification emails to cast and crew members you list. They must confirm their involvement before your project goes live.',
} as const;

export const STEP_3_CAST = {
  heading: 'Key Cast Members',
  actorName: { label: 'Actor Name', placeholder: 'e.g. Emma Stone' },
  actorEmail: { label: 'Verification Email', placeholder: 'actor@email.com' },
  role: { label: 'Role', placeholder: '' },
  addButton: '+ Add Another Cast Member',
} as const;

export const STEP_3_CREW = {
  heading: 'Key Crew Members',
  name: { label: 'Crew Member Name', placeholder: 'Full name' },
  position: { label: 'Position', placeholder: 'e.g., Cinematographer' },
  email: { label: 'Verification Email', placeholder: 'crew@email.com' },
  addButton: '+ Add Another Crew Member',
} as const;

export const STEP_3_WISHLIST = {
  heading: 'Wish List Cast (Optional)',
  description: 'Let the community vote on their dream cast for your film',
  placeholder: 'e.g., Emma Stone, Michael B. Jordan',
} as const;

// ——— Step 4: Budget & Timeline ———

export const STEP_4_SECTION = {
  title: 'Budget & Production Schedule',
} as const;

export const STEP_4_BUDGET = {
  totalLabel: 'Total Budget',
  breakdownLabel: 'Budget Breakdown',
  categories: [
    { id: 'production', label: 'Production & Filming', defaultPercent: 35 },
    { id: 'post', label: 'Post-production & VFX', defaultPercent: 25 },
    { id: 'cast', label: 'Cast & Crew', defaultPercent: 20 },
    { id: 'marketing', label: 'Marketing & Distribution', defaultPercent: 15 },
    { id: 'contingency', label: 'Contingency', defaultPercent: 5 },
  ],
} as const;

export const STEP_4_TIMELINE = {
  label: 'Production Timeline',
  datePlaceholder: 'DD.MM.YYYY',
  fields: [
    { id: 'preProductionStart', label: 'Pre-production Start' },
    { id: 'principalPhotography', label: 'Principal Photography' },
    { id: 'postProduction', label: 'Post-production' },
    { id: 'expectedRelease', label: 'Expected Release' },
  ],
} as const;

export const STEP_4_CAMPAIGN = {
  label: 'Campaign Duration',
  description: 'Number of days for your funding campaign (typically 30-60 days)',
  placeholder: '30',
} as const;

// ——— Step 5: Legal & Payment (no KYC block — access to this page implies KYC done) ———

export const STEP_5_CHAIN_OF_TITLE = {
  label: 'Chain of Title Documentation',
  description: 'Upload copyright certificate or registration proving you own the rights to this story',
  buttonText: 'Upload Copyright Documentation',
  format: 'PDF format, maximum 10MB',
  accept: '.pdf',
} as const;

export const STEP_5_LEGAL = {
  label: 'Legal Agreements',
  termsLabel: 'I agree to the ScreenRiot Platform Terms & Conditions',
  termsLink: 'Read Terms',
  agreementLabel: 'I agree to the Filmmaker Participation Agreement and confirm I have all necessary rights to the submitted material',
  agreementLink: 'Read Agreement',
} as const;

export const STEP_5_FEE = {
  label: 'Submission Fee',
  description: "Non-refundable review fee. This covers our team's time reviewing your project, AI script analysis, and platform costs. Payment does not guarantee project acceptance.",
  clarification:
    'After you click Submit Project you will need to pay the Submission Fee for your application to be reviewed. Review of your application begins once payment is confirmed.',
  amountUSD: '$300 USD',
  amountGBP: '£250 GBP',
  options: [
    { id: 'USD' as const, label: 'USD: $300' },
    { id: 'GBP' as const, label: 'GBP: £250' },
  ],
  submitButton: 'Pay Submission Fee & Submit Project',
} as const;

export const STEP_5_NEXT = {
  title: 'What Happens Next?',
  items: [
    'Our team reviews your project within 5 business days',
    'AI analysis evaluates script marketability and genre trends',
    'If approved, we schedule an onboarding call to finalize your launch strategy',
    'Your Film SPV is created and smart contracts are deployed',
    'Your project goes live for community voting and investment!',
  ],
} as const;
