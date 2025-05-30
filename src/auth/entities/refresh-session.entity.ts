import { UserEntity } from 'src/users/entities/user.entity';
import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  BaseEntity,
  ManyToOne
} from 'typeorm';

@Entity('refreshSessions')
export class RefreshSessionEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 512, unique:
    true, nullable: false
  })
  refreshToken!: string;

  @Column({ type: 'varchar', length: 512 })
  userAgent: string;

  @Column({ type: 'varchar', length: 45 })
  ip: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  fingerprint: string;

  @Column({ type: 'timestamp'})
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(
    () => UserEntity,
    (user) => user.refreshSessions,
    { onDelete: 'CASCADE', nullable: false }
  )
  user: UserEntity
};