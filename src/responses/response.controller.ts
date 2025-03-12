import { Controller, Get, UseGuards, Request, Param, Post, ParseUUIDPipe, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResponsesService } from './response.service';
import { AccessTokenGuard } from 'src/guards/accessToken.guard';
import { SurveyOwnerGuard } from 'src/guards/survey-owner.guards';
import { CreateResponseDto } from './dto/create-response.dto';

@ApiTags('responses')
@ApiBearerAuth()
@Controller('surveys/:surveyId')
export class ResponsesController {
  constructor(private responsesService: ResponsesService) {}


  @ApiOperation({ summary: 'Получить ответы на опрос' })
  @ApiParam({
    name: 'surveyId',
    description: 'UUID опроса',
    required: true
  })
  @ApiResponse({ status: 200, description: 'Ответы получены успешно' })
  @ApiResponse({ status: 403, description: 'Нет доступа' })
  @UseGuards(AccessTokenGuard, SurveyOwnerGuard)
  @Get('responses')
  async findMySurveyResponses(
    @Param('surveyId', ParseUUIDPipe) surveyId: string
  ) {
    return await this.responsesService.findResponses(surveyId);
  };


  @ApiOperation({ summary: 'Получить форму опроса' })
  @ApiParam({
    name: 'surveyId',
    description: 'UUID опроса',
    required: true
  })
  @ApiResponse({ status: 200, description: 'Форма опроса получена' })
  @ApiResponse({ status: 404, description: 'Опрос не найден' })
  @UseGuards(AccessTokenGuard)
  @Get('form')
  async findForm(
    @Param('surveyId', ParseUUIDPipe) surveyId: string
  ) {
    return await this.responsesService.findForm(surveyId);
  };


  @ApiOperation({ summary: 'Создать ответ на опрос' })
  @ApiParam({
    name: 'surveyId',
    description: 'UUID опроса',
    required: true
  })
  @ApiBody({
    description: 'Данные для создания полного ответа на опрос',
    type: CreateResponseDto,
    required: true
  })
  @ApiResponse({ status: 201, description: 'Ответ сохранен' })
  @ApiResponse({ status: 400, description: 'Ошибка валидации' })
  @UseGuards(AccessTokenGuard)
  @Post('responses')
  async create(
    @Request() req,
    @Param('surveyId', ParseUUIDPipe) surveyId: string,
    @Body() data: CreateResponseDto
  ) {
    const userId = req.user['sub'];
    return await this.responsesService.create(surveyId, userId, data);
  };
};
