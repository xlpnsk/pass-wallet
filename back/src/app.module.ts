import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WalletController } from './wallet/wallet.controller';
import { WalletService } from './wallet/wallet.service';
import { WalletModule } from './wallet/wallet.module';
import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CryptoService } from './crypto/crypto.service';
import { CryptoModule } from './crypto/crypto.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersService } from './users/users.service';
import { LoginRecordService } from './login-record/login-record.service';
import { IpRecordService } from './ip-record/ip-record.service';

@Module({
  imports: [WalletModule, AuthModule, UsersModule, CryptoModule, PrismaModule],
  controllers: [AppController, WalletController],
  providers: [AppService, WalletService, PrismaService, CryptoService, UsersService, LoginRecordService, IpRecordService],
})
export class AppModule {}
