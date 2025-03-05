import { Module } from '@nestjs/common';
import { SurveysService } from './surveys.service';
import { SurveysController } from './surveys.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SurveyEntity } from './entities/survey.entity';
import { QuestionEntity } from './entities/question.entity';
import { QuestionOptionEntity } from './entities/question-option.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    SurveyEntity,
    QuestionEntity,
    QuestionOptionEntity
  ])],
  providers: [SurveysService],
  controllers: [SurveysController]
})
export class SurveysModule {}
