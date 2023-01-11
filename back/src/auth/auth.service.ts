import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from 'dtos/Register.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CryptoService } from 'src/crypto/crypto.service';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { IpRecordService } from 'src/ip-record/ip-record.service';
import { CreateIpRecordDto } from 'dtos/CreateIpRecord.dto';
import { UpdateIpRecordDto } from 'dtos/UpdateIpRecord.dto';
import { CreateLoginRecordDto } from 'dtos/CreateLoginRecord.dto';

export interface IValidationError {
  message: string;
}

export interface IUserData {
  id: number;
  login: string;
}

export function isError(
  userOrError: IUserData | IValidationError,
): userOrError is IValidationError {
  return (<IValidationError>userOrError).message !== undefined;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
    private cryptoService: CryptoService,
    private ipRecordService: IpRecordService,
  ) {}

  async validateUser(
    login: string,
    pass: string,
    ip: string,
  ): Promise<IUserData | IValidationError> {
    const user = await this.usersService.findOneWithLastLoginRecord(login);
    if (!user) {
      return { message: 'No user has been found' };
    }

    const loginRecord = user.logins.at(0);
    const databaseIpRecord = await this.ipRecordService.getIpRecordByIp(ip);
    const currentDate = new Date();
    if (!loginRecord && databaseIpRecord) {
      if (databaseIpRecord.isBlockedPermanently) {
        return { message: 'Your IP address has been blocked permanently' };
      }
      if (databaseIpRecord.blockedUntil > currentDate) {
        return {
          message:
            'Your IP address has been blocked temporarily. Please try again later.',
        };
      }
    }
    console.log(loginRecord);
    if (loginRecord && ip === loginRecord.ipAddress.ipAddress) {
      if (loginRecord.ipAddress.isBlockedPermanently) {
        return { message: 'Your IP address has been blocked permanently' };
      }
      if (loginRecord.ipAddress.blockedUntil > currentDate) {
        return {
          message:
            'Your IP address has been blocked temporarily. Please try again later.',
        };
      }
    }
    if (loginRecord && !loginRecord.wasLoginSuccessful) {
      let blockDate = new Date(loginRecord.loginTime);
      switch (loginRecord.attempt) {
        case 1: {
          blockDate.setSeconds(blockDate.getSeconds() + 5);
          break;
        }
        case 2: {
          blockDate.setSeconds(blockDate.getSeconds() + 10);
          break;
        }
        default: {
          blockDate.setMinutes(blockDate.getMinutes() + 2);
          break;
        }
      }

      if (blockDate > currentDate) {
        return {
          message:
            'Logging to this account has been temporarily blocked. Please try again later.',
        };
      }
    }

    const isValid = this.cryptoService.validateMasterPassword(user, pass);

    if (isValid) {
      const userData = { id: user.id, login: user.login };
      const loginRecordData: CreateLoginRecordDto = {
        loginTime: currentDate,
        wasLoginSuccessful: true,
        attempt: 0,
        userId: user.id,
      };
      if (!databaseIpRecord) {
        const ipRecordDto: CreateIpRecordDto = {
          ipAddress: ip,
          blockedUntil: null,
          isBlockedPermanently: false,
        };
        const t = await this.prisma.iPRecord.create({
          data: { ...ipRecordDto, logins: { create: loginRecordData } },
        });
        console.log(t);
      } else {
        const t2 = await this.prisma.loginRecord.create({
          data: { ...loginRecordData, ipId: databaseIpRecord.id },
        });
        console.log(t2);
      }
      console.log('hi', loginRecordData, databaseIpRecord);
      return userData;
    }

    let blockDate: Date | 'perm-block' | null = currentDate;
    const attempt = loginRecord?.attempt || 0;
    switch (attempt) {
      case 0: {
        blockDate = null;
        break;
      }
      case 1: {
        blockDate.setSeconds(blockDate.getSeconds() + 5);
        //add record update ip record with date (not perm)
        break;
      }
      case 2: {
        //add record and update ip record with date (not perm)
        blockDate.setSeconds(blockDate.getSeconds() + 10);
        break;
      }
      default: {
        //add record update ip record with date (perm)
        blockDate = 'perm-block';
        break;
      }
    }
    console.log(blockDate);
    const loginRecordData: CreateLoginRecordDto = {
      loginTime: currentDate,
      wasLoginSuccessful: false,
      attempt: attempt + 1,
      userId: user.id,
    };
    if (!databaseIpRecord) {
      const ipRecordDto: CreateIpRecordDto = {
        ipAddress: ip,
        blockedUntil: blockDate === 'perm-block' ? new Date() : blockDate,
        isBlockedPermanently: blockDate === 'perm-block',
      };
      const w = await this.prisma.iPRecord.create({
        data: { ...ipRecordDto, logins: { create: loginRecordData } },
      });
      console.log(w);
    } else {
      const ipRecordDto: UpdateIpRecordDto = {
        blockedUntil: blockDate === 'perm-block' ? new Date() : blockDate,
        isBlockedPermanently: blockDate === 'perm-block',
      };
      const w = await this.prisma.iPRecord.update({
        where: { id: databaseIpRecord.id },
        data: { ...ipRecordDto, logins: { create: loginRecordData } },
      });
      console.log(w);
    }

    return { message: 'Invalid login data. Please try again later.' };
  }

  async login(user: User) {
    const payload = { login: user.login, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(registerData: RegisterDto) {
    let hash;
    const salt = await bcrypt.genSalt();
    if (registerData.isPasswordKeptAsHash) {
      hash = this.cryptoService
        .calculateSHA512(salt + registerData.password + process.env.PEPPER)
        .toString();
    } else {
      hash = this.cryptoService.calculateHMAC(registerData.password).toString();
    }

    const createData = {
      login: registerData.login,
      passwordHash: hash,
      salt: registerData.isPasswordKeptAsHash ? salt : null,
      isPasswordKeptAsHash: registerData.isPasswordKeptAsHash,
    };
    const user = await this.prisma.user.create({ data: createData });

    if (user) {
      return this.login(user);
    }
  }

  async decodeToken(token: string) {
    const tokenObj = this.jwtService.decode(token);
    return tokenObj;
  }

  async changeMasterPassword(
    userId: number,
    newPassword: string,
    masterPassword: string,
  ) {
    const user = await this.usersService.findOneById(userId);
    if (!user) {
      throw new BadRequestException();
    }
    const isValid = this.cryptoService.validateMasterPassword(
      user,
      masterPassword,
    );

    if (!isValid) {
      throw new UnauthorizedException();
    }
    const newSalt = await bcrypt.genSalt();
    const newPasswordEncrypted = user.isPasswordKeptAsHash
      ? this.cryptoService.calculateSHA512(
          newSalt + newPassword + process.env.PEPPER,
        )
      : this.cryptoService.calculateHMAC(newPassword);

    const userNewData = {
      login: user.login,
      passwordHash: newPasswordEncrypted.toString(),
      salt: user.isPasswordKeptAsHash ? newSalt : null,
      isPasswordKeptAsHash: user.isPasswordKeptAsHash,
    };

    const oldPasswords = await this.prisma.walletRecord.findMany({
      select: { id: true, password: true },
      where: { userId: userId },
    });

    const newPasswords = oldPasswords.map((passwd) => {
      const decrypt = this.cryptoService.decryptPassword(
        masterPassword,
        passwd.password,
      );
      const encrypt = this.cryptoService.encryptPassword(newPassword, decrypt);
      return { id: passwd.id, password: encrypt };
    });

    const queries = newPasswords.map((passwd) =>
      this.prisma.walletRecord.updateMany({
        data: { password: passwd.password },
        where: { userId: userId, id: passwd.id },
      }),
    );

    const userUpdate = this.prisma.user.update({
      where: { id: userId },
      data: userNewData,
    });
    const [updatedUser, ...updatedPasswords] = await this.prisma.$transaction([
      userUpdate,
      ...queries,
    ]);
    return updatedUser;
  }
}
