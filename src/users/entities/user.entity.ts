import { RefreshSessionEntity } from 'src/auths/entities/refresh-session.entity';
import { RespondentEntity } from 'src/respondents/entities/respondent.entity';
import { SurveyEntity } from 'src/surveys/entities/survey.entity';
import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  BaseEntity,
  OneToMany
} from 'typeorm';

@Entity('users')
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  login!: string;

  @Column({ type: 'varchar', length: 255 })
  password!: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => SurveyEntity, (survey) => survey.user)
  surveys: SurveyEntity[];

  @OneToMany(() => RespondentEntity, (respondent) => respondent.user)
  respondents: RespondentEntity[];

  @OneToMany(() => RefreshSessionEntity, (refreshSessions) => refreshSessions.user)
  refreshSessions: RefreshSessionEntity[];
};