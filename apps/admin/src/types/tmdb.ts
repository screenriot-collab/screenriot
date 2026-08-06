export type TmdbActorResult = {
  tmdbId: number;
  name: string;
  profilePhotoUrl: string | null;
  knownFor: string | null;
  popularity: number;
};

export type TmdbPersonDetails = {
  bio: string | null;
  birthday: string | null;
  placeOfBirth: string | null;
  alsoKnownAs: string[];
};

export type TmdbMovieResult = {
  tmdbId: number;
  title: string;
  releaseYear: string | null;
  posterUrl: string | null;
  voteAverage: number | null;
};

export type TmdbMovieDetails = {
  revenue: number | null;
};
