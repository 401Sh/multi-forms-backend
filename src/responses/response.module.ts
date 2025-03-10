import { Module } from '@nestjs/common';
import { ResponsesController } from './response.controller';
import { ResponsesService } from './response.service';
import { ApiTags } from '@nestjs/swagger';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnswerEntity } from './entities/answer.entity';
import { ResponseEntity } from './entities/response.entity';
import { AnswerOptionEntity } from './entities/answer-option.entity';

@ApiTags('responses')
@Module({
  imports: [TypeOrmModule.forFeature([
    ResponseEntity,
    AnswerEntity,
    AnswerOptionEntity
  ])],
  controllers: [ResponsesController],
  providers: [ResponsesService]
})
export class ResponsesModule {}
