import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import { Logger, LogLevel } from '@nestjs/common';

dotenv.config();

const host = process.env.HOST || '127.0.0.1';
const port = process.env.PORT ? +process.env.PORT : 3000;

const logLevels = process.env.LOG_LEVEL?.split(',') as LogLevel[] || ['log', 'error', 'warn'];

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useLogger(logLevels);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Multi forms backend API')
    .setDescription('API documentation')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/v1/docs', app, document);

  await app.listen(port, host).then(() => {
    Logger.log(`http://${host}:${port} - server start`);
    Logger.log(`http://${host}:${port}/v1/docs - swagger start`);
  });
}
bootstrap();
