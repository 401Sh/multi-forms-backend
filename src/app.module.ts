import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from 'src/database/db-source';
import { ConfigModule } from '@nestjs/config';
import { SurveysModule } from './surveys/surveys.module';
import { ResponsesModule } from './responses/response.module';
import { AuthModule } from './auth/auth.module';
import { QuestionsModule } from './questions/questions.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptions),
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    UsersModule,
    SurveysModule,
    ResponsesModule,
    AuthModule,
    QuestionsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
