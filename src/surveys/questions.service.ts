import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { QuestionEntity } from './entities/question.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateQuestionDto } from './dto/create-question.dto';
import { SurveyEntity } from './entities/survey.entity';
import { QuestionOptionEntity } from './entities/question-option.entity';
import { QuestionType } from './entities/survey.enum';

@Injectable()
export class QuestionsService {
  private static readonly logger = new Logger(QuestionsService.name);
  
  constructor(
    @InjectRepository(SurveyEntity)
    private surveyRepository: Repository<SurveyEntity>,
    @InjectRepository(QuestionEntity)
    private questionRepository: Repository<QuestionEntity>,
    @InjectRepository(QuestionOptionEntity)
    private questionOptionRepository: Repository<QuestionOptionEntity>,
  ) {}

  
  async createQuestion(surveyId: string, data: CreateQuestionDto) {
    const survey = await this.surveyRepository.findOne(
      { where: { id: surveyId } }
    );

    if (!survey) {
      QuestionsService.logger.debug(`Cannot create question for survey ${surveyId}. No such survey`);
      throw new NotFoundException(`Survey not found`);
    };

    let questionOption: QuestionOptionEntity | undefined = undefined;
    if (data.type != QuestionType.TEXT) {
      questionOption = await this.questionOptionRepository.save({
        position: 1,
        text: 'Опция 1'
      });
    };

    const question = this.questionRepository.save({
      survey: { id: survey.id },
      ...data,
      questionOptions: questionOption ? [questionOption] : []
    });

    QuestionsService.logger.debug(`Created new question for survey: ${surveyId}`);
    return question;
  };


  async deleteById(id: string) {
    QuestionsService.logger.log(`Deleting question with id: ${id}`);
    const deleteResult = await this.questionRepository.delete({ id: id });

    if (deleteResult.affected === 0) {
      QuestionsService.logger.debug(`Cannot delete question. No question with id: ${id}`);
      throw new NotFoundException(`Question with id ${id} not found`);
    };

    return deleteResult;
  };
};
