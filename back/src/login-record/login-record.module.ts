import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { LoginRecordService } from './login-record.service';
import { LoginRecordController } from './login-record.controller';

@Module({
  imports: [PrismaModule],
  providers: [LoginRecordService],
  exports: [LoginRecordService],
  controllers: [LoginRecordController],
})
export class LoginRecordModule {}
