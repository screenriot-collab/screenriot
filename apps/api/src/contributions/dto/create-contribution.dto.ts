import { IsString, IsNotEmpty, IsObject, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateContributionDto {
  @ApiProperty({ example: 'cl...' })
  @IsString()
  @IsNotEmpty()
  filmId: string;

  @ApiProperty({ description: 'The proposed changes to the film page content' })
  @IsObject()
  @IsNotEmpty()
  changes: Record<string, any>;

  @ApiPropertyOptional({ description: 'Optional comment from the filmmaker' })
  @IsString()
  @IsOptional()
  comment?: string;
}
