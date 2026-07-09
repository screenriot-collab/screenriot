import { fetchFilmById } from './films-api';

const PROPOSAL_ALLOWED_STATUSES = ['approved', 'fundraising', 'funded', 'closed'] as const;

type ProposalAllowedStatus = (typeof PROPOSAL_ALLOWED_STATUSES)[number];

/**
 * Determines whether the currently authenticated filmmaker can propose
 * changes to a film page. Returns true only if the film exists, is owned
 * by the caller, has a published page, and is in an eligible status.
 */
export async function resolveCanPropose(
  filmId: string,
  accessToken: string,
): Promise<boolean> {
  try {
    const film = await fetchFilmById(filmId, accessToken);
    return (
      film !== null &&
      PROPOSAL_ALLOWED_STATUSES.includes(film.status as ProposalAllowedStatus) &&
      Boolean(film.pagePublished)
    );
  } catch {
    return false;
  }
}
