/** Submission fee in USD (must match API SUBMISSION_FEE_USD). */
export const SUBMISSION_FEE_USD = 300;

export function formatSubmissionFeeLabel(): string {
  return `$${SUBMISSION_FEE_USD} USD`;
}
