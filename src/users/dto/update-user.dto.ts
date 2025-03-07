import { IsOptional, MinLength } from "class-validator";

export class UpdateUserDto {
  @IsOptional()
  @MinLength(4, { message: 'Login must be larger then 3 characters' })
  login: string;

  @IsOptional()
  @MinLength(5, { message: 'Password must be larger then 4 characters' })
  password: string;
};