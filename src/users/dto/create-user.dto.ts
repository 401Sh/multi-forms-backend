import { IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Login is required' })
  @MinLength(4, { message: 'Login must be larger then 3 characters' })
  login: string;

  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(5, { message: 'Password must be larger then 4 characters' })
  password: string;
};