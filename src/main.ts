import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as path from 'path';
import { LoggerService } from './modules/logger/logger.service';
import { GlobalErrorExceptionFilter } from './common/filters/error-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  );

  //支持静态资源
  app.useStaticAssets({
    root: path.resolve(__dirname, '..', 'public'),
    prefix: '/static/',
  });

  // 全局管道
  app.useGlobalPipes(new ValidationPipe());

  const loggerService = app.get(LoggerService);

  // 过滤器
  app.useGlobalFilters(new GlobalErrorExceptionFilter(loggerService));
  app.useGlobalFilters(new HttpExceptionFilter(loggerService));
  app.useGlobalInterceptors(new TransformInterceptor(loggerService));

  // swagger文档
  const swaggerConfig = new DocumentBuilder()
    .setTitle('接口文档')
    .setDescription('接口文档')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, swaggerDocument);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((err) => {
  console.log('启动失败', err);
});
