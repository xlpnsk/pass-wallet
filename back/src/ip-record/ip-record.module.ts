import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { IpRecordService } from './ip-record.service';
import { IpRecordController } from './ip-record.controller';

@Module({
  imports: [PrismaModule],
  providers: [IpRecordService],
  exports: [IpRecordService],
  controllers: [IpRecordController],
})
export class IpRecordModule {}
