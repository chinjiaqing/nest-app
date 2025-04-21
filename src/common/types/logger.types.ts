import { LOGGER_CONSTANTS } from '../constants/logger.constants';

export type LogCategoryName =
  (typeof LOGGER_CONSTANTS.ALLOWED_CATEGORIES)[number];

export interface IBaseLogMetadata {
  category: LogCategoryName;
  level?: 'info' | 'warn' | 'error' | 'debug';
  [key: string]: unknown;
}

export interface IBaseLogger {
  /**
   * 输出日志
   * @param message 日志标题
   * @param params 日志内容
   * @param metadata
   */
  log(
    message: string,
    params?: object | string,
    metadata?: Omit<IBaseLogMetadata, 'category'>,
  ): void;
  /**
   * 错误日志
   * @param message 日志标题
   * @param params 日志内容 Error or Object
   * @param metadata
   */
  error(
    message: string,
    params?: object,
    metadata?: Omit<IBaseLogMetadata, 'category'>,
  ): void;
  warn(
    message: string,
    params?: object,
    metadata?: Omit<IBaseLogMetadata, 'category'>,
  ): void;
  debug(
    message: string,
    params?: object,
    metadata?: Omit<IBaseLogMetadata, 'category'>,
  ): void;
}

export type LogCategoryNameMap = {
  [K in LogCategoryName]: IBaseLogger;
};

export type LoggerToken<T extends keyof LogCategoryNameMap> =
  `Logger:${Capitalize<T>}`;
