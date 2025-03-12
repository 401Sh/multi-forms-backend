import { Type } from 'class-transformer';
import { IsOptional, IsString, IsInt, Min, Matches } from 'class-validator';

export class GetSurveysQueryDto {
  @IsString()
  @IsOptional()
  search: string;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @Min(1, { message: 'Page cannot be less than 1' })
  page: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @Min(1, { message: 'Page Size cannot be less than 1' })
  pageSize: number;

  @IsString()
  @IsOptional()
  @Matches(/^\S+$/, { message: 'Ordering must be without spaces' })
  ordering: string;
};