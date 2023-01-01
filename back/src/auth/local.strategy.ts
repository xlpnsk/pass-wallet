import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService, isError, IUserData } from './auth.service';
import { Request } from 'express';
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'login',
      passwordField: 'password',
      passReqToCallback: true
    });
  }

  async validate(req: Request, login: string, password: string): Promise<IUserData> {
    const userOrError = await this.authService.validateUser(login, password, req.ip);
    if (isError(userOrError)) {
      throw new UnauthorizedException(userOrError.message);
    }
    return userOrError;
  }
}