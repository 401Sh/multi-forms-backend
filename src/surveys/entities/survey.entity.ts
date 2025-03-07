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

  @Column({ type: 'varchar', length: 255, default: 'Новый опрос' })
  name: string = 'Новый опрос';

  @Column({ type: 'varchar', length: 512, default: '' })
  description: string = '';

  @Column({ type: 'bool', default: false })
  isPublished: boolean = false;

  @Column({ type: 'enum', enum: SurveyAccess, default: SurveyAccess.PUBLIC })
  access: SurveyAccess = SurveyAccess.PUBLIC;

  @Column({ type: 'integer', default: 0 })
  totalPoints: number = 0;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(
    () => QuestionEntity,
    (question) => question.survey,
    { cascade: true, onDelete: 'CASCADE' }
  )
  questions: QuestionEntity[];

  @OneToMany(
    () => RespondentEntity,
    (respondent) => respondent.survey,
    { cascade: true, onDelete: 'CASCADE' }
  )
  respondents: RespondentEntity[];

  @ManyToOne(
    () => UserEntity,
    (user) => user.surveys,
    { onDelete: 'SET NULL', nullable: true }
  )
  user: UserEntity;
};