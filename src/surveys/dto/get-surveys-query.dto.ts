import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsInt, Min } from 'class-validator';

export class GetSurveysQueryDto {
  @ApiPropertyOptional({
    description: 'Поисковая строка для фильтрации по названию или описанию опросов',
    example: 'Новый опрос',
  })
  @IsString()
  @IsOptional()
  search: string;

  @ApiPropertyOptional({
    description: 'Номер страницы (начинается с 1)',
    example: 1,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @Min(1, { message: 'Page cannot be less than 1' })
  page: number;

  @ApiPropertyOptional({
    description: 'Количество опросов на странице',
    example: 10,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @Min(1, { message: 'Page Size cannot be less than 1' })
  pageSize: number;

  @ApiPropertyOptional({
    description: 'Поле для сортировки (например, "createdAt" или "-createdAt" для сортировки по убыванию)',
    example: 'DESC:createdAt',
  })
  @IsString()
  @IsOptional()
  ordering: string;
};