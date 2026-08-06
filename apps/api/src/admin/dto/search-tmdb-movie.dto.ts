import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SearchTmdbMovieDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  query!: string;
}
