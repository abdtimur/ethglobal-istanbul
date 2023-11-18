import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Env } from './config/interfaces';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.setGlobalPrefix('api');

  const configService = app.get(ConfigService);

  app.enableCors();

  await app.listen(configService.get(Env.PORT) ?? '8000');
}
bootstrap();
