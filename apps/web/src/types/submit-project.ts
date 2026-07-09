import type { KeyCastMember, WishListCastMember } from '@/lib/cast-members';

export type { KeyCastMember, WishListCastMember };

export type SubmitProjectFormData = {
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
    cast: KeyCastMember[];
    crew: { name: string; position: string; email: string }[];
    wishListCast: WishListCastMember[];
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
};

export type Step2Files = {
  screenplay: File | null;
  poster: File | null;
  video: File | null;
};

export type Step5Files = {
  chainOfTitle: File | null;
};

export type UploadWarning = {
  slot: 'screenplay' | 'poster' | 'teaser' | 'chain-of-title';
  fileName: string;
  reason?: string;
};

export type ReviewComments = {
  step1?: string;
  step2?: string;
  step3?: string;
  step4?: string;
  step5?: string;
};
