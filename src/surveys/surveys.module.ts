import { Module } from '@nestjs/common';
import { SurveysService } from './surveys.service';
import { SurveysController } from './surveys.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SurveyEntity } from './entities/survey.entity';
import { QuestionEntity } from './entities/question.entity';
import { QuestionOptionEntity } from './entities/question-option.entity';
import { QuestionsController } from './questions.controller';
import { QuestionsService } from './questions.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SurveyEntity,
      QuestionEntity,
      QuestionOptionEntity
    ]),
    UsersModule
  ],
  providers: [SurveysService, QuestionsService],
  controllers: [SurveysController, QuestionsController]
})
export class SurveysModule {}
