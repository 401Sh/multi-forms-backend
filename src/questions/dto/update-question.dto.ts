import { IsOptional, IsString, IsBoolean, IsInt, IsArray, Min } from 'class-validator';
import { UpdateQuestionOptionDto } from './update-question-option.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateQuestionDto {
  @ApiPropertyOptional({
    description: 'Новое название вопроса',
    example: 'Название столицы Люксембурга?'
  })
  @IsString()
  @IsOptional()
  name: string;

  @ApiPropertyOptional({
    description: 'Позиция на которой должен находиться вопрос в опросе',
    example: 2
  })
  @IsInt()
  @IsOptional()
  @Min(1, { message: 'Position cannot be less than 1' })
  position: number;

  @ApiPropertyOptional({
    description: 'Новый текст вопроса',
    example: 'Как правильно назвывается столица Великого Герцогства Люксембург?'
  })
  @IsString()
  @IsOptional()
  questionText: string;

  @ApiPropertyOptional({
    description: 'Является ли вопрос обязательным',
    example: true
  })
  @IsBoolean()
  @IsOptional()
  isMandatory: boolean;

  @ApiPropertyOptional({
    description: 'Ответ на вопрос (если предусмотрен - это позволит считать очки за правильный ответ на текстовый вопрос)',
    example: 'Люксембург'
  })
  @IsString()
  @IsOptional()
  answer: string;

  @ApiPropertyOptional({
    description: 'Количество баллов за правильный ответ (только для текстовых вопросов)',
    example: 5
  })
  @IsInt()
  @IsOptional()
  @Min(0, { message: 'Points cannot be less than 0' })
  points: number;

  @ApiPropertyOptional({
    description: 'Новый список вариантов ответа',
    type: [UpdateQuestionOptionDto],
    example: [
      { position: 1, isCorrect: true, points: 5, text: 'Люксембург' },
      { position: 2, isCorrect: false, points: 0, text: 'Лихтенштейн' }
    ]
  })
  @IsArray()
  @IsOptional()
  questionOptions: UpdateQuestionOptionDto[]
};