import { Injectable } from '@nestjs/common';
import { CreateLoginRecordDto } from 'dtos/CreateLoginRecord.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LoginRecordService {
  constructor(private prisma: PrismaService) {}

  async createLoginRecord(loginRecordDto: CreateLoginRecordDto){
    this.prisma.loginRecord.create({ data: loginRecordDto });
  }
}
