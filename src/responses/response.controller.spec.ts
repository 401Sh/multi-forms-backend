import { Test, TestingModule } from '@nestjs/testing';
import { ResponsesController } from './response.controller';

describe('RespondentsController', () => {
  let controller: ResponsesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResponsesController],
    }).compile();

    controller = module.get<ResponsesController>(ResponsesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
