export interface DashboardStats {
  users: {
    total: number;
    fan: number;
    filmmaker: number;
    emailVerified: number;
  };
  films: {
    byStatus: Record<string, number>;
    publishedCount: number;
  };
  donations: {
    totalAmount: number;
    count: number;
    completedCount: number;
  };
  verifications: {
    byStatus: Record<string, number>;
    pendingCount: number;
  };
  payouts: {
    byStatus: Record<string, number>;
    pendingSum: number;
  };
  operational: {
    filmsPendingReview: number;
    verificationsPending: number;
  };
}
