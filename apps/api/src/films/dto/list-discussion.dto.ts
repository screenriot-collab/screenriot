import { IsIn, IsOptional, IsString } from 'class-validator';

export class ListDiscussionQueryDto {
  @IsOptional()
  @IsIn(['top', 'new', 'trending'])
  sort?: 'top' | 'new' | 'trending';

  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;
}
