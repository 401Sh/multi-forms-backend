import { 
  Entity, 
  PrimaryGeneratedColumn, 
  ManyToOne, 
  CreateDateColumn, 
  BaseEntity,
  OneToMany,
  Column
} from 'typeorm';
import { AnswerEntity } from './answer.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { SurveyEntity } from 'src/surveys/entities/survey.entity';

@Entity('respondents')
export class RespondentEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'integer', default: 0 })
  score: number;

  @Column({ type: 'integer' })
  totalPoints: number;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(
    () => AnswerEntity,
    (answer) => answer.respondent,
    { cascade: true, onDelete: 'CASCADE' }
  )
  answers: AnswerEntity[];

  @ManyToOne(
    () => SurveyEntity,
    (survey) => survey.respondents,
    { onDelete: 'CASCADE', nullable: false }
  )
  survey: SurveyEntity;

  @ManyToOne(
    () => UserEntity,
    (user) => user.respondents,
    { onDelete: 'SET NULL', nullable: true }
  )
  user: UserEntity;
};