import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponseEntity } from './entities/response.entity';
import { Repository } from 'typeorm';
import { CreateResponseDto } from './dto/create-response.dto';
import { SurveysService } from 'src/surveys/surveys.service';
import { omit } from 'lodash';

@Injectable()
export class ResponsesService {
  private static readonly logger = new Logger(ResponsesService.name);

  constructor(
    @InjectRepository(ResponseEntity)
    private responseRepository: Repository<ResponseEntity>,

    private surveysService: SurveysService,
  ) {}


  async findForm(surveyId: string) {
    const form = await this.surveysService.findForm(surveyId);
    
    if (!form.isPublished) {
      ResponsesService.logger.debug(`Survey does not available: ${surveyId}`);
      throw new ForbiddenException('Survey does not available');
    };

    // return form;
    // temporary solution - typeorm ignores select option in query builder
    return omit(form, ['access', 'questions.answer', 'questions.questionOptions.isCorrect']);
  };


  // async create(surveyId: string, userId: string, data: CreateResponseDto) {

  // };


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
