import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateAnswerOptionDto {
  @IsUUID()
  @IsNotEmpty({ message: 'Option id is required' })
  optionId: string
}