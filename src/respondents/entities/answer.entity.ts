import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  BaseEntity,
  JoinTable,
  OneToMany
} from 'typeorm';
import { RespondentEntity } from './respondent.entity';
import { QuestionEntity } from 'src/surveys/entities/question.entity';
import { AnswerOptionEntity } from './answer-option.entity';

@Entity('answers')
export class AnswerEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  answerText?: string;

  @ManyToOne(
    () => RespondentEntity,
    (respondent) => respondent.answers,
    { onDelete: 'CASCADE', nullable: false }
  )
  respondent: RespondentEntity;
  
  @ManyToOne(
    () => QuestionEntity,
    (question) => question.answers,
    { onDelete: 'CASCADE', nullable: false }
  )
  question: QuestionEntity;

  @OneToMany(() => AnswerOptionEntity, (answerOptions) => answerOptions.answer)
  answerOptions: AnswerOptionEntity[];
};