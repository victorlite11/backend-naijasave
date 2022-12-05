import { Test, TestingModule } from '@nestjs/testing';
import { PaymentMediatorService } from './payment-mediator.service';

describe('PaymentMediatorService', () => {
  let service: PaymentMediatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaymentMediatorService],
    }).compile();

    service = module.get<PaymentMediatorService>(PaymentMediatorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
