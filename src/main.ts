import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import * as cookieParser from 'cookie-parser';
import { Logger, LogLevel, ValidationPipe } from '@nestjs/common';

dotenv.config();

const host = process.env.HOST || '127.0.0.1';
const port = process.env.PORT ? +process.env.PORT : 3000;

const logLevels = process.env.LOG_LEVEL?.split(',') as LogLevel[] || ['log', 'error', 'warn'];

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.useLogger(logLevels);
  app.use(cookieParser());

  // Enable global validation
  app.useGlobalPipes(new ValidationPipe({
    transform: true,         // Ensures that the body is transformed into the DTO
    whitelist: true,         // Removes properties not decorated with validation decorators
    forbidNonWhitelisted: true, // Throws an error if extra properties are provided
  }));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Multi forms backend API')
    .setDescription('API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port, host).then(() => {
    Logger.log(`http://${host}:${port}/api - server start`);
    Logger.log(`http://${host}:${port}/api/docs - swagger start`);
  });
}
bootstrap();
