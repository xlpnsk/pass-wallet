import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from 'dtos/Register.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CryptoService } from 'src/crypto/crypto.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService, 
    private jwtService: JwtService,
    private prisma: PrismaService,
    private cryptoService: CryptoService
  ) {}

  async validateUser(login: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(login);
    if (!user){
      return null
    }
    const isValid = this.cryptoService.validateMasterPassword(user,pass)

    if(isValid){
      const userData = {id: user.id,login: user.login}
      return userData
    }

    return null;
  }

  async login(user: any) {
    const payload = { login: user.login, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(registerData:RegisterDto){
    let hash;
    const salt = await bcrypt.genSalt();
    if(registerData.isPasswordKeptAsHash){
      hash=this.cryptoService.calculateSHA512(salt+registerData.password+process.env.PEPPER).toString()
    }
    else{
      hash=this.cryptoService.calculateHMAC(registerData.password).toString()
    }

    const createData = {
      login: registerData.login,
      passwordHash: hash,
      salt: registerData.isPasswordKeptAsHash ? salt : null,
      isPasswordKeptAsHash: registerData.isPasswordKeptAsHash
    }
    const user = await this.prisma.user.create({data: createData})

    if(user){
      return this.login(user)
    }
  }

  async decodeToken(token: string){
    const tokenObj = this.jwtService.decode(token)
    return tokenObj
  }

  async changeMasterPassword(userId: number, newPassword: string, masterPassword: string){

    const user = await this.usersService.findOneById(userId);
    if (!user){
      throw new BadRequestException();
    }
    const isValid = this.cryptoService.validateMasterPassword(user,masterPassword)

    if(!isValid){
      throw new UnauthorizedException();
    }
    const newSalt = await bcrypt.genSalt();
    const newPasswordEncrypted = user.isPasswordKeptAsHash ? 
      this.cryptoService.calculateSHA512(newSalt + newPassword + process.env.PEPPER) :
      this.cryptoService.calculateHMAC(newPassword)
    
    const userNewData = {
      login: user.login,
      passwordHash: newPasswordEncrypted.toString(),
      salt: user.isPasswordKeptAsHash ? newSalt : null,
      isPasswordKeptAsHash: user.isPasswordKeptAsHash
    }

    const oldPasswords = await this.prisma.walletRecord.findMany({select: {id: true, password: true}, where: {userId: userId}})
    
    const newPasswords = oldPasswords.map((passwd) => {
      const decrypt = this.cryptoService.decryptPassword(masterPassword, passwd.password)
      const encrypt = this.cryptoService.encryptPassword(newPassword, decrypt)
      return {id: passwd.id, password: encrypt}
    })

    const queries = newPasswords.map((passwd) => this.prisma.walletRecord.updateMany({data: {password: passwd.password}, where: {userId: userId, id: passwd.id}}))

    const userUpdate = this.prisma.user.update({where: {id: userId}, data: userNewData})
    const [updatedUser, ...updatedPasswords] =await this.prisma.$transaction([
      userUpdate, ...queries
    ])
    return updatedUser;
  }
}