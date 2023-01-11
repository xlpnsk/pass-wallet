import { Injectable } from '@nestjs/common';
import { CreateLoginRecordDto } from 'dtos/CreateLoginRecord.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LoginRecordService {
  constructor(private prisma: PrismaService) {}

  async createLoginRecord(loginRecordDto: CreateLoginRecordDto) {
    this.prisma.loginRecord.create({ data: loginRecordDto });
  }

  async getLastSuccessfulLoginRecord(userId: number) {
    const lastSuccessful = this.prisma.loginRecord.findMany({
      where: { userId: userId, wasLoginSuccessful: true },
      orderBy: { loginTime: 'desc' },
      take: 1,
    });
    return lastSuccessful;
  }
  async getLastUnsuccessfulLoginRecord(userId: number) {
    const lastUnsuccessful = this.prisma.loginRecord.findMany({
      where: { userId: userId, wasLoginSuccessful: false },
      orderBy: { loginTime: 'desc' },
      take: 1,
    });
    return lastUnsuccessful;
  }
}
