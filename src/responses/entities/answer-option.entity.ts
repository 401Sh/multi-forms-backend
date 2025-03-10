import { 
  Entity, 
  PrimaryGeneratedColumn, 
  ManyToOne, 
  BaseEntity,
} from 'typeorm';
import { AnswerEntity } from './answer.entity';
import { QuestionOptionEntity } from 'src/questions/entities/question-option.entity';

@Entity('answerOptions')
export class AnswerOptionEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(
    () => AnswerEntity,
    (answer) => answer.answerOptions,
    { onDelete: 'CASCADE', nullable: false }
  )
  answer: AnswerEntity;
  
  @ManyToOne(
    () => QuestionOptionEntity,
    (questionOption) => questionOption.answerOptions,
    { onDelete: 'CASCADE', nullable: false }
  )
  questionOption: QuestionOptionEntity;
};