import { Test, TestingModule } from '@nestjs/testing';
import { CreatePasswordDto } from 'dtos/CreatePassword.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { User, UsersService } from 'src/users/users.service';
import { CryptoService } from '../crypto/crypto.service';
import { WalletService } from './wallet.service';

const CONSTANTS = {
  masterPassword: "jdsf%34dGeQ2",
  masterPasswordHash: "00a846b9f10491d94e4908e790999fe563def9dfbcba21bb8c07895dfb00002d",
  password: '2234RSCwsd=-',
  encryptedPassword: 'ohwou04cPUvy4G9mvIaDPw=='
}

const createDto:CreatePasswordDto = {
  masterPassword: CONSTANTS.masterPassword,
  password: CONSTANTS.password,
  webAddress: 'test.jest.io',
  description: '',
  login: 'user'
}

describe('WalletService', () => {
  let service: WalletService;
  let mockUserService = {
    findOneById(userId:number){
      const user: User = {
        id: 0,
        login: 'user',
        passwordHash: 'TX9Ywum6uMV9xKxHSBN/iw==',
        salt: '',
        isPasswordKeptAsHash: true
      }
      return user;
    }
  }
  let mockPrismaService = {
    walletRecord: {
      create(args: {data: any}){
        return args.data;
      }
    }
  }
  let mockCryptoService = {}
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService, 
        CryptoService,
        {
          provide: PrismaService,
          useValue: mockPrismaService
        },
        {
          provide: UsersService,
          useValue: mockUserService
        }
      ],
    }).compile();

    Object.assign(process.env, {HMAC_PASSPHRASE: 'mystified cartridge dollar enigmatic', CRYPTO_IV: "101112131415161718191a1b1c1d1e1f"})
    service = module.get<WalletService>(WalletService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create correct record of password', async () => {
    const result = await service.createPasswordRecord(createDto, 0);
    const {masterPassword, ...data} = createDto;
    const expected = {...data, password: CONSTANTS.encryptedPassword, userId: 0}
    expect(result).toStrictEqual(expected);
  })
});
