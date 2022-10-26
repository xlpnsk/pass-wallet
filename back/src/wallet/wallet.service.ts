import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreatePasswordDto } from 'dtos/CreatePassword.dto';
import { PasswordListDto } from 'dtos/PasswordList.dto';
import { SinglePasswordDto } from 'dtos/SinglePassword.dto';
import { UpdatePasswordDto } from 'dtos/UpdatePassword.dto';
import { CryptoService } from 'src/crypto/crypto.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService, private cryptoService: CryptoService, private userService: UsersService){}


  async getAllPasswords(userId:number){
    const user = await this.userService.findOneById(userId);
    const walletRecords = await this.prisma.walletRecord.findMany({where: {userId: user.id}})
    return walletRecords
  }
  async getPasswordList(userId:number): Promise<PasswordListDto[]>{
    const user = await this.userService.findOneById(userId);
    const walletRecords: PasswordListDto[] = await this.prisma.walletRecord.findMany({select: {id: true, webAddress:true, login:true, description:true},where: {userId: user.id}})
    return walletRecords
  }

  async getPassword(recordId: string, masterPassword:string, userId: number): Promise<SinglePasswordDto>{
    const user = await this.userService.findOneById(userId);
    const isValid = this.cryptoService.validateMasterPassword(user,masterPassword)
    
    if(!isValid){
      throw new UnauthorizedException(); 
    }
    const id = parseInt(recordId)
    if(isNaN(id)){
      throw new BadRequestException()
    }
    const passwordRecord: SinglePasswordDto = await this.prisma.walletRecord.findFirst({select:{id:true, password:true},where: {id: id, userId: user.id}})
    const result = {...passwordRecord, password: this.cryptoService.decryptPassword(masterPassword,passwordRecord.password)}
    return result;
  }

  async createPasswordRecord(recordDto:CreatePasswordDto, userId: number){
    const user = await this.userService.findOneById(userId);
    const {masterPassword, ...data} = recordDto;
    const encryptedPassword = this.cryptoService.encryptPassword(masterPassword, data.password);
    const createData = {...data, password: encryptedPassword, userId: user.id} 
    const walletRecord = await this.prisma.walletRecord.create({data: createData});
    return walletRecord;
  }

  async updatePasswordRecord(recordDto:UpdatePasswordDto, userId:number){
    const user = await this.userService.findOneById(userId);
    let {masterPassword, id, ...data} = recordDto;
    Object.keys(data).forEach(key => data[key] === undefined && delete data[key])

    if(data.password){
      const encryptedPassword = this.cryptoService.encryptPassword(masterPassword, data.password);
      data = {...data, password: encryptedPassword}
    }
    
    const walletRecord = await this.prisma.walletRecord.updateMany({where: {id: id, userId: user.id}, data:data});

    return walletRecord;
  }

  async deletePasswordRecord(recordId:string, userId: number){
    const user = await this.userService.findOneById(userId);
    const id = parseInt(recordId)
    if(isNaN(id)){
      throw new BadRequestException()
    }
    const {count} = await this.prisma.walletRecord.deleteMany({where: {id: id, userId: user.id}})
    return count
  }

  async updateHashes(userId:number,newPassword:string){
    const records = await this.getAllPasswords(userId);
    
  }

}
