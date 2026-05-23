import { IsOptional, IsString, IsUrl } from 'class-validator';

export class ScriptCreditsCheckoutDto {
  @IsString()
  @IsUrl({ require_tld: false })
  successUrl!: string;

  @IsString()
  @IsUrl({ require_tld: false })
  cancelUrl!: string;

  @IsOptional()
  @IsString()
  filmId?: string;
}
