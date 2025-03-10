import { Controller, Get, UseGuards, Request, Param, Post, ParseUUIDPipe, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ResponsesService } from './response.service';
import { AccessTokenGuard } from 'src/guards/accessToken.guard';
import { SurveyOwnerGuard } from 'src/guards/survey-owner.guards';

@ApiTags('responses')
@Controller('surveys/:surveyId')
export class ResponsesController {
  constructor(private responsesService: ResponsesService) {}


  @UseGuards(AccessTokenGuard, SurveyOwnerGuard)
  @Get('responses')
  async findMySurveyResponses(
    @Param('surveyId', ParseUUIDPipe) surveyId: string
  ) {
    return await this.responsesService.findResponses(surveyId);
  };


  @UseGuards(AccessTokenGuard)
  @Get('form')
  async findForm(
    @Param('surveyId', ParseUUIDPipe) surveyId: string
  ) {
    return await this.responsesService.findForm(surveyId);
  };


  // @UseGuards(AccessTokenGuard)
  // @Post()
  // async create(
  //   @Request() req,
  //   @Param('surveyId', ParseUUIDPipe) surveyId: string,
  //   @Body() data: CreateResponseDto
  // ) {
  //   const userId = req.user['sub'];
  //   return await this.responsesService.create(surveyId, userId, data);
  // };
};
