import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { IpRecordService } from './ip-record.service';

describe('IpRecordService', () => {
  let service: IpRecordService;
  const mockPrismaService = {}
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IpRecordService, { provide: PrismaService, useValue: mockPrismaService}],
    }).compile();

    service = module.get<IpRecordService>(IpRecordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
