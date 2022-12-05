import { Test, TestingModule } from '@nestjs/testing';
import { EntitiesMediatorService } from './entities-mediator.service';

describe('EntitiesMediatorService', () => {
  let service: EntitiesMediatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EntitiesMediatorService],
    }).compile();

    service = module.get<EntitiesMediatorService>(EntitiesMediatorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
