import { IsOptional, IsString, IsBoolean, IsInt, IsNotEmpty } from 'class-validator';

export class UpdateQuestionOptionDto {
  @IsInt()
  @IsNotEmpty()
  position: number;

  @IsBoolean()
  @IsOptional()
  isCorrect: boolean;

  @IsInt()
  @IsOptional()
  points: number;

  @IsString()
  @IsOptional()
  text: string
}