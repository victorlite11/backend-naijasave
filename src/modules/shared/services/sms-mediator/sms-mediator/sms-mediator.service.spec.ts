import { Test, TestingModule } from '@nestjs/testing';
import { SmsMediatorService } from './sms-mediator.service';

describe('SmsMediatorService', () => {
  let service: SmsMediatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SmsMediatorService],
    }).compile();

    service = module.get<SmsMediatorService>(SmsMediatorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
