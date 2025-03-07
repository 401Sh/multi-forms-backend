import { IsOptional, IsString, IsInt } from 'class-validator';

export class GetSurveysQueryDto {
  @IsString()
  @IsOptional()
  search: string;

  @IsInt()
  @IsOptional()
  page: number;

  @IsInt()
  @IsOptional()
  pageSize: number;

  @IsString()
  @IsOptional()
  ordering: string;
}