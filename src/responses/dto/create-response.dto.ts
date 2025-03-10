import { IsOptional, IsArray } from 'class-validator';
import { CreateAnswerDto } from './create-answer.dto';

export class CreateResponseDto {
  @IsArray()
  @IsOptional()
  answers: CreateAnswerDto[]
}