import { IsArray, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { CreateAnswerOptionDto } from './create-answer-option.dto';

export class CreateAnswerDto {
  @IsUUID()
  @IsNotEmpty({ message: 'Question id is required' })
  questionId: string;

  @IsString()
  @IsOptional()
  answerText: string;

  @IsArray()
  @IsOptional()
  answerOptions: CreateAnswerOptionDto[]
}