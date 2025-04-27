import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as path from 'path';
import { corsWhiteList } from './config';
import { HttpException, HttpStatus, VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  );
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    prefix: 'v',
  });
  app.setGlobalPrefix('api', {
    exclude: ['/docs'],
  });
  app.enableCors({
    origin: (origin, callback) => {
      if (origin && !corsWhiteList.includes(origin)) {
        callback(new HttpException(`访问被禁止`, HttpStatus.FORBIDDEN), false);
      } else {
        callback(null, origin || true);
      }
    },
    methods: 'GET,POST',
    credentials: true,
  });
  //支持静态资源
  app.useStaticAssets({
    root: path.resolve(__dirname, '..', 'public'),
    prefix: '/static/',
  });

  // swagger文档
  const swaggerConfig = new DocumentBuilder()
    .setTitle('接口文档')
    .setDescription('接口文档')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, swaggerDocument);

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap().catch((err) => {
  console.log('启动失败', err);
});
