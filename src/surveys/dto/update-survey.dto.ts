import { IsOptional, IsString, IsEnum, IsNumber, IsBoolean } from 'class-validator';
import { SurveyAccess } from '../enums/survey.enum';

export class UpdateSurveyDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsBoolean()
  @IsOptional()
  isPublished: boolean;

  @IsEnum(SurveyAccess)
  @IsOptional()
  access: SurveyAccess;
}