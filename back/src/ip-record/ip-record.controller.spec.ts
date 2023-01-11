import { Test, TestingModule } from '@nestjs/testing';
import { IpRecordController } from './ip-record.controller';

describe('IpRecordController', () => {
  let controller: IpRecordController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IpRecordController],
    }).compile();

    controller = module.get<IpRecordController>(IpRecordController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
