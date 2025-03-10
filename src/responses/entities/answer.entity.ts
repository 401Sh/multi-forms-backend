import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  BaseEntity,
  OneToMany
} from 'typeorm';
import { ResponseEntity } from './response.entity';
import { QuestionEntity } from 'src/questions/entities/question.entity';
import { AnswerOptionEntity } from './answer-option.entity';

@Entity('answers')
export class AnswerEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  answerText?: string;

  @ManyToOne(
    () => ResponseEntity,
    (response) => response.answers,
    { onDelete: 'CASCADE', nullable: false }
  )
  response: ResponseEntity;
  
  @ManyToOne(
    () => QuestionEntity,
    (question) => question.answers,
    { onDelete: 'CASCADE', nullable: false }
  )
  question: QuestionEntity;

  @OneToMany(() => AnswerOptionEntity, (answerOption) => answerOption.answer)
  answerOptions: AnswerOptionEntity[];
};