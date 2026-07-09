export type CastingSuggestionStatus = 'pending' | 'reviewed' | 'accepted' | 'rejected';

export type CastingSuggestionRow = {
  id: string;
  filmId: string;
  filmTitle: string;
  filmSlug: string;
  userId: string;
  userEmail: string;
  actorName: string;
  roleHint: string | null;
  status: CastingSuggestionStatus;
  adminNote: string | null;
  createdAt: string;
};

export type CastingSuggestionFilmSummary = {
  filmId: string;
  filmTitle: string;
  filmSlug: string;
  total: number;
  pending: number;
  lastSubmittedAt: string;
};

export type UpdateCastingSuggestionPayload = {
  status: CastingSuggestionStatus;
  adminNote?: string;
  actorName?: string;
  roleHint?: string;
};
