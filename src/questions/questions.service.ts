import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DataSource, DeleteResult, In, QueryRunner, Repository } from 'typeorm';
import { QuestionEntity } from './entities/question.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateQuestionDto } from './dto/create-question.dto';
import { SurveyEntity } from '../surveys/entities/survey.entity';
import { QuestionOptionEntity } from './entities/question-option.entity';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { QuestionType } from './enums/question.enum';
import { UpdateQuestionOptionDto } from './dto/update-question-option.dto';

@Injectable()
export class QuestionsService {
  private static readonly logger = new Logger(QuestionsService.name);
  
  constructor(
    @InjectRepository(QuestionEntity)
    private questionRepository: Repository<QuestionEntity>,

    private readonly dataSource: DataSource
  ) {}

  
  /**
   * Question create transaction
   * @param {string} surveyId Survey uuid
   * @param {CreateQuestionDto} data Question mandatory data
   * @returns {Promise<QuestionEntity>} Created question
   */
  async createQuestionTransaction(surveyId: string, data: CreateQuestionDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    QuestionsService.logger.debug('Started Question create transaction');

    try {
      const survey = await queryRunner.manager.findOne(
        SurveyEntity,
        { where: { id: surveyId } }
      );
  
      if (!survey) {
        QuestionsService.logger.debug(`Cannot create question for survey ${surveyId}. No such survey`);
        throw new NotFoundException(`Survey not found`);
      };

      const position = await this.checkQuestionPosition(
        queryRunner,
        surveyId,
        data.position
      )
  
      const question = await queryRunner.manager.save(
        QuestionEntity,
        { survey: { id: survey.id }, ...data, position }
      );
      
      await this.moveDownPositions(
        queryRunner, survey.id, question.position
      )
  
      if (data.type != QuestionType.TEXT) {
        let questionOption = await queryRunner.manager.save(
          QuestionOptionEntity,
          {
          question: { id: question.id },
          position: 1,
          text: 'Опция 1'
          }
        );
  
        question.questionOptions = [questionOption];
      };
  
      await queryRunner.commitTransaction();
      QuestionsService.logger.debug('Question create transaction has been successfully ended');

      return question;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      QuestionsService.logger.debug('Question create transaction has failed and was rolled back');
      QuestionsService.logger.error(`Question create transaction failed: ${error.message}`, error);
      throw error;
    } finally {
      await queryRunner.release();
    };
  };


  /**
   * Complex update transaction for question with other questions position rearrangement if required,
   * options replacing and survey points recalculation
   * @param {string} id Question uuid
   * @param {UpdateQuestionDto} data New question data
   * @returns {Promise<QuestionEntity | null>} Updated question
   */
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
        if (data.questionOptions) {
          QuestionsService.logger.debug('Cannot update TEXT question. Incorrect data input');
          throw new BadRequestException('TEXT Question cannot have options');
        };
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

      // Update question position and move other questions
      if (data.position !== undefined) {
        const newPosition = await this.checkQuestionPosition(
          queryRunner, question.survey.id, data.position
        )
        await this.reorderPositions(
          queryRunner, oldSurveyId, oldPosition, newPosition
        );
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


  /**
   * Update question data in DB
   * @param {QueryRunner} queryRunner QuerryRunner for Typeorm transaction
   * @param {QuestionEntity} question Question entity
   * @param {UpdateQuestionDto} data New question data
   */
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
  };


  /**
   * Update question options in DB. All old options in DB will be deleted
   * @param {QueryRunner} queryRunner QuerryRunner for Typeorm transaction
   * @param {QuestionEntity} question Question entity
   * @param {UpdateQuestionOptionDto[]} options All question options include both new and old
   */
  private async updateQuestionOptions(
    queryRunner: QueryRunner,
    question: QuestionEntity,
    options: UpdateQuestionOptionDto[]
  ) {
    // Maybe need to add automatic rearrangement
    const positions = options.map(optionData => optionData.position);
    const hasDuplicatePositions = new Set(positions).size !== positions.length;
    if (hasDuplicatePositions) {
      QuestionsService.logger.debug('Cannot create question options. Dublicated positions');
      throw new BadRequestException('Question options cannot have duplicate positions');
    }

    if (question.type === QuestionType.RADIO) {
      const correctOptionsCount = options.filter(option => option.isCorrect).length;
      
      if (correctOptionsCount > 1) {
        QuestionsService.logger.debug(`Cannot update options in question ${question.id}. Radio can't have more than one correct answer`);
        throw new BadRequestException('There can be only one correct option for a radio question');
      }
    }

    // Delete old options
    await queryRunner.manager.delete(
      QuestionOptionEntity, { question: { id: question.id } }
    );

    // Create new options
    const newOptions = options.map((optionData) => {
      const newOption = new QuestionOptionEntity();
      newOption.position = optionData.position;
      newOption.isCorrect = optionData.isCorrect ?? false;
      newOption.points = optionData.points ?? 0;
      newOption.text = optionData.text ?? '';
      newOption.question = question;
      return newOption;
    });

    // Save options
    await queryRunner.manager.save(newOptions);

    return newOptions;
  };


