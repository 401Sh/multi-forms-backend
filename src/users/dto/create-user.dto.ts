import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'Логин пользователя', minLength: 4 })
  @IsNotEmpty({ message: 'Login is required' })
  @MinLength(4, { message: 'Login must be larger then 3 characters' })
  login: string;

  @ApiProperty({ description: 'Пароль пользователя', minLength: 5 })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(5, { message: 'Password must be larger then 4 characters' })
  password: string;
};