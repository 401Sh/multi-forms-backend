import { IsOptional, IsString, IsBoolean, IsInt, IsEnum, IsNotEmpty, Min } from 'class-validator';
import { QuestionType } from '../entities/survey.enum';

export class CreateQuestionDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsInt()
  @IsOptional()
  @Min(1, { message: 'Page cannot be less than 1' })
  page: number;

  @IsInt()
  @IsNotEmpty()
  @Min(1, { message: 'Position cannot be less than 1' })
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
  @Min(0, { message: 'Points cannot be less than 0' })
  points: number;

  @IsEnum(QuestionType)
  @IsNotEmpty()
  type: QuestionType
}