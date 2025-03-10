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

@Entity('responses')
export class ResponseEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'integer', default: 0 })
  score: number = 0;

  @Column({ type: 'integer', default: 0 })
  totalPoints: number = 0;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(
    () => AnswerEntity,
    (answer) => answer.response,
    { cascade: true, onDelete: 'CASCADE' }
  )
  answers: AnswerEntity[];

  @ManyToOne(
    () => SurveyEntity,
    (survey) => survey.responses,
    { onDelete: 'CASCADE', nullable: false }
  )
  survey: SurveyEntity;

  @ManyToOne(
    () => UserEntity,
    (user) => user.responses,
    { onDelete: 'SET NULL', nullable: true }
  )
  user: UserEntity;
};