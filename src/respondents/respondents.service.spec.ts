import { Test, TestingModule } from '@nestjs/testing';
import { RespondentsService } from './respondents.service';

describe('RespondentsService', () => {
  let service: RespondentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RespondentsService],
    }).compile();

    service = module.get<RespondentsService>(RespondentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
