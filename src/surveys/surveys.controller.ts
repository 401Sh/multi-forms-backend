import { Controller, Get, UseGuards, Request, Query, Post, ParseUUIDPipe, Param, Patch, Body, Delete, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from 'src/guards/accessToken.guard';
import { SurveysService } from './surveys.service';
import { GetSurveysQueryDto } from './dto/get-surveys-query.dto';
import { SurveyAccess } from './enums/survey.enum';
import { UpdateSurveyDto } from './dto/update-survey.dto';
import { Response } from 'express';
import { SurveyOwnerGuard } from 'src/guards/survey-owner.guards';

@ApiTags('surveys')
@Controller('surveys')
export class SurveysController {
  constructor(private surveysService: SurveysService) {}


  @UseGuards(AccessTokenGuard)
  @Post()
  async create(@Request() req) {
    const userId = req.user['sub'];
    return await this.surveysService.createSurvey(userId);
  };


  @UseGuards(AccessTokenGuard)
  @Get('self')
  async findMySurveys(
    @Request() req,
    @Query() query: GetSurveysQueryDto
  ) {
    const userId = req.user['sub'];
    return await this.surveysService.findSurveys(query, { userId: userId });
  };


  // No 'private' or 'all' route in terms of privacy
  @Get('public')
  async findPublicSurveys(@Query() query: GetSurveysQueryDto) {
    return await this.surveysService.findSurveys(
      query,
      { access: SurveyAccess.PUBLIC, isPublished: true }
    );
  };


  @UseGuards(AccessTokenGuard, SurveyOwnerGuard)
  @Get(':surveyId')
  async findMySurveyById(
    @Param('surveyId', ParseUUIDPipe) surveyId: string
  ) {
    return await this.surveysService.findById(surveyId);
  };


  @UseGuards(AccessTokenGuard, SurveyOwnerGuard)
  @Patch(':surveyId')
  async updateMySurvey(
    @Param('surveyId', ParseUUIDPipe) surveyId: string,
    @Body() data: UpdateSurveyDto
  ) {
    return await this.surveysService.update(surveyId, data);
  };


  @UseGuards(AccessTokenGuard, SurveyOwnerGuard)
  @Delete(':surveyId')
  async deleteMySurvey(
    @Res() res: Response,
    @Param('surveyId', ParseUUIDPipe) surveyId: string,
  ) {
    await this.surveysService.deleteById(surveyId);
    return res.send({ message: 'Survey deleted successfully', statusCode: 204 });
  };
};
