import { IsNumber, IsString, IsUrl, Min } from 'class-validator';

export class CreateCheckoutSessionDto {
  @IsString()
  filmId: string;

  /** Amount in USD (e.g. tier amount). Min 100. */
  @IsNumber()
  @Min(100)
  amount: number;

  @IsUrl({ require_tld: false })
  successUrl: string;

  @IsUrl({ require_tld: false })
  cancelUrl: string;
}
