import { Controller, Get, Post, UseGuards, Request, Body, Put } from '@nestjs/common';
import { AppService } from './app.service';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { JwtUserDto } from 'dtos/JwtUser.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private authService: AuthService) {}

  @Get('/')
  async helloCheck(){
    return this.appService.getHello()
  }

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Request() req){
    return this.authService.login(req.user);
  }

  @Post('auth/register')
  async register(@Body() body){
    return this.authService.register(body)
  }

  @UseGuards(JwtAuthGuard)
  @Put('auth/password')
  async updatePassword(@Body() body, @Request() req){
    const userId = (req.user as JwtUserDto).id
    return this.authService.changeMasterPassword(userId, body.newPassword, body.oldPassword)
  }
}
