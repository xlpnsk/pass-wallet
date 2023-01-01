import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginRecordService } from './login-record.service';

describe('LoginRecordService', () => {
  let service: LoginRecordService;
  const mockPrismaService = {}
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoginRecordService, { provide: PrismaService, useValue: mockPrismaService}],
    }).compile();

    service = module.get<LoginRecordService>(LoginRecordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
