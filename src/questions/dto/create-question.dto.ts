import { IsOptional, IsString, IsBoolean, IsInt, IsEnum, IsNotEmpty, Min } from 'class-validator';
import { QuestionType } from '../enums/question.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateQuestionDto {
  @ApiPropertyOptional({
    description: 'Название вопроса',
    example: 'Столица Люксембург?'
  })
  @IsString()
  @IsOptional()
  name: string;

  @ApiPropertyOptional({
    description: 'Номер страницы, на которой находится вопрос',
    example: 1
  })
  @IsInt()
  @IsOptional()
  @Min(1, { message: 'Page cannot be less than 1' })
  page: number;

  @ApiProperty({
    description: 'Позиция вопроса на странице',
    example: 2
  })
  @IsInt()
  @IsNotEmpty()
  @Min(1, { message: 'Position cannot be less than 1' })
  position: number;

  @ApiPropertyOptional({
    description: 'Текст вопроса',
    example: 'Как назвывается столица Великого Герцогства Люксембург?'
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

  @ApiProperty({
    description: 'Тип вопроса (text, radio, checkbox)',
    enum: QuestionType,
    example: QuestionType.TEXT
  })
  @IsEnum(QuestionType)
  @IsNotEmpty()
  type: QuestionType
}