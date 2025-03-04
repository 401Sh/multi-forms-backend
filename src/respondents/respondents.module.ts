import { Module } from '@nestjs/common';
import { RespondentsController } from './respondents.controller';
import { RespondentsService } from './respondents.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('users')
@Module({
  controllers: [RespondentsController],
  providers: [RespondentsService]
})
export class RespondentsModule {}
