import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SearchTmdbActorDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  query!: string;
}
