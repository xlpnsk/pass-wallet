import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateIpRecordDto } from 'dtos/CreateIpRecord.dto';
import { UpdateIpRecordDto } from 'dtos/UpdateIpRecord.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class IpRecordService {
  constructor(private prisma: PrismaService) {}

  async getIpRecordByIp(ip: string) {
    return this.prisma.iPRecord.findUnique({ where: { ipAddress: ip } });
  }

  async createIpRecord(ipRecordDto: CreateIpRecordDto) {
    return this.prisma.iPRecord.create({ data: ipRecordDto });
  }

  async updateIpRecord(id: number, ipRecordDto: UpdateIpRecordDto) {
    return this.prisma.iPRecord.update({
      where: { id: id },
      data: ipRecordDto,
    });
  }

  async getBlockedIpAddresses(userId: number) {
    const records = await this.prisma.loginRecord.findMany({
      include: { ipAddress: true },
      where: {
        ipAddress: {
          isBlockedPermanently: true,
        },
        userId: userId,
      },
    });
    return records.map((record) => record.ipAddress);
  }

  async unblockUserIpAddress(recordId: string, userId: number) {
    const id = parseInt(recordId);
    if (isNaN(id)) {
      throw new BadRequestException();
    }
    const loginRecord = await this.prisma.loginRecord.findFirst({
      where: {
        ipId: id,
        userId: userId,
        ipAddress: { isBlockedPermanently: true },
      },
    });
    console.log(loginRecord);
    if (!loginRecord) {
      throw new NotFoundException();
    }
    return await this.prisma.iPRecord.update({
      where: {
        id: id,
      },
      data: {
        isBlockedPermanently: false,
      },
    });
  }
}
