import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { SortOption } from '../constants';

export class PaginationDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  limit?: number;

  @IsOptional()
  @IsString({ message: 'Search must be an string' })
  search?: string;

  @IsOptional()
  @IsString({ message: 'Sort must be an either asc or desc' })
  sort?: SortOption;

  @IsOptional()
  @IsBoolean({ message: 'isCreator must be a boolean' })
  isCreator?: boolean;
}
