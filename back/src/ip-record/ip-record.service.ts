import { Injectable } from '@nestjs/common';
import { CreateIpRecordDto } from 'dtos/CreateIpRecord.dto';
import { UpdateIpRecordDto } from 'dtos/UpdateIpRecord.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class IpRecordService {
  constructor(private prisma: PrismaService) {}

  async getIpRecordByIp(ip:string){
    return this.prisma.iPRecord.findUnique({where: { ipAddress: ip}})
  }

  async createIpRecord(ipRecordDto: CreateIpRecordDto){
    return this.prisma.iPRecord.create({ data: ipRecordDto });
  }

  async updateIpRecord(id: number, ipRecordDto: UpdateIpRecordDto){
    return this.prisma.iPRecord.update({where: { id: id }, data: ipRecordDto})
  }
}