  /**
   * Update survey total points
   * @param {QueryRunner} queryRunner QuerryRunner for Typeorm transaction
   * @param {string} surveyId Survey uuid
   * @param {number} newPoints New calculated points
   * @param {number} oldPoints old survey points
   */
  private async updateSurveyTotalPoints(
    queryRunner: QueryRunner,
    surveyId: string,
    newPoints: number,
    oldPoints: number
  ) {
    const pointsDiff = newPoints - oldPoints;

    const result = await queryRunner.manager.increment(
      SurveyEntity, { id: surveyId }, 'totalPoints', pointsDiff
    );

    if (result.affected === 0) {
      QuestionsService.logger.debug(`Cannot update totalPoints in survey ${surveyId}. No such survey`);
      throw new NotFoundException(`Survey with ID ${surveyId} not found`);
    }
  };


  /**
   * Move questions higher or lower of given new position
   * until old position. Needs to prevent gaps between questions
   * and also to free new position
   * @param {QueryRunner} queryRunner QuerryRunner for Typeorm transaction
   * @param {string} surveyId Survey uuid
   * @param {number} oldPosition Old question position in survey
   * @param {number} newPosition New question position in survey
   */
  private async reorderPositions(
    queryRunner: QueryRunner,
    surveyId: string,
    oldPosition: number,
    newPosition: number,
  ) {
    if (oldPosition === newPosition) return;

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


  /**
   * Delete question in DB by id
   * @param {string} id Question uuid
   * @returns {DeleteResult}
   */
  async deleteById(id: string) {
    QuestionsService.logger.log(`Deleting question with id: ${id}`);
    const deleteResult = await this.questionRepository.delete({ id: id });

    if (deleteResult.affected === 0) {
      QuestionsService.logger.debug(`Cannot delete question. No question with id: ${id}`);
      throw new NotFoundException(`Question with id ${id} not found`);
    };

    return deleteResult;
  };


  /**
   * Move all survey questions under given position
   * @param {QueryRunner} queryRunner QuerryRunner for Typeorm transaction
   * @param {string} surveyId Survey uuid
   * @param {number} position position which needs to be freed
   */
  private async moveDownPositions(
    queryRunner: QueryRunner,
    surveyId: string,
    position: number,
  ) {
    const newPosition = position + 1
    // Move down all questions
    await queryRunner.manager
      .createQueryBuilder()
      .update(QuestionEntity)
      .set({ position: () => 'position + 1' })
      .where('surveyId = :surveyId', { surveyId })
      .andWhere('position >= :newPosition', { newPosition })
      .execute();
  };


  /**
   * Find highest question position in survey and if given position
   * is too high, then return highest position in DB + 1, otherwise
   * returns given position
   * @param {QueryRunner} queryRunner QuerryRunner for Typeorm transaction
   * @param {string} surveyId Survey uuid
   * @param {number} newPosition Position to check
   * @returns {Promise<number>} Given position or highest position in DB + 1
   */
  private async checkQuestionPosition(
    queryRunner: QueryRunner,
    surveyId: string,
    newPosition: number
  ) {
    if (newPosition < 1) {
      QuestionsService.logger.debug('Cannot create question. Negative position');
      throw new BadRequestException('Question position cant be negative');
    }

    const maxPosition = await queryRunner.manager
    .createQueryBuilder(QuestionEntity, 'question')
    .select('MAX(question.position)', 'maxPosition')
    .where('question.surveyId = :surveyId', { surveyId })
    .getRawOne();

    const position = newPosition > maxPosition.maxPosition
      ? maxPosition.maxPosition + 1 : newPosition;
    return position
  };


  /**
   * Finding all questions that is belongs to the survey by theirs ids
   * @param {string} surveyId Survey uuid
   * @param {string[]} questionIds Questions uuid array
   * @returns {Promise<QuestionEntity[]>} Finded questions
   */
  async findSurveyQuestionsByIds(surveyId: string, questionIds: string[]) {
    const questions = await this.questionRepository.find({
      where: {
        id: In(questionIds),
        survey: { id: surveyId }
      },
      relations: ['questionOptions'] // Загружаем опции вопросов
    });

    return questions;
  };
};
