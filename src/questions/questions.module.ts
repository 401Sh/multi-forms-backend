import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionEntity } from './entities/question.entity';
import { QuestionsService } from './questions.service';
import { QuestionsController } from './questions.controller';
import { QuestionOptionEntity } from './entities/question-option.entity';
import { SurveysModule } from 'src/surveys/surveys.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      QuestionEntity,
      QuestionOptionEntity
    ]),
    SurveysModule
  ],
  providers: [QuestionsService],
  controllers: [QuestionsController]
})
export class QuestionsModule {}
