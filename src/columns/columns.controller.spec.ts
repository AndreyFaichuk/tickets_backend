import { Test, TestingModule } from '@nestjs/testing';
import { ColumnsController } from './columns.controller';

describe('ColumnsController', () => {
  let controller: ColumnsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ColumnsController],
    }).compile();

    controller = module.get<ColumnsController>(ColumnsController);
  });

  it('should be defined12343', () => {
    expect(controller).toBeDefined();
  });
});
