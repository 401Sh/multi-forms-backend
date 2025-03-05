import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  CreateDateColumn, 
  UpdateDateColumn,
  BaseEntity,
  OneToMany
} from 'typeorm';
import { SurveyAccess } from './survey.enum';
import { UserEntity } from 'src/users/entities/user.entity';
import { QuestionEntity } from './question.entity';
import { RespondentEntity } from 'src/respondents/entities/respondent.entity';

@Entity('surveys')
export class SurveyEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 512 })
  description: string;

  @Column({ type: 'bool', default: false })
  isPublished: boolean;

  @Column({ type: 'enum', enum: SurveyAccess, default: SurveyAccess.PUBLIC })
  access: SurveyAccess;

  @Column({ type: 'integer' })
  totalPoints: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => QuestionEntity, (question) => question.survey)
  questions: QuestionEntity[];

  @OneToMany(() => RespondentEntity, (respondent) => respondent.survey)
  respondents: RespondentEntity[];

  @ManyToOne(() => UserEntity, (user) => user.surveys)
  user: UserEntity;
};