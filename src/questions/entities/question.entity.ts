import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  BaseEntity,
  OneToMany
} from 'typeorm';
import { QuestionType } from '../enums/question.enum';
import { SurveyEntity } from 'src/surveys/entities/survey.entity';
import { AnswerEntity } from 'src/responses/entities/answer.entity';
import { QuestionOptionEntity } from './question-option.entity';

@Entity('questions')
export class QuestionEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, default: 'Новый вопрос' })
  name: string = 'Новый вопрос';

  @Column({ type: 'integer', default: 1 })
  page: number = 1;

  @Column({ type: 'integer', nullable: false })
  position!: number;

  @Column({ type: 'varchar', length: 512, default: '' })
  questionText: string = '';

  @Column({ type: 'bool', default: false })
  isMandatory: boolean = false;

  @Column({ type: 'varchar', nullable: true })
  answer?: string;

  @Column({ type: 'integer', default: 0 })
  points: number = 0;

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

  @ManyToOne(
    () => SurveyEntity,
    (survey) => survey.questions,
    { onDelete: 'CASCADE', nullable: false }
  )
  survey: SurveyEntity;
};