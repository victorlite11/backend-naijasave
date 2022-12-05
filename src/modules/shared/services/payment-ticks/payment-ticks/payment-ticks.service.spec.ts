import { Test, TestingModule } from '@nestjs/testing';
import { PaymentTicksService } from './payment-ticks.service';

describe('PaymentTicksService', () => {
  let service: PaymentTicksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaymentTicksService],
    }).compile();

    service = module.get<PaymentTicksService>(PaymentTicksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
