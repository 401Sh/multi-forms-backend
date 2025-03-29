import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateAnswerDto {
  @ApiProperty({
    description: 'UUID вопроса',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @IsUUID()
  @IsNotEmpty({ message: 'Question id is required' })
  questionId: string;

  @ApiPropertyOptional({
    example: 'Ответ на вопрос (только для текстовых вопросов)',
    description: 'Лихтенштейн'
  })
  @IsString()
  @IsOptional()
  answerText?: string;

  @ApiPropertyOptional({
    description: 'Массив UUID выбранных вариантов ответа (только для вопросов с вариантами ответа)',
    example: ['option1', 'option2']
  })
  @IsArray()
  @IsOptional()
  answerOptions?: string[]
};