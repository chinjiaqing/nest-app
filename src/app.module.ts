import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import envConfig from './config/env';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './modules/user/user.module';
import { User } from './modules/user/entities/user.entity';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { jwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RedisService } from './modules/redis/redis.service';
import { RedisModule } from './modules/redis/redis.module';
import { LoggerService } from './modules/logger/logger.service';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: envConfig.path,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'mysql',
        entities: [User],
        host: configService.get('DB_HOST'),
        port: configService.get<number>('DB_PORT'), // 端口号
        username: configService.get('DB_USER'), // 用户名
        password: configService.get('DB_PASSWORD'), // 密码
        database: configService.get('DB_DATABASE'), //数据库名
        timezone: '+08:00', //服务器上配置的时区
        synchronize: true, //根据实体自动创建数据库表， 生产环境建议关闭
      }),
    }),
    UserModule,
    RedisModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: jwtAuthGuard,
    },
    RedisService,
    LoggerService,
  ],
})
export class AppModule {}
