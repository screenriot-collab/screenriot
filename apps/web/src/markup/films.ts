/**
 * Dashboard Films list — markup and placeholder data.
 * Replace with API later (e.g. GET /films for filmmaker).
 */

export const FILMS_PAGE = {
  title: 'My Films',
  subtitle: 'Projects you have submitted. Review status and submission fee payment here.',
  emptyMessage: 'No films yet. Submit your first project to get started.',
  viewAction: 'View',
  payAction: 'Pay submission fee',
  deleteAction: 'Delete',
  deleteConfirmTitle: 'Delete draft project?',
  deleteConfirmMessage: 'This project will be permanently removed. This action cannot be undone.',
  editAction: 'Edit',
  openProjectAction: 'Open project',
  reviewColumn: 'Review',
  noReview: '—',
} as const;

/** Short moderator review: whether filmmaker needs to update or not. */
export const REVIEW_STATUS = {
  action_required: 'Action required',
  no_action: 'No action needed',
  changes_submitted: 'Changes submitted',
} as const;

export type ReviewStatus = keyof typeof REVIEW_STATUS;

/** Film verification/review status (from PROJECT_ARCHITECTURE: films.status) */
export const FILM_VERIFICATION_STATUS = {
  draft: 'Draft',
  pending_approval: 'Pending approval',
  approved: 'Approved',
  rejected: 'Rejected',
  fundraising: 'Fundraising',
  funded: 'Funded',
  closed: 'Closed',
} as const;

/** Submission fee payment status */
export const FILM_PAYMENT_STATUS = {
  unpaid: 'Unpaid',
  paid: 'Paid',
} as const;

export type FilmVerificationStatus = keyof typeof FILM_VERIFICATION_STATUS;
export type FilmPaymentStatus = keyof typeof FILM_PAYMENT_STATUS;

export interface FilmListItem {
  id: string;
  slug: string;
  title: string;
  createdBy: string;
  verificationStatus: FilmVerificationStatus;
  paymentStatus: FilmPaymentStatus;
  pagePublished: boolean;
  /** Short moderator status: enter and update, or no action. Full comment can live in API for detail view. */
  reviewStatus?: ReviewStatus | null;
}


/** Full project form data as returned by API for edit/view. Matches SubmitProjectWizard form shape. */
export interface ProjectFormDataFromApi {
  step1?: {
    filmTitle: string;
    logline: string;
    synopsis: string;
    genre: string;
    runtime: string;
    rating: string;
    directorName: string;
  };
  step2?: {
    screenplayFileName?: string;
    posterFileName?: string;
    videoFileName?: string;
  };
  step3?: {
    cast: { actorName: string; actorEmail: string; role: string }[];
    crew: { name: string; position: string; email: string }[];
    wishListCast: string;
  };
  step4?: {
    totalBudget: string;
    breakdown: { id: string; label: string; percent: number }[];
    timeline: {
      preProductionStart: string;
      principalPhotography: string;
      postProduction: string;
      expectedRelease: string;
    };
    campaignDuration: string;
  };
  step5?: {
    agreeTerms: boolean;
    agreeAgreement: boolean;
    currency: 'USD' | 'GBP';
    chainOfTitleFileName?: string;
  };
}

