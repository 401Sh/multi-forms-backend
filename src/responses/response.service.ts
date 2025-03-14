import { BadRequestException, ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponseEntity } from './entities/response.entity';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { CreateResponseDto } from './dto/create-response.dto';
import { SurveysService } from 'src/surveys/surveys.service';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { AnswerEntity } from './entities/answer.entity';
import { QuestionsService } from 'src/questions/questions.service';
import { QuestionOptionEntity } from 'src/questions/entities/question-option.entity';
import { QuestionEntity } from 'src/questions/entities/question.entity';
import { QuestionType } from 'src/questions/enums/question.enum';
import { AnswerOptionEntity } from './entities/answer-option.entity';
import { SurveyEntity } from 'src/surveys/entities/survey.entity';

@Injectable()
export class ResponsesService {
  private static readonly logger = new Logger(ResponsesService.name);

  constructor(
    @InjectRepository(ResponseEntity)
    private responseRepository: Repository<ResponseEntity>,
    @InjectRepository(AnswerEntity)

    private surveysService: SurveysService,
    private questionsService: QuestionsService,
    private readonly dataSource: DataSource
  ) {}


  /**
   * Find form for response
   * @param {string} surveyId Survey id
   * @returns {Promise<SurveyEntity>} Finded form
   */
  async findForm(surveyId: string) {
    const form = await this.surveysService.findForm(surveyId);
    
    if (!form.isPublished) {
      ResponsesService.logger.debug(`Survey does not available: ${surveyId}`);
      throw new ForbiddenException('Survey does not available');
    };

    return form;
  };


  // Abomination function - needs to rework
  /**
   * Create response transaction with score calculation
   * belonging to the user and referring to the survey
   * @param {string} surveyId Survey uuid
   * @param {string} userId User uuid
   * @param {CreateResponseDto} data Response data
   * @returns {Promise<ResponseEntity>} Created response
   */
  async create(surveyId: string, userId: string, data: CreateResponseDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    ResponsesService.logger.log('Started Response create transaction');

    try {
      const questionIds = data.answers.map(d => d.questionId);
      const questions = await this.questionsService.findSurveyQuestionsByIds(
        queryRunner, surveyId, questionIds
      );
      const survey = await queryRunner.manager.findOne(
        SurveyEntity, { where: { id: surveyId } }
      );

      if (!survey) {
        ResponsesService.logger.log(`No survey with id: ${surveyId}`);
        throw new BadRequestException('Survey does not exist');
      };
      
      const response = queryRunner.manager.create(
        ResponseEntity,
        {
        survey: { id: surveyId },
        user: { id: userId },
        totalPoints: survey.totalPoints,
        score: 0
        }
      );
      await queryRunner.manager.save(ResponseEntity, response);

      const { createdAnswers, score } = await this.createAnswersAndCalcScore(
        queryRunner, response, questions, data.answers
      );

      response.answers = createdAnswers;
      response.score = score;

      const created_response = await queryRunner.manager.save(ResponseEntity, response);

      await queryRunner.commitTransaction();
      ResponsesService.logger.log('Response create transaction has been successfully ended');

      return created_response;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      ResponsesService.logger.log('Response create transaction has failed and was rolled back');
      ResponsesService.logger.error(`Response create transaction failed: ${error.message}`, error);
      throw error;
    } finally {
      await queryRunner.release();
    };
  };


  // Abomination function - needs to rework
  /**
   * Create answers with choosed options for response by givin data and calc score
   * @param {QueryRunner} queryRunner QuerryRunner for Typeorm transaction
   * @param {ResponseEntity} response Respinse uuid
   * @param {QuestionEntity[]} questions Question array for comparison
   * @param {CreateAnswerDto[]} data Response answers data
   * @returns Created Answers and current response score
   */
  private async createAnswersAndCalcScore(
    queryRunner: QueryRunner,
    response: ResponseEntity,
    questions: QuestionEntity[],
    data: CreateAnswerDto[]
  ) {
    let score = 0;
    const answers: AnswerEntity[] = [];

    for (const d of data) {
      const question = questions.find(q => q.id === d.questionId);
      if (!question) continue;

      const answer = queryRunner.manager.create(
        AnswerEntity,
        {
        response,
        question: { id: question.id } as QuestionEntity,
        answerText: question.type === QuestionType.TEXT ? d.answerText : undefined
        }
      );

      if (question.type === QuestionType.TEXT) {
        if (question.answer === d.answerText) {
          score += question.points;
        };
      } else {
        await queryRunner.manager.save(AnswerEntity, answer);

        const { createdAnswerOptions, additionalScore } = await this.createOptionsAndCalcScore(
          queryRunner, answer, d.answerOptions, question.questionOptions
        );
        answer.answerOptions = createdAnswerOptions;
        score += additionalScore;
      };

      await queryRunner.manager.save(AnswerEntity, answer);
      answers.push(answer);
    };

    return { createdAnswers: answers, score };
  };


  // Abomination function - needs to rework
  /**
   * Create choosed options for question by givin data and calc score
   * @param {AnswerEntity} answer Answer uuid
   * @param {string[]} data Choosed options uuids
   * @param {QuestionOptionEntity[]} options Option array for comparison
   * @returns Created AnswerOptions and current answer score
   */
  private async createOptionsAndCalcScore(
    queryRunner: QueryRunner,
    answer: AnswerEntity,
    data: string[],
    options: QuestionOptionEntity[]
  ) {
    let score = 0;
    const answerOptions: AnswerOptionEntity[] = [];

    for (const d of data) {
      const option = options.find(o => o.id === d);
      if (!option) continue;

      const answerOption = queryRunner.manager.create(
        AnswerOptionEntity,
        {
        answer: { id: answer.id },
        questionOption: { id: option.id }
        }
      );

      if (option.isCorrect) {
        score += option.points;
      };

      await queryRunner.manager.save(AnswerOptionEntity, answerOption);
      answerOptions.push(answerOption);
    };

    return { createdAnswerOptions: answerOptions, additionalScore: score };
  };


  /**
   * Find all responses belonging to the survey
   * @param {string} surveyId Survey uuid
   * @returns {Promise<ResponseEntity[]>} Finded responses
   */
  async findResponses(surveyId: string) {
    ResponsesService.logger.log(`Finding all responses for survey: ${surveyId}`);
    
    const responses = await this.responseRepository
      .createQueryBuilder('responses')
      .leftJoinAndSelect('responses.answers', 'answers')
      .leftJoinAndSelect('answers.answerOptions', 'answerOptions')
      .where('responses.surveyId = :surveyId', { surveyId })
      .getMany();

    return responses;
  };
};
