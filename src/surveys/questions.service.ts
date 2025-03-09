import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { QuestionEntity } from './entities/question.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateQuestionDto } from './dto/create-question.dto';
import { SurveyEntity } from './entities/survey.entity';
import { QuestionOptionEntity } from './entities/question-option.entity';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { QuestionType } from './entities/survey.enum';
import { UpdateQuestionOptionDto } from './dto/update-question-option.dto';

@Injectable()
export class QuestionsService {
  private static readonly logger = new Logger(QuestionsService.name);
  
  constructor(
    @InjectRepository(SurveyEntity)
    private surveyRepository: Repository<SurveyEntity>,
    @InjectRepository(QuestionEntity)
    private questionRepository: Repository<QuestionEntity>,
    @InjectRepository(QuestionOptionEntity)
    private questionOptionRepository: Repository<QuestionOptionEntity>,

    private readonly dataSource: DataSource
  ) {}

  
  async createQuestion(surveyId: string, data: CreateQuestionDto) {
    const survey = await this.surveyRepository.findOne(
      { where: { id: surveyId } }
    );

    if (!survey) {
      QuestionsService.logger.debug(`Cannot create question for survey ${surveyId}. No such survey`);
      throw new NotFoundException(`Survey not found`);
    };

    let questionOption: QuestionOptionEntity | undefined = undefined;
    if (data.type != QuestionType.TEXT) {
      questionOption = await this.questionOptionRepository.save({
        position: 1,
        text: 'Опция 1'
      });
    };

    const question = this.questionRepository.save({
      survey: { id: survey.id },
      ...data,
      questionOptions: questionOption ? [questionOption] : []
    });

    QuestionsService.logger.debug(`Created new question for survey: ${surveyId}`);
    return question;
  };


  async updateQuestionTransaction(id: string, data: UpdateQuestionDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    QuestionsService.logger.debug('Started Question update transaction');

    try {
      const question = await queryRunner.manager.findOne(
        QuestionEntity,
        {
          where: { id },
          relations: ['questionOptions', 'survey']
        }
      );

      if (!question) {
        QuestionsService.logger.debug(`Cannot update question ${id}. No such question`);
        throw new NotFoundException(`Question with ID ${id} not found`);
      };

      // const hasChanges = Object.entries(data).some(([key, value]) => data[key] !== value);
      // if (!hasChanges) {
      //   return question;
      // }

      let newPoints: number | undefined;

      const oldPoints = question.points;
      const oldPosition = question.position;
      const oldSurveyId = question.survey.id;

      if (question.type != QuestionType.TEXT) {
        // Update options data if needed
        if (data.questionOptions && data.questionOptions.length > 0) {
          const options = await this.updateQuestionOptions(
            queryRunner, question, data.questionOptions
          );
  
          // Calc and update question points
          newPoints = options.reduce(
            (sum, option) => sum + option.points, 0
          );
          question.points = newPoints;
        } else {
          newPoints = 0;
        }
      } else {
        newPoints = data.points;
      };

      // Update survey points
      if (newPoints !== undefined && newPoints != oldPoints) {
        await this.updateSurveyTotalPoints(
          queryRunner, oldSurveyId, newPoints, oldPoints
        );
      };

      // Update question data
      await this.updateQuestionData(queryRunner, question, data);

      // Обновление позиций остальных вопросов через транзакцию
      if (data.position !== undefined && data.position !== oldPosition) {
        await this.reorderPositions(queryRunner, oldSurveyId, oldPosition, data.position);
      };

      await queryRunner.commitTransaction();
      QuestionsService.logger.debug('Question update transaction has been successfully ended');

      const updatedQuestion = this.questionRepository.findOne(
        { where: { id }, relations: ['questionOptions'] }
      )

      return updatedQuestion;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      QuestionsService.logger.debug('Question update transaction has failed and was rolled back');
      QuestionsService.logger.error(`Question update transaction failed: ${error.message}`, error);
      throw error;
    } finally {
      await queryRunner.release();
    };
  };


  async updateQuestionData(
    queryRunner: QueryRunner,
    question: QuestionEntity,
    data: UpdateQuestionDto
  ) {
    let updateData: Partial<UpdateQuestionDto>
    if (question.type == QuestionType.TEXT) {
      const { position, questionOptions, ...otherData } = data
      updateData = otherData
    } else {
      const { position, answer, points, questionOptions, ...otherData } = data
      updateData = otherData
    };
    
    await queryRunner.manager.update(QuestionEntity, question.id, updateData);

    // const updatedQuestion = await queryRunner.manager.findOne(
    //   QuestionEntity, { where: { id: question.id } }
    // );

    // if (!updatedQuestion) {
    //   QuestionsService.logger.debug(`Cannot update fields in question ${question.id}. No such question`);
    //   throw new NotFoundException(`Question with ID ${question.id} not found`);
    // };

    // return updatedQuestion;
  };


  private async updateQuestionOptions(
    queryRunner: QueryRunner,
    question: QuestionEntity,
    options: UpdateQuestionOptionDto[]
  ) {
    // Delete old options
    await queryRunner.manager.delete(
      QuestionOptionEntity, { question: { id: question.id } }
    );

    // Create new options
    const newOptions = options.map((optionData) => ({
      ...optionData,
      isCorrect: optionData.isCorrect ?? false,
      points: optionData.points ?? 0,
      text: optionData.text ?? '',
      question,
    }));

    // Save options
    await queryRunner.manager.save(newOptions);

    return newOptions;
  };


  private async updateSurveyTotalPoints(
    queryRunner: QueryRunner,
    surveyId: string,
    newPoints: number,
    oldPoints: number
  ) {
    // const survey = await queryRunner.manager.findOne(
    //   SurveyEntity, { where: { id: surveyId } }
    // );

    // if (!survey) {
    //   QuestionsService.logger.debug(`Cannot update field totalPoints in survey ${surveyId}. No such survey`);
    //   throw new NotFoundException(`Survey with ID ${surveyId} not found`);
    // };

    // const pointsDiff = newPoints - oldPoints;
    // const totalPoints = (survey.totalPoints ?? 0) + pointsDiff;
    // await queryRunner.manager.update(SurveyEntity, surveyId, { totalPoints });

    const pointsDiff = newPoints - oldPoints;

    const result = await queryRunner.manager.increment(
      SurveyEntity, { id: surveyId }, 'totalPoints', pointsDiff
    );

    if (result.affected === 0) {
      QuestionsService.logger.debug(`Cannot update totalPoints in survey ${surveyId}. No such survey`);
      throw new NotFoundException(`Survey with ID ${surveyId} not found`);
    }
  };


  private async reorderPositions(
    queryRunner: QueryRunner,
    surveyId: string,
    oldPosition: number,
    newPosition: number,
  ) {
    if (oldPosition === newPosition || newPosition < 1) return;

    const moveUp = newPosition < oldPosition;
    const operator = moveUp ? '+1' : '-1';
    const rangeCondition = moveUp
      ? 'position >= :newPosition AND position < :oldPosition'
      : 'position > :oldPosition AND position <= :newPosition';

    // Move all questions in move range
    await queryRunner.manager
      .createQueryBuilder()
      .update(QuestionEntity)
      .set({ position: () => `position ${operator}` })
      .where('surveyId = :surveyId', { surveyId })
      .andWhere(rangeCondition, { newPosition, oldPosition })
      .execute();

    // Update position of main question
    await queryRunner.manager.update(
      QuestionEntity,
      { survey: { id: surveyId }, position: oldPosition },
      { position: newPosition }
    );
  };


  async deleteById(id: string) {
    QuestionsService.logger.log(`Deleting question with id: ${id}`);
    const deleteResult = await this.questionRepository.delete({ id: id });

    if (deleteResult.affected === 0) {
      QuestionsService.logger.debug(`Cannot delete question. No question with id: ${id}`);
      throw new NotFoundException(`Question with id ${id} not found`);
    };

    return deleteResult;
  };
};
