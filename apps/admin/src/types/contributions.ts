export interface AdminContribution {
  id: string;
  number: string;
  filmId: string;
  userId: string;
  status: 'pending' | 'approved' | 'rejected';
  changes: Record<string, unknown>;
  comment?: string;
  adminComment?: string;
  createdAt: string;
  updatedAt: string;
  processedAt?: string;
  film: {
    id: string;
    title: string;
  };
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    username: string;
  };
}

export interface ContributionsListResponse {
  contributions: AdminContribution[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
