// src/logger/global-logger.module.ts
import { DynamicModule, Module, Provider } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { CreateLogger } from './logger.factory';
import { LOGGER_CONSTANTS } from 'src/common/constants/logger.constants';
import { LoggerToken } from 'src/common/types';
import { generateLoggerToken } from 'src/common/utils/logger.utils';

@Module({})
export class LoggerModule {
  static forRootAsync(): DynamicModule {
    // 动态生成所有分类的 Provider
    const providers: Provider[] = LOGGER_CONSTANTS.ALLOWED_CATEGORIES.map(
      (category) => {
        const token: LoggerToken<typeof category> =
          generateLoggerToken(category);
        return {
          provide: token, // 生成唯一 Token，如 "HttpLogger"
          useFactory: (logger: LoggerService) => {
            const LoggerClass = CreateLogger(category);
            return new LoggerClass(logger);
          },
          inject: [LoggerService],
        };
      },
    );

    return {
      module: LoggerModule,
      imports: [],
      providers: [LoggerService, ...providers],
      exports: [LoggerService, ...providers],
      global: true, // 标记为全局模块
    };
  }
}
