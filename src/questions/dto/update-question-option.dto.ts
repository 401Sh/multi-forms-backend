import { IsOptional, IsString, IsBoolean, IsInt, IsNotEmpty, Min } from 'class-validator';

export class UpdateQuestionOptionDto {
  @IsInt()
  @IsNotEmpty()
  @Min(1, { message: 'Position cannot be less than 1' })
  position: number;

  @IsBoolean()
  @IsOptional()
  isCorrect: boolean;

  @IsInt()
  @IsOptional()
  @Min(0, { message: 'Points cannot be less than 0' })
  points: number;

  @IsString()
  @IsOptional()
  text: string
};