import { Module } from '@nestjs/common';
import { SurveysService } from './surveys.service';
import { SurveysController } from './surveys.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SurveyEntity } from './entities/survey.entity';
import { UsersModule } from 'src/users/users.module';
import { SurveyOwnerGuard } from 'src/guards/survey-owner.guards';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SurveyEntity,
    ]),
    UsersModule
  ],
  providers: [SurveysService, SurveyOwnerGuard],
  controllers: [SurveysController],
  exports: [SurveysService]
})
export class SurveysModule {}
