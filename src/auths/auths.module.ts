import { Module } from '@nestjs/common';
import { AuthsController } from './auths.controller';
import { AuthsService } from './auths.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshSessionEntity } from './entities/refresh-session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RefreshSessionEntity])],
  controllers: [AuthsController],
  providers: [AuthsService]
})
export class AuthsModule {}
