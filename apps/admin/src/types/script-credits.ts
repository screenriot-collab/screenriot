export type ScriptCreditPurchaseRow = {
  id: string;
  userId: string;
  userEmail: string;
  credits: number;
  stripeSessionId: string;
  createdAt: string;
  amountUsd: number;
};
