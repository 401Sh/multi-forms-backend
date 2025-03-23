import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, Matches, MinLength } from "class-validator";

export class UpdateUserDto {
  @ApiPropertyOptional({ description: 'Логин пользователя', minLength: 4 })
  @IsOptional()
  @MinLength(4, { message: 'Login must be larger then 3 characters' })
  @Matches(/^[a-zA-Z0-9]+$/, { message: 'Login must be a without spaces and special characers' })
  login?: string;

  @ApiPropertyOptional({ description: 'Пароль пользователя', minLength: 5 })
  @IsOptional()
  @MinLength(5, { message: 'Password must be larger then 4 characters' })
  @Matches(/^\S+$/, { message: 'Password must be a single word without spaces' })
  password?: string;
};