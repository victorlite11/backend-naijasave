import { Test, TestingModule } from '@nestjs/testing';
import { SubordinatesService } from './subordinates.service';

describe('SubordinatesService', () => {
  let service: SubordinatesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubordinatesService],
    }).compile();

    service = module.get<SubordinatesService>(SubordinatesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
