import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { IPRecord, LoginRecord, User } from '@prisma/client';
import { CryptoService } from 'src/crypto/crypto.service';
import { IpRecordService } from 'src/ip-record/ip-record.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';

type TestLoginRecord = (LoginRecord & {
  ipAddress: IPRecord;
})

const testIpRecord:IPRecord = {
  id: 32,
  ipAddress: '192.168.0.124',
  blockedUntil: null,
  isBlockedPermanently: false
}

const testIpRecord2:IPRecord = {
  id: 33,
  ipAddress: '192.168.0.128',
  blockedUntil: null,
  isBlockedPermanently: true
}

const testIpRecord3:IPRecord = {
  id: 34,
  ipAddress: '192.168.0.130',
  blockedUntil: null,
  isBlockedPermanently: true
}

const testLoginRecord1: TestLoginRecord = {
  id: 23,
  loginTime: new Date(2021, 12, 12, 3, 24, 0),
  wasLoginSuccessful: false,
  attempt: 1,
  ipId: 32,
  userId: 1,
  ipAddress: testIpRecord
}

const testLoginRecord2: TestLoginRecord = {
  id: 25,
  loginTime: new Date(2022, 12, 12, 3, 24, 0),
  wasLoginSuccessful: false,
  attempt: 1,
  ipId: 33,
  userId: 2,
  ipAddress: testIpRecord2
}

const testLoginRecord3: TestLoginRecord = {
  id: 24,
  loginTime: new Date(),
  wasLoginSuccessful: false,
  attempt: 3,
  ipId: 34,
  userId: 3,
  ipAddress: testIpRecord3
}

type TestUser = User & {
  logins: TestLoginRecord[]
}

const testUser1: TestUser = {
  id: 1,
  login: 'test',
  passwordHash: 'hash',
  salt: null,
  isPasswordKeptAsHash: true,
  logins: [testLoginRecord1]
}

const testUser2: TestUser = {
  id: 2,
  login: 'test2',
  passwordHash: 'hash',
  salt: null,
  isPasswordKeptAsHash: true,
  logins: [testLoginRecord2]
}

const testUser3: TestUser = {
  id: 3,
  login: 'test3',
  passwordHash: 'hash',
  salt: null,
  isPasswordKeptAsHash: true,
  logins: [testLoginRecord3]
}

const testUsers = [testUser1, testUser2, testUser3]
const testIpRecords = [testIpRecord, testIpRecord2, testIpRecord3];
const testLoginRecords = [testLoginRecord1, testLoginRecord2,testLoginRecord3]

describe('AuthService', () => {
  let service: AuthService;
  let mockUserService = {
    findOneWithLastLoginRecord: (login: string) => Promise.resolve(testUsers.find(u => u.login===login)) 
  }
  let mockPrismaService = {
    iPRecord:{
      create: (args) => console.log('Creating IP Record with data: ', args),
      update: (args) => console.log('Updating IP Record with data: ',args)
    },
    loginRecord:{
      create: (args) => console.log('Creating Login Record with data: ', args)
    }
  }
  let mockCryptoService = {
    validateMasterPassword: (user:User,password:string) => true
  }
  let mockJWTService = {}
  let mockIpRecordService = {
    getIpRecordByIp: (ip: string) => Promise.resolve(testIpRecords.find(rec => rec.ipAddress === ip))
  }
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: CryptoService,
          useValue: mockCryptoService
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService
        },
        {
          provide: UsersService,
          useValue: mockUserService
        },
        {
          provide: JwtService,
          useValue: mockJWTService
        },
        {
          provide: IpRecordService,
          useValue: mockIpRecordService
        }
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should log in user', async () =>{
    const {login, id} = testUser1;
    const expectedValue = {login, id}
    const validationResult = await service.validateUser('test','test','192.168.0.124');
    expect(validationResult).toStrictEqual(expectedValue);
  });

  it('should not log in user (permanent IP block)', async () =>{
    const expectedValue = { message: "Your IP address has been blocked permanently"}
    const validationResult = await service.validateUser('test2','test','192.168.0.128');
    expect(validationResult).toStrictEqual(expectedValue);
  });

  it('should not log in user (login temporarily blocked)', async () =>{
    const expectedValue = { message: "Logging to this account has been temporarily blocked. Please try again later."}
    const validationResult = await service.validateUser('test3','test','192.168.0.124');
    expect(validationResult).toStrictEqual(expectedValue);
  });
});
