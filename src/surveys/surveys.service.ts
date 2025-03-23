import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SurveyEntity } from './entities/survey.entity';
import { DeleteResult, Repository } from 'typeorm';
import { GetSurveysQueryDto } from './dto/get-surveys-query.dto';
import { SurveyAccess } from './enums/survey.enum';
import { UpdateSurveyDto } from './dto/update-survey.dto';
import { UsersService } from 'src/users/users.service';

type SurveyOptions = {
  userId?: string,
  access?: SurveyAccess,
  isPublished?: boolean
}

@Injectable()
export class SurveysService {
  private static readonly logger = new Logger(SurveysService.name);

  constructor(
    @InjectRepository(SurveyEntity)
    private surveyRepository: Repository<SurveyEntity>,

    private usersService: UsersService,
  ) {}


  /**
   * Create survey in DB related to existing user
   * @param {string} id User (survey author) uuid
   * @returns {Promise<SurveyEntity>} Created survey
   */
  async createSurvey(id: string): Promise<SurveyEntity> {
    const user = await this.usersService.findById(id)

    const survey = await this.surveyRepository.save({
      user: user,
    });

    SurveysService.logger.log(`Created new survey for user: ${id}`);
    return survey;
  };


  /**
   * Find survey in DB by id
   * @param {string} id Survey uuid
   * @returns {Promise<SurveyEntity>} Finded survey entity
   */
  async findById(id: string): Promise<SurveyEntity> {
    const survey = await this.surveyRepository
      .createQueryBuilder("surveys")
      .leftJoinAndSelect("surveys.questions", "questions")
      .leftJoinAndSelect("questions.questionOptions", "questionOptions")
      .leftJoin("surveys.user", "user")
      .where("surveys.id = :id", { id })
      .select([
        "surveys",
        "questions",
        "questionOptions",
        "user.id",
      ])
      .getOne();

    if (!survey) {
      SurveysService.logger.log(`No survey with id: ${id}`);
      throw new BadRequestException('Survey does not exist');
    };

    SurveysService.logger.log(`Finded survey with id: ${id}`);
    return survey;
  };


  /**
   * Finding surveys with filtration and sorting
   * @param {GetSurveysQueryDto} query Sorting and filtration params
   * @param {?SurveyOptions} [options] filtration by userId, access or isPublished fields
   * @returns Finded surveys with additional information: amount, pages amnount and current page
   */
  async findSurveys(query: GetSurveysQueryDto, options?: SurveyOptions) {
    const { search, page = 1, pageSize = 10, ordering } = query;

    const queryBuilder = this.surveyRepository.createQueryBuilder('surveys');

    let log_message = ''

    // Id filtration
    if (options?.userId) {
      log_message += `for user ${options.userId} `;
      queryBuilder.where('surveys.userId = :userId', { userId: options.userId });
    };

    // Access filtration
    if (options?.access) {
      log_message += ` with access option ${options.access}`;
      queryBuilder.andWhere('surveys.access = :access', { access: options.access });
    };

    // Published filtration
    if (options?.isPublished) {
      log_message += ` published - ${options.isPublished}`;
      queryBuilder.andWhere(
        'surveys.isPublished = :isPublished',
        { isPublished: options.isPublished }
      );
    };

    // Search filter (search in name and in description)
    if (search) {
      queryBuilder.andWhere(
        '(surveys.name LIKE :search OR surveys.description LIKE :search)',
        {
          search: `%${search}%`
        },
      );
    };

    // Order param
    if (ordering) {
      const [orderBy, orderDirection] = ordering.split(':');
      const validDirections = ['ASC', 'DESC'];
    
      if (orderBy && validDirections.includes(orderDirection.toUpperCase())) {
        queryBuilder.orderBy(orderBy, orderDirection.toUpperCase() as 'ASC' | 'DESC');
      } else {
        throw new Error('Invalid ordering format. Expected "field:asc" or "field:desc".');
      }
    }

    // Count responses
    queryBuilder.addSelect(subQuery =>
      subQuery
        .select('COUNT(responses.id)', 'responsesCount')
        .from('responses', 'responses')
        .where('responses.surveyId = surveys.id'),
      'responsesCount',
    );

    // Pagination
    queryBuilder.skip((page - 1) * pageSize).take(pageSize);

    // Execute the query and return the results
    const surveys = await queryBuilder.getMany();
    const totalSurveys = await queryBuilder.getCount();

    SurveysService.logger.log(log_message);
    SurveysService.logger.debug(log_message, surveys);
    return {
      surveys,
      totalSurveys,
      currentPage: page,
      totalPages: Math.ceil(totalSurveys / pageSize),
    };
  };


  /**
   * Update survey data in DB
   * @param {string} id Survey uuid
   * @param {UpdateSurveyDto} UpdateSurveyDto Update data for survey
   * @returns {Promise<SurveyEntity | null>} Updated survey
   */
  async update(id: string, UpdateSurveyDto: UpdateSurveyDto) {
    SurveysService.logger.log(`Updating survey with id: ${id}`);
    await this.surveyRepository.update({ id: id }, UpdateSurveyDto);

    const updatedSurvey = await this.surveyRepository.findOne({ where: { id } });
    return updatedSurvey;
  }


  /**
   * Delete survey in DB by id
   * @param {string} id Survey uuid
   * @returns {Promise<DeleteResult>} Deleting result
   */
  async deleteById(id: string): Promise<DeleteResult> {
    SurveysService.logger.log(`Deleting survey with id: ${id}`);
    const deleteResult = await this.surveyRepository.delete({ id: id });

    if (deleteResult.affected === 0) {
      SurveysService.logger.log(`Cannot delete survey. No survey with id: ${id}`);
      throw new NotFoundException(`Survey with id ${id} not found`);
    };

    return deleteResult;
  };


  /**
   * Find existing survey in DB by id without some data, like answers, timestamps and etc
   * @param {string} id Survey uuid
   * @returns {Promise<SurveyEntity>} Finded survey entity
   */
  async findForm(id: string): Promise<SurveyEntity> {
    // Can't fix bug - typeorm always include field isCorrect in option entity
    // Work both in query builder and findOne
    // User can find correct option in Network
    const form = await this.surveyRepository
      .createQueryBuilder("survey")
      .where("survey.id = :id", { id })
      .leftJoin("survey.questions", "questions")
      .leftJoin("questions.questionOptions", "questionOptions")
      .addSelect([
        "survey.id",
        "survey.name",
        "survey.isPublished",
        "survey.description",
        "survey.totalPoints",
        "questions.id",
        "questions.name",
        "questions.position",
        "questions.questionText",
        "questions.isMandatory",
        "questions.points",
        "questions.type",
        "questionOptions.id",
        "questionOptions.position",
        "questionOptions.points",
        "questionOptions.text"
      ])
      .getOne();

    if (!form) {
      SurveysService.logger.log(`Cannot find form form ${id}. No such survey`);
      throw new NotFoundException(`Form with id ${id} not found`);
    };

    return form;
  };
};
