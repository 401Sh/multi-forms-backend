import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  BaseEntity,
  OneToMany,
} from 'typeorm';
import { QuestionEntity } from './question.entity';
import { AnswerOptionEntity } from 'src/respondents/entities/answer-option.entity';

@Entity('questionOptions')
export class QuestionOptionEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'integer' })
  position!: number;

  @Column({ type: 'bool', default: false })
  isCorrect: boolean;

  @Column({ type: 'integer', default: 0 })
  points: number;

  @Column({ type: 'varchar', length: 512 })
  text: string;
  
  @OneToMany(
    () => AnswerOptionEntity,
    (answerOptions) => answerOptions.questionOption,
    { cascade: true }
  )
  answerOptions: AnswerOptionEntity[];
  
  @ManyToOne(
    () => QuestionEntity,
    (question) => question.questionOptions,
    { onDelete: 'CASCADE', nullable: false }
  )
  question: QuestionEntity;
};