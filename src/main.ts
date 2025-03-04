import * as cookieParser from 'cookie-parser';
import * as fs from 'fs';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const isProduction = process.env.NODE_ENV === 'production';

  const app = isProduction
    ? await NestFactory.create(AppModule, {
        httpsOptions: {
          cert: fs.readFileSync('/usr/src/app/ssl/certificate.crt'),
          key: fs.readFileSync('/usr/src/app/ssl/private.key'),
        },
      })
    : await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setDescription('The todo API description')
    .setVersion('1.0')
    .build();

  app.use(cookieParser());

  app.enableCors({
    credentials: true,
    origin: [
      'http://localhost:8080',
      'http://18.214.91.17',
      'https://tickets-platform.duckdns.org',
    ],
  });

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
