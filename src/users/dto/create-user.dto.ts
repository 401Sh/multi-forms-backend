import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Matches, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'Логин пользователя', minLength: 4 })
  @IsNotEmpty({ message: 'Login is required' })
  @MinLength(4, { message: 'Login must be larger then 3 characters' })
  @Matches(/^[a-zA-Z0-9_\-]+$/, { message: 'Login must be without spaces and special characers' })
  login: string;

  @ApiProperty({ description: 'Пароль пользователя', minLength: 5 })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(5, { message: 'Password must be larger then 4 characters' })
  @Matches(/^\S+$/, { message: 'Password must be a single word without spaces' })
  password: string;
};