import { IsOptional, IsString, IsBoolean, IsInt, IsEnum, IsNotEmpty } from 'class-validator';
import { QuestionType } from '../entities/survey.enum';

export class CreateQuestionDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsInt()
  @IsOptional()
  page: number;

  @IsInt()
  @IsNotEmpty()
  position: number;

  @IsString()
  @IsOptional()
  questionText: string;

  @IsBoolean()
  @IsOptional()
  isMandatory: boolean;

  @IsString()
  @IsOptional()
  answer: string;

  @IsInt()
  @IsOptional()
  points: number;

  @IsEnum(QuestionType)
  @IsNotEmpty()
  type: QuestionType
}