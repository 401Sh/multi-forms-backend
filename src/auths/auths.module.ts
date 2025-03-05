import { Module } from '@nestjs/common';
import { AuthsController } from './auths.controller';
import { AuthsService } from './auths.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshSessionEntity } from './entities/refresh-session.entity';
import { AccessTokenStrategy } from './strategies/accessToken.strategy';
import { RefreshTokenStrategy } from './strategies/refreshToken.strategy';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshSessionEntity]),
    UsersModule,
    JwtModule.register({})
  ],
  controllers: [AuthsController],
  providers: [AuthsService, AccessTokenStrategy, RefreshTokenStrategy]
})
export class AuthsModule {}
