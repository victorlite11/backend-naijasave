import { Test, TestingModule } from '@nestjs/testing';
import { SubordinatesController } from './subordinates.controller';

describe('SubordinatesController', () => {
  let controller: SubordinatesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubordinatesController],
    }).compile();

    controller = module.get<SubordinatesController>(SubordinatesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
