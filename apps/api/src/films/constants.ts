/** Submission fee amount in USD (v1). */
export const SUBMISSION_FEE_USD = 300;

export const SUBMISSION_FEE_CENTS = SUBMISSION_FEE_USD * 100;

export const STRIPE_CHECKOUT_PURPOSE_SUBMISSION_FEE = 'submission_fee';
export const STRIPE_CHECKOUT_PURPOSE_SCRIPT_CREDITS = 'script_credits';

/** Default pack: 10 credits for $5 (USD). */
export const SCRIPT_CREDITS_PACK_AMOUNT = 10;
export const SCRIPT_CREDITS_PACK_PRICE_CENTS = 500;
