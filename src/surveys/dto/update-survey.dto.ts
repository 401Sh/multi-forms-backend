import { IsOptional, IsString, IsEnum, IsBoolean } from 'class-validator';
import { SurveyAccess } from '../enums/survey.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSurveyDto {
  @ApiPropertyOptional({
    description: 'Название опроса',
    example: 'Супер опрос',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Описание опроса',
    example: 'Опрос для проверки качества обслуживания',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Опубликован ли опрос',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @ApiPropertyOptional({
    description: 'Доступ к опросу: link или public',
    enum: SurveyAccess,
    example: SurveyAccess.PUBLIC
  })
  @IsEnum(SurveyAccess)
  @IsOptional()
  access?: SurveyAccess;
};