import { Controller, Delete, Patch, Post, UseGuards, Param, Body, ParseUUIDPipe, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { QuestionsService } from './questions.service';
import { AccessTokenGuard } from 'src/guards/accessToken.guard';
import { SurveyOwnerGuard } from 'src/guards/survey-owner.guards';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { Response } from 'express';

@ApiTags('questions')
@Controller('surveys/:surveyId/questions')
export class QuestionsController {
  constructor(private questionsService: QuestionsService) {}

  @UseGuards(AccessTokenGuard, SurveyOwnerGuard)
  @Post()
  async create(
    @Param('surveyId', ParseUUIDPipe) surveyId: string,
    @Body() data: CreateQuestionDto
  ) {
    return await this.questionsService.createQuestionTransaction(surveyId, data);
  };


  @UseGuards(AccessTokenGuard, SurveyOwnerGuard)
  @Patch(':questionId')
  async updateById(
    @Param('questionId', ParseUUIDPipe) questionId: string,
    @Body() data: UpdateQuestionDto
  ) {
    return await this.questionsService.updateQuestionTransaction(questionId, data)
  };


  @UseGuards(AccessTokenGuard, SurveyOwnerGuard)
  @Delete(':questionId')
  async deleteById(
    @Res() res: Response,
    @Param('questionId', ParseUUIDPipe) questionId: string
  ) {
    await this.questionsService.deleteById(questionId);
    return res.send({ message: 'Question deleted successfully', statusCode: 204 });
  };
};
