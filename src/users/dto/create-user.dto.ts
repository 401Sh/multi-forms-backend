import { IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Login is required' })
  login: string;

  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(5, { message: 'Password must be larger then 5 characters' })
  password: string;
};