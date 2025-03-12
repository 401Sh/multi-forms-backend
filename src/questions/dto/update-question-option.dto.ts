import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsInt, IsNotEmpty, Min } from 'class-validator';

export class UpdateQuestionOptionDto {
  @ApiProperty({
    description: 'Позиция на которой должен быть вариант ответа в вопросе',
    example: 1
  })
  @IsInt()
  @IsNotEmpty()
  @Min(1, { message: 'Position cannot be less than 1' })
  position: number;

  @ApiPropertyOptional({
    description: 'Является ли вариант ответа правильным (это позволит считать очки за правильный ответ на вопрос)',
    example: true
  })
  @IsBoolean()
  @IsOptional()
  isCorrect: boolean;

  @ApiPropertyOptional({
    description: 'Количество баллов за этот вариант ответа',
    example: 5 })
  @IsInt()
  @IsOptional()
  @Min(0, { message: 'Points cannot be less than 0' })
  points: number;

  @ApiPropertyOptional({
    description: 'Текст варианта ответа',
    example: 'Ответ A'
  })
  @IsString()
  @IsOptional()
  text: string
}