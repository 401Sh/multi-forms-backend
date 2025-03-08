import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { SurveysService } from '../surveys/surveys.service';

@Injectable()
export class SurveyOwnerGuard implements CanActivate {
  constructor(
    private readonly surveysService: SurveysService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const surveyId = request.params.surveyId;

    // Skip check for no surveyId routes
    if (!surveyId) {
      return true;
    }

    const survey = await this.surveysService.findById(surveyId);

    if (survey.user.id !== user.sub) {
      const logger = new Logger(SurveyOwnerGuard.name);
      logger.log('Attempt to access resource, which does not belong to the user')
      throw new ForbiddenException('You do not own this resource');
    }

    return true;
  }
}
