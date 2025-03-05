import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  private static readonly logger = new Logger(RefreshTokenStrategy.name);

  constructor() {
    const jwtSecret = process.env.JWT_ACCESS_SECRET;
    if (!jwtSecret) {
      RefreshTokenStrategy.logger.error('JWT_ACCESS_SECRET is not defined. Application cannot start.');
      throw new Error('JWT_ACCESS_SECRET is not defined');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtSecret,
      passReqToCallback: true,
    });
  };

  validate(req: Request, payload: any) {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
      RefreshTokenStrategy.logger.error('Authorization header is missing');
      throw new Error('Authorization header is missing');
    };

    const refreshToken = authHeader.replace('Bearer', '').trim();
    return { ...payload, refreshToken };
  };
};