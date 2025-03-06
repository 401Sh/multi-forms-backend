import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

type JwtPayload = {
  sub: string,
  login: string
};

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  private static readonly logger = new Logger(RefreshTokenStrategy.name);

  constructor() {
    const jwtSecret = process.env.JWT_ACCESS_SECRET;
    if (!jwtSecret) {
      RefreshTokenStrategy.logger.error('JWT_ACCESS_SECRET is not defined. Application cannot start.');
      throw new Error('JWT_ACCESS_SECRET is not defined');
    };

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtSecret,
      ignoreExpiration: true
    });
  };

  validate(payload: JwtPayload) {
    return payload;
  };
};