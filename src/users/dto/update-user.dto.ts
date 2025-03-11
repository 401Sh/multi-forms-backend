import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, MinLength } from "class-validator";

export class UpdateUserDto {
  @ApiPropertyOptional({ description: 'Логин пользователя', minLength: 4 })
  @IsOptional()
  @MinLength(4, { message: 'Login must be larger then 3 characters' })
  login: string;

  @ApiPropertyOptional({ description: 'Пароль пользователя', minLength: 5 })
  @IsOptional()
  @MinLength(5, { message: 'Password must be larger then 4 characters' })
  password: string;
};