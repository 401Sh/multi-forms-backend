import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from 'database/db-source';
import { ConfigModule } from '@nestjs/config';
import { SurveysModule } from './surveys/surveys.module';
import { RespondentsModule } from './respondents/respondents.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    UsersModule,
    SurveysModule,
    RespondentsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
