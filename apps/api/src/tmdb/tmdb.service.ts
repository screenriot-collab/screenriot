import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';

const TMDB_API_BASE = 'https://api.themoviedb.org/3';
/** w185 is a small, list-friendly thumbnail size; TMDB serves profile photos at fixed widths. */
const TMDB_PROFILE_IMAGE_BASE = 'https://image.tmdb.org/t/p/w185';
/** w342 balances a crisp poster for later display against a reasonably small link. */
const TMDB_POSTER_IMAGE_BASE = 'https://image.tmdb.org/t/p/w342';

export type TmdbActorResult = {
  tmdbId: number;
  name: string;
  /** Absolute URL, or null when TMDB has no photo on file for this person. */
  profilePhotoUrl: string | null;
  /** Best-known-for credit, shown to help disambiguate common names. */
  knownFor: string | null;
  /** TMDB's relative popularity score — useful for disambiguating common names, not a financial metric. */
  popularity: number;
};

export type TmdbPersonDetails = {
  bio: string | null;
  birthday: string | null;
  placeOfBirth: string | null;
  alsoKnownAs: string[];
};

type TmdbPersonSearchResponse = {
  results: {
    id: number;
    name: string;
    profile_path: string | null;
    known_for?: { title?: string; name?: string }[];
    popularity?: number;
  }[];
};

type TmdbPersonDetailsResponse = {
  biography: string | null;
  birthday: string | null;
  place_of_birth: string | null;
  also_known_as?: string[];
};

export type TmdbMovieResult = {
  tmdbId: number;
  title: string;
  releaseYear: string | null;
  posterUrl: string | null;
  /** 0-10 TMDB user rating, or null when TMDB has no votes yet. */
  voteAverage: number | null;
};

export type TmdbMovieDetails = {
  /** Box office revenue in USD, or null when TMDB has no figure on file (common for smaller/older titles). */
  revenue: number | null;
};

type TmdbMovieSearchResponse = {
  results: {
    id: number;
    title: string;
    release_date?: string;
    poster_path: string | null;
    vote_average?: number;
    vote_count?: number;
  }[];
};

type TmdbMovieDetailsResponse = {
  revenue?: number;
};

@Injectable()
export class TmdbService {
  private readonly logger = new Logger(TmdbService.name);

  /** True once TMDB_API_KEY is configured; callers use this to give a clear error instead of a failed fetch. */
  get isConfigured(): boolean {
    return Boolean(process.env.TMDB_API_KEY);
  }

  private async tmdbGet<T>(path: string, params: Record<string, string> = {}): Promise<T> {
    if (!this.isConfigured) {
      throw new InternalServerErrorException('TMDB_API_KEY is not configured on the server.');
    }

    const url = new URL(`${TMDB_API_BASE}${path}`);
    for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);

    let response: Response;
    try {
      response = await fetch(url, {
        headers: {
          // TMDB's v4 Read Access Token (JWT) authenticates via this header
          // and works against every v3 endpoint.
          Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
          Accept: 'application/json',
        },
      });
    } catch (err) {
      this.logger.error(`TMDB request failed: ${err instanceof Error ? err.message : err}`);
      throw new InternalServerErrorException('Could not reach TMDB.');
    }

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      this.logger.error(`TMDB ${path} returned ${response.status}: ${body}`);
      throw new InternalServerErrorException('TMDB request failed.');
    }

    return response.json() as Promise<T>;
  }

  async searchActor(query: string): Promise<TmdbActorResult[]> {
    const data = await this.tmdbGet<TmdbPersonSearchResponse>('/search/person', {
      query,
      include_adult: 'false',
    });
    return data.results.slice(0, 8).map((r) => ({
      tmdbId: r.id,
      name: r.name,
      profilePhotoUrl: r.profile_path ? `${TMDB_PROFILE_IMAGE_BASE}${r.profile_path}` : null,
      knownFor: r.known_for?.[0]?.title ?? r.known_for?.[0]?.name ?? null,
      popularity: r.popularity ?? 0,
    }));
  }

  async getPersonDetails(tmdbId: number): Promise<TmdbPersonDetails> {
    const data = await this.tmdbGet<TmdbPersonDetailsResponse>(`/person/${tmdbId}`);
    return {
      bio: data.biography?.trim() || null,
      birthday: data.birthday ?? null,
      placeOfBirth: data.place_of_birth ?? null,
      alsoKnownAs: data.also_known_as ?? [],
    };
  }

  async searchMovie(query: string): Promise<TmdbMovieResult[]> {
    const data = await this.tmdbGet<TmdbMovieSearchResponse>('/search/movie', {
      query,
      include_adult: 'false',
    });
    return data.results.slice(0, 8).map((r) => ({
      tmdbId: r.id,
      title: r.title,
      releaseYear: r.release_date?.slice(0, 4) || null,
      posterUrl: r.poster_path ? `${TMDB_POSTER_IMAGE_BASE}${r.poster_path}` : null,
      voteAverage: r.vote_count ? Number((r.vote_average ?? 0).toFixed(1)) : null,
    }));
  }

  async getMovieDetails(tmdbId: number): Promise<TmdbMovieDetails> {
    const data = await this.tmdbGet<TmdbMovieDetailsResponse>(`/movie/${tmdbId}`);
    return { revenue: data.revenue && data.revenue > 0 ? data.revenue : null };
  }
}
