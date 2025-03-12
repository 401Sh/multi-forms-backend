import { IsArray, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateAnswerDto {
  @IsUUID()
  @IsNotEmpty({ message: 'Question id is required' })
  questionId: string;

  @IsString()
  @IsOptional()
  answerText: string;

  @IsArray()
  @IsOptional()
  answerOptions: string[]
};