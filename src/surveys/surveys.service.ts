import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SurveyEntity } from './entities/survey.entity';
import { Repository } from 'typeorm';
import { GetSurveysQueryDto } from './dto/get-surveys-query.dto';
import { SurveyAccess } from './entities/survey.enum';

@Injectable()
export class SurveysService {
  private static readonly logger = new Logger(SurveysService.name);

  constructor(
    @InjectRepository(SurveyEntity)
    private surveyRepository: Repository<SurveyEntity>,
  ) {}

  
  async findSurveys(query: GetSurveysQueryDto, options?: { userId?: string; access?: SurveyAccess }) {
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
      queryBuilder.where('surveys.access = :access', { access: options.access });
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
      queryBuilder.orderBy(orderBy, orderDirection.toUpperCase() as 'ASC' | 'DESC');
    };

    // Count responses
    queryBuilder.addSelect(subQuery =>
      subQuery
        .select('COUNT(respondents.id)', 'respondentsCount')
        .from('respondents', 'respondents')
        .where('respondents.surveyId = surveys.id'),
      'respondentsCount',
    );

    // Pagination
    queryBuilder.skip((page - 1) * pageSize).take(pageSize);

    // Required fields
    queryBuilder.addSelect([
      'surveys.id',
      'surveys.name',
      'surveys.description',
      'surveys.isPublished',
      'surveys.access',
      'surveys.updatedAt',
    ]);

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
};
