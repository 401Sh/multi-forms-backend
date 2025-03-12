import { Controller, Delete, Patch, Post, UseGuards, Param, Body, ParseUUIDPipe, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger';
import { QuestionsService } from './questions.service';
import { AccessTokenGuard } from 'src/guards/accessToken.guard';
import { SurveyOwnerGuard } from 'src/guards/survey-owner.guards';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { Response } from 'express';
import { omit } from 'lodash';

@ApiTags('questions')
@ApiBearerAuth()
@Controller('surveys/:surveyId/questions')
export class QuestionsController {
  constructor(private questionsService: QuestionsService) {}

  @ApiOperation({ summary: 'Создать новый вопрос в опросе' })
  @ApiParam({
    name: 'surveyId',
    description: 'UUID опроса',
    required: true
  })
  @ApiBody({
    description: 'Данные для создания вопроса',
    type: CreateQuestionDto,
    required: true
  })
  @ApiResponse({ status: 201, description: 'Вопрос успешно создан' })
  @ApiResponse({ status: 400, description: 'Ошибка валидации' })
  @ApiResponse({ status: 403, description: 'Доступ запрещён' })
  @UseGuards(AccessTokenGuard, SurveyOwnerGuard)
  @Post()
  async create(
    @Param('surveyId', ParseUUIDPipe) surveyId: string,
    @Body() data: CreateQuestionDto
  ) {
    const question = await this.questionsService.createQuestionTransaction(surveyId, data);

    return omit(question, 'survey');
  };


  @ApiOperation({ summary: 'Обновить существующий вопрос' })
  @ApiParam({
    name: 'questionId',
    description: 'UUID вопроса',
    required: true
  })
  @ApiBody({
    description: 'Данные для обновления вопроса',
    type: UpdateQuestionDto,
  })
  @ApiResponse({ status: 200, description: 'Вопрос успешно обновлён' })
  @ApiResponse({ status: 400, description: 'Ошибка валидации' })
  @ApiResponse({ status: 403, description: 'Доступ запрещён' })
  @ApiResponse({ status: 404, description: 'Вопрос не найден' })
  @UseGuards(AccessTokenGuard, SurveyOwnerGuard)
  @Patch(':questionId')
  async updateById(
    @Param('questionId', ParseUUIDPipe) questionId: string,
    @Body() data: UpdateQuestionDto
  ) {
    return await this.questionsService.updateQuestionTransaction(questionId, data);
  };


  @ApiOperation({ summary: 'Удалить вопрос' })
  @ApiParam({
    name: 'questionId',
    description: 'UUID вопроса',
    required: true
  })
  @ApiResponse({ status: 204, description: 'Вопрос успешно удалён' })
  @ApiResponse({ status: 403, description: 'Доступ запрещён' })
  @ApiResponse({ status: 404, description: 'Вопрос не найден' })
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
