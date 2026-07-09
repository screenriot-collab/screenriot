export type SubmissionFeePaymentRow = {
  id: string;
  filmId: string;
  filmTitle: string;
  userId: string;
  userEmail: string;
  stripeSessionId: string;
  createdAt: string;
  amountUsd: number;
};
