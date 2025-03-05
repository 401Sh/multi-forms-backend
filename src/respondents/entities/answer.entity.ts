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

  @Column({ type: 'varchar', length: 512 })
  answerText: string;

  @ManyToOne(() => RespondentEntity, (respondent) => respondent.answers)
  respondent: RespondentEntity;
  
  @ManyToOne(() => QuestionEntity, (question) => question.answers)
  question: QuestionEntity;

  @OneToMany(() => AnswerOptionEntity, (answerOptions) => answerOptions.answer)
  @JoinTable()
  answerOptions: AnswerOptionEntity[];
};