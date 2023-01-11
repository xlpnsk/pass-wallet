import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtUserDto } from 'dtos/JwtUser.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { LoginRecordService } from './login-record.service';

@Controller('login-record')
export class LoginRecordController {
  constructor(private readonly loginRecordService: LoginRecordService) {}

  @UseGuards(JwtAuthGuard)
  @Get('successful')
  getLastSuccessfulLoginRecords(@Request() req) {
    const user = req.user as JwtUserDto;
    const successfulLoginRecord =
      this.loginRecordService.getLastSuccessfulLoginRecord(user.id);
    return successfulLoginRecord;
  }
  @UseGuards(JwtAuthGuard)
  @Get('unsuccessful')
  getLastUnsuccessfulLoginRecords(@Request() req) {
    const user = req.user as JwtUserDto;
    const unsuccessfulLoginRecord =
      this.loginRecordService.getLastUnsuccessfulLoginRecord(user.id);
    return unsuccessfulLoginRecord;
  }
}
