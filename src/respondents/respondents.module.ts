import { Module } from '@nestjs/common';
import { RespondentsController } from './respondents.controller';
import { RespondentsService } from './respondents.service';
import { ApiTags } from '@nestjs/swagger';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnswerEntity } from './entities/answer.entity';
import { RespondentEntity } from './entities/respondent.entity';
import { AnswerOptionEntity } from './entities/answer-option.entity';

@ApiTags('users')
@Module({
  imports: [TypeOrmModule.forFeature([
    AnswerEntity,
    RespondentEntity,
    AnswerOptionEntity
  ])],
  controllers: [RespondentsController],
  providers: [RespondentsService]
})
export class RespondentsModule {}
