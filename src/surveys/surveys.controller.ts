import { Controller, Get, UseGuards, Request, Query, Post, ParseUUIDPipe, Param, Patch, Body, Delete, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
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


  @ApiBearerAuth()
  @ApiOperation({ summary: 'Создать новый опрос' })
  @ApiResponse({ status: 201, description: 'Опрос успешно создан' })
  @ApiResponse({ status: 401, description: 'Пользователь не авторизован' })
  @UseGuards(AccessTokenGuard)
  @Post()
  async create(@Request() req) {
    const userId = req.user['sub'];
    return await this.surveysService.createSurvey(userId);
  };


  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить список собственных опросов' })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Фильтр по названию или описанию',
    example: 'Новый опрос'
  })
  @ApiQuery({ name: 'page',
    required: false,
    description: 'Номер страницы',
    example: 1
  })
  @ApiQuery({ name: 'pageSize',
    required: false,
    description: 'Количество опросов на странице',
    example: 10
  })
  @ApiQuery({ name: 'ordering',
    required: false,
    description: 'Сортировка опросов',
    example: 'name:ASC'
  })
  @ApiResponse({ status: 200, description: 'Список моих опросов' })
  @ApiResponse({ status: 401, description: 'Пользователь не авторизован' })
  @UseGuards(AccessTokenGuard)
  @Get('self')
  async findMySurveys(
    @Request() req,
    @Query() query: GetSurveysQueryDto
  ) {
    const userId = req.user['sub'];
    return await this.surveysService.findSurveys(query, { userId: userId });
  };


  @ApiOperation({ summary: 'Получить список публичных опросов' })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Фильтр по названию или описанию',
    example: 'Новый опрос'
  })
  @ApiQuery({ name: 'page',
    required: false,
    description: 'Номер страницы',
    example: 1
  })
  @ApiQuery({ name: 'pageSize',
    required: false,
    description: 'Количество опросов на странице',
    example: 10
  })
  @ApiQuery({ name: 'ordering',
    required: false,
    description: 'Сортировка опросов',
    example: 'name:ASC'
  })
  @ApiResponse({ status: 200, description: 'Список публичных опросов' })
  @Get('public')
  async findPublicSurveys(@Query() query: GetSurveysQueryDto) {
    return await this.surveysService.findSurveys(
      query,
      { access: SurveyAccess.PUBLIC, isPublished: true }
    );
  };


  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить собственный опрос по ID' })
  @ApiParam({
    name: 'surveyId',
    description: 'UUID опроса',
    required: true
  })
  @ApiResponse({ status: 200, description: 'Опрос найден' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  @ApiResponse({ status: 404, description: 'Опрос не найден' })
  @UseGuards(AccessTokenGuard, SurveyOwnerGuard)
  @Get(':surveyId')
  async findMySurveyById(
    @Param('surveyId', ParseUUIDPipe) surveyId: string
  ) {
    return await this.surveysService.findById(surveyId);
  };


  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновить мой опрос' })
  @ApiParam({
    name: 'surveyId',
    description: 'UUID опроса',
    required: true
  })
  @ApiBody({
    description: 'Данные для обновления опроса',
    type: UpdateSurveyDto,
  })
  @ApiResponse({ status: 200, description: 'Опрос успешно обновлен' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  @ApiResponse({ status: 404, description: 'Опрос не найден' })
  @UseGuards(AccessTokenGuard, SurveyOwnerGuard)
  @Patch(':surveyId')
  async updateMySurvey(
    @Param('surveyId', ParseUUIDPipe) surveyId: string,
    @Body() data: UpdateSurveyDto
  ) {
    return await this.surveysService.update(surveyId, data);
  };


  @ApiBearerAuth()
  @ApiOperation({ summary: 'Удалить мой опрос' })
  @ApiParam({
    name: 'surveyId',
    description: 'UUID опроса',
    required: true
  })
  @ApiResponse({ status: 204, description: 'Опрос удален' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  @ApiResponse({ status: 404, description: 'Опрос не найден' })
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
