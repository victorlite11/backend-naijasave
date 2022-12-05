import { Test, TestingModule } from '@nestjs/testing';
import { PaymentTicksController } from './payment-ticks.controller';

describe('PaymentTicksController', () => {
  let controller: PaymentTicksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentTicksController],
    }).compile();

    controller = module.get<PaymentTicksController>(PaymentTicksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
