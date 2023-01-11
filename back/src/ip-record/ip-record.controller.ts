import {
  Controller,
  Get,
  UseGuards,
  Request,
  Put,
  Param,
} from '@nestjs/common';
import { JwtUserDto } from 'dtos/JwtUser.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { IpRecordService } from './ip-record.service';

@Controller('ip-record')
export class IpRecordController {
  constructor(private ipRecordService: IpRecordService) {}

  @UseGuards(JwtAuthGuard)
  @Get('blocked')
  getBlocked(@Request() req) {
    const user = req.user as JwtUserDto;
    const ipAddresses = this.ipRecordService.getBlockedIpAddresses(user.id);
    return ipAddresses;
  }

  @UseGuards(JwtAuthGuard)
  @Put('unblock/:id')
  unblockIpAddress(@Param('id') id: string, @Request() req) {
    const user = req.user as JwtUserDto;
    return this.ipRecordService.unblockUserIpAddress(id, user.id);
  }
}
