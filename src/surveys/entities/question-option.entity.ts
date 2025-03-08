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

  @Column({ type: 'integer', nullable: false })
  position!: number;

  @Column({ type: 'bool', default: false })
  isCorrect: boolean = false;

  @Column({ type: 'integer', default: 0 })
  points: number = 0;

  @Column({ type: 'varchar', length: 512, nullable: false })
  text!: string;
  
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