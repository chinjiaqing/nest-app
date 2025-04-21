import { Injectable } from '@nestjs/common';
import {
  LogCategoryName,
  IBaseLogger,
  IBaseLogMetadata,
} from 'src/common/types';
import { LoggerService } from './logger.service';

export type BaseLoggerFactory = (
  category: LogCategoryName,
) => new (logger: LoggerService) => IBaseLogger;

export const CreateLogger: BaseLoggerFactory = (category: LogCategoryName) => {
  @Injectable()
  class BaseLogger implements IBaseLogger {
    constructor(private readonly logger: LoggerService) {}

    private createMetadata(
      metadata: Omit<IBaseLogMetadata, 'category'>,
    ): IBaseLogMetadata {
      return { category, ...metadata };
    }

    log(
      message: string,
      info: object | string = {},
      metadata: Omit<IBaseLogMetadata, 'category'>,
    ) {
      let params = info;
      if (typeof info === 'object') {
        if (info instanceof Error) {
          params = {
            ...info,
            message: info.message,
            stack: info.stack,
          };
        } else {
          params = info;
        }
      }
      this.logger.log(message, params, this.createMetadata(metadata));
    }

    error(
      message: string,
      err: Error | object = {},
      metadata: Omit<IBaseLogMetadata, 'category'>,
    ) {
      this.logger.error(message, err, this.createMetadata(metadata));
    }
    warn(
      message: string,
      params: object,
      metadata: Omit<IBaseLogMetadata, 'category'>,
    ): void {
      this.logger.log(message, params, this.createMetadata(metadata));
    }
    debug(
      message: string,
      params: object,
      metadata: Omit<IBaseLogMetadata, 'category'>,
    ): void {
      this.logger.log(message, params, this.createMetadata(metadata));
    }
  }

  //   return BaseLogger as typeof BaseLogger & { name: string };
  return BaseLogger;
};
