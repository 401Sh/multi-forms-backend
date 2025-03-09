import { IsOptional, IsString, IsBoolean, IsInt, IsArray, Min } from 'class-validator';
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

  @IsArray()
  @IsOptional()
  questionOptions: UpdateQuestionOptionDto[]
}