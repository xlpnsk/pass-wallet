import { Body, Controller, Get, Param, Post, Put, UseGuards, Request, Delete } from '@nestjs/common';
import { CreatePasswordDto } from 'dtos/CreatePassword.dto';
import { JwtUserDto } from 'dtos/JwtUser.dto';
import { UpdatePasswordDto } from 'dtos/UpdatePassword.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { WalletService } from './wallet.service';

@Controller('wallet')
export class WalletController {

    constructor(private walletService: WalletService){}

    @UseGuards(JwtAuthGuard)
    @Get()
    getPasswordList(@Request() req): any{
        const user = req.user as JwtUserDto
        const passwordList = this.walletService.getPasswordList(user.id);
        return passwordList;
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id')
    getPassword(@Param('id') id:string, @Body() masterPasswordDto: {password: string}, @Request() req):any{
        const userId = (req.user as JwtUserDto).id
        const password = this.walletService.getPassword(id, masterPasswordDto.password,userId)
        return password
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    create(@Body() passwordBody: CreatePasswordDto, @Request() req):any{
        const userId = req.user.id
        const record = this.walletService.createPasswordRecord(passwordBody,userId);
        return record
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    delete(@Param('id') id:string, @Request() req):any{
        const userId = req.user.id
        const deleteCount = this.walletService.deletePasswordRecord(id,userId);
        return deleteCount
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id')
    update(@Param('id') id:string, @Request() req):any{
        const userId = req.user.id
        const body: UpdatePasswordDto = req.body;
        const record = this.walletService.updatePasswordRecord(body,userId);
        return record
    }
}
