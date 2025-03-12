import { IsOptional, IsArray } from 'class-validator';
import { CreateAnswerDto } from './create-answer.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateResponseDto {
  @ApiPropertyOptional({
    description: 'Список ответов на вопросы',
    type: [CreateAnswerDto],
    example: [
      {
        questionId: '550e9600-e29b-41d4-a716-446645640015', answerText: 'Люксембург'
      },
      {
        questionId: '664e3412-e29b-1aw5-j728-446645685492', answerOptions: [
          '63j72412-e29b-1aw5-64e8-446645685492',
          '114e3412-e29b-1aw5-j728-446645665755',
          '99945412-j72b-k4j7-84e3-e29441245782'
        ]
      }
    ]
  })
  @IsArray()
  @IsOptional()
  answers: CreateAnswerDto[]
}