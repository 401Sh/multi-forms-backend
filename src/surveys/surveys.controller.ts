import { Controller, Get, UseGuards, Request, Query, Post, ParseUUIDPipe, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from 'src/guards/accessToken.guard';
import { SurveysService } from './surveys.service';
import { GetSurveysQueryDto } from './dto/get-surveys-query.dto';
import { SurveyAccess } from './entities/survey.enum';

@ApiTags('surveys')
@Controller('surveys')
export class SurveysController {
  constructor(private surveysService: SurveysService) {}


  @UseGuards(AccessTokenGuard)
  @Post()
  async postSurvey(@Request() req) {
    const userId = req.user['sub'];
    return await this.surveysService.createSurvey(userId);
  };


  @UseGuards(AccessTokenGuard)
  @Get('me')
  async getMe(
    @Request() req,
    @Query() query: GetSurveysQueryDto
  ) {
    const userId = req.user['sub'];
    return await this.surveysService.findSurveys(query, { userId: userId });
  };


  // No 'private' or 'all' route in terms of privacy
  @Get('public')
  async getPublic(@Query() query: GetSurveysQueryDto) {
    return await this.surveysService.findSurveys(
      query,
      { access: SurveyAccess.PUBLIC, isPublished: true }
    );
  };


  @UseGuards(AccessTokenGuard)
  @Get('me/:id')
  async getOne(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string
  ) {
    const userId = req.user['sub'];
    return await this.surveysService.findById(id, userId);
  };
};
