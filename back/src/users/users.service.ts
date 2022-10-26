import { Injectable } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma/prisma.service';

// This should be a real class/interface representing a user entity
export interface User {
  id:number
  login:string
  passwordHash:string
  salt:string
  isPasswordKeptAsHash:boolean
}

@Injectable()
export class UsersService {
  constructor (private prisma: PrismaService){}

  async findOne(login: string): Promise<User | undefined> {
    return await this.prisma.user.findUnique({where:{login:login}});
  }

  async findOneById(id: number): Promise<User | undefined> {
    return await this.prisma.user.findUnique({where:{id:id}});
  }
}