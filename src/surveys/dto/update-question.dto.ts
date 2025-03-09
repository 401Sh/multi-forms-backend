import { IsOptional, IsString, IsBoolean, IsInt, IsArray } from 'class-validator';
import { UpdateQuestionOptionDto } from './update-question-option.dto';

export class UpdateQuestionDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsInt()
  @IsOptional()
  page: number;

  @IsInt()
  @IsOptional()
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

  @IsArray()
  @IsOptional()
  questionOptions: UpdateQuestionOptionDto[]
}