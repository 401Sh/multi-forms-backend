import { 
  Entity, 
  PrimaryGeneratedColumn, 
  ManyToOne, 
  BaseEntity,
} from 'typeorm';
import { AnswerEntity } from './answer.entity';
import { QuestionOptionEntity } from 'src/surveys/entities/question-option.entity';

@Entity('answerOptions')
export class AnswerOptionEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => AnswerEntity, (answer) => answer.answerOptions)
  answer: AnswerEntity;
  
  @ManyToOne(() => QuestionOptionEntity, (questionOption) => questionOption.answerOptions)
  questionOption: QuestionOptionEntity;
};