import { Test, TestingModule } from '@nestjs/testing';
import { RespondentsController } from './respondents.controller';

describe('RespondentsController', () => {
  let controller: RespondentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RespondentsController],
    }).compile();

    controller = module.get<RespondentsController>(RespondentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
