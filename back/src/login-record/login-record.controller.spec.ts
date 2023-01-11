import { Test, TestingModule } from '@nestjs/testing';
import { LoginRecordController } from './login-record.controller';

describe('LoginRecordController', () => {
  let controller: LoginRecordController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoginRecordController],
    }).compile();

    controller = module.get<LoginRecordController>(LoginRecordController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
