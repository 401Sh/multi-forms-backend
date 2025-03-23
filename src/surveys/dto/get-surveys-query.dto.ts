import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsInt, Min, Matches } from 'class-validator';

export class GetSurveysQueryDto {
  @ApiPropertyOptional({
    description: 'Поисковая строка для фильтрации по названию или описанию опросов',
    example: 'Новый опрос',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Номер страницы (начинается с 1)',
    example: 1,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @Min(1, { message: 'Page cannot be less than 1' })
  page?: number;

  @ApiPropertyOptional({
    description: 'Количество опросов на странице',
    example: 10,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @Min(1, { message: 'Page Size cannot be less than 1' })
  pageSize?: number;

  @ApiPropertyOptional({
    description: 'Поле для сортировки в формате: имяПоля:направлениеСортировки (сортировка может быть ASC или DESC)',
    example: 'createdAt:DESC',
  })
  @IsString()
  @IsOptional()
  @Matches(/^\S+$/, { message: 'Ordering must be without spaces' })
  ordering?: string;
};