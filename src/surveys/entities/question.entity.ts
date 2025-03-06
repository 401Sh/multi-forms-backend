import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  BaseEntity,
  OneToMany
} from 'typeorm';
import { QuestionType } from './survey.enum';
import { SurveyEntity } from './survey.entity';
import { AnswerEntity } from 'src/respondents/entities/answer.entity';
import { QuestionOptionEntity } from './question-option.entity';

@Entity('questions')
export class QuestionEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'integer', default: 1 })
  page: number;

  @Column({ type: 'integer' })
  position!: number;

  @Column({ type: 'varchar', length: 512 })
  questionText: string;

  @Column({ type: 'bool', default: false })
  isMandatory: boolean;

  @Column({ type: 'varchar' })
  answer: string;

  @Column({ type: 'integer', default: 0 })
  points: number;

  @Column({ type: 'enum', enum: QuestionType })
  type!: QuestionType;

  @OneToMany(
    () => QuestionOptionEntity,
    (questionOption) => questionOption.question,
    { cascade: true, onDelete: 'CASCADE' }
  )
  questionOptions: QuestionOptionEntity[];

  @OneToMany(
    () => AnswerEntity,
    (answer) => answer.question,
    { cascade: true, onDelete: 'CASCADE' }
  )
  answers: AnswerEntity[];

  @ManyToOne(() => SurveyEntity, (survey) => survey.questions, { onDelete: 'CASCADE' })
  survey: SurveyEntity;
};