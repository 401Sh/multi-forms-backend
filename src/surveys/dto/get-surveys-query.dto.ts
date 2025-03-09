import { IsOptional, IsString, IsInt, Min } from 'class-validator';

export class GetSurveysQueryDto {
  @IsString()
  @IsOptional()
  search: string;

  @IsInt()
  @IsOptional()
  @Min(1, { message: 'Page cannot be less than 1' })
  page: number;

  @IsInt()
  @IsOptional()
  @Min(1, { message: 'Page Size cannot be less than 1' })
  pageSize: number;

  @IsString()
  @IsOptional()
  ordering: string;
}