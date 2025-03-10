import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  BaseEntity,
  OneToMany
} from 'typeorm';
import { RefreshSessionEntity } from 'src/auth/entities/refresh-session.entity';
import { SurveyEntity } from 'src/surveys/entities/survey.entity';
import { ResponseEntity } from 'src/responses/entities/response.entity';

@Entity('users')
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: false })
  login!: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  password!: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => SurveyEntity, (survey) => survey.user)
  surveys: SurveyEntity[];

  @OneToMany(() => ResponseEntity, (response) => response.user)
  responses: ResponseEntity[];

  @OneToMany(
    () => RefreshSessionEntity,
    (refreshSession) => refreshSession.user,
    { cascade: true, onDelete: 'CASCADE' }
  )
  refreshSessions: RefreshSessionEntity[];
};