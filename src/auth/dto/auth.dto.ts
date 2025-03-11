import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class AuthDto {
  @ApiProperty({
    description: 'Логин пользователя',
    example: 'user123',
  })
  @IsNotEmpty({ message: 'Login is required' })
  login: string;

  @ApiProperty({
    description: 'Пароль пользователя',
    example: 'securePassword123',
  })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
};