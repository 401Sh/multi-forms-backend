import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

type JwtPayload = {
  sub: string,
  login: string
};

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  private static readonly logger = new Logger(RefreshTokenStrategy.name);

  constructor() {
    const refreshSecret = process.env.JWT_REFRESH_SECRET;

    if (!refreshSecret) {
      RefreshTokenStrategy.logger.error('JWT_REFRESH_SECRET is not defined. Application cannot start.');
      throw new Error('JWT_REFRESH_SECRET is not defined');
    };

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([(req: Request) => {
        const accessToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
        const refreshToken = req.cookies?.refreshToken;
        
        if (!accessToken) {
          RefreshTokenStrategy.logger.warn('Access token is missing in headers.');
          throw new UnauthorizedException('Access token is missing');
        };
        if (!refreshToken) {
          RefreshTokenStrategy.logger.warn('Refresh token is missing in cookies.');
          throw new UnauthorizedException('Refresh token is missing');
        };

        // const decodedAccessToken = jwt.verify(accessToken, accessSecret) as JwtPayload;
        // const decodedRefreshToken = jwt.verify(refreshToken, refreshSecret) as JwtPayload;

        // if (decodedAccessToken.sub !== decodedRefreshToken.sub) {
        //   RefreshTokenStrategy.logger.warn('User ID mismatch between access and refresh tokens.');
        //   throw new UnauthorizedException('User ID mismatch between tokens');
        // }

        return refreshToken;
      }]),
      secretOrKey: refreshSecret,
      ignoreExpiration: true
    });
  };

  validate(payload: JwtPayload) {
    return payload;
  };
};