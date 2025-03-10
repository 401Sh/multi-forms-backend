import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponseEntity } from './entities/response.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ResponsesService {
  private static readonly logger = new Logger(ResponsesService.name);

  constructor(
    @InjectRepository(ResponseEntity)
    private responseRepository: Repository<ResponseEntity>
  ) {}


  async findResponses(surveyId: string) {
    ResponsesService.logger.log(`Finding all responses for survey: ${surveyId}`);
    
    const responses = await this.responseRepository
      .createQueryBuilder('responses')
      .leftJoinAndSelect('responses.answers', 'answers')
      .leftJoinAndSelect('answers.answerOptions', 'answerOptions')
      .where('responses.surveyId = :surveyId', { surveyId })
      .getMany();

    // const responses = await this.responseRepository
    // .createQueryBuilder('response')
    // .leftJoinAndSelect('response.answers', 'answer')
    // .leftJoinAndSelect('answer.answerOptions', 'answerOption')
    // .where('response.surveyId = :surveyId', { surveyId })
    // .getMany();

    return responses;
  };
};
