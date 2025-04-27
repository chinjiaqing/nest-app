import { Injectable, Scope } from '@nestjs/common';
import { IBaseLogMetadata, LogCategoryName } from 'src/common/types';
import { createLogger, transports, format, Logger, Logform } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { SeqTransport } from '@datalust/winston-seq';
import { ConfigService } from '@nestjs/config';
const defaultLogMetaData: IBaseLogMetadata = {
  category: 'http',
  level: 'info',
};

const filterTransportByCategory = (category: LogCategoryName) => {
  return format((info: Logform.TransformableInfo) => {
    if (info.category && info.category !== category) return false;
    return info;
  })();
};

function printfMessagePayload(info: Logform.TransformableInfo) {
  const { timestamp, level, message, ...metadata } = info;
  // 确保时间戳在日志的最前面，并且处理 metadata（如 params）
  let logMessage = `${timestamp as string} [${level}] : ${message as string}`;
  // 如果有 metadata（附加的对象），将它们格式化为 JSON
  if (Object.keys(metadata).length > 0) {
    if (metadata.message !== 'message') {
      logMessage += ` | ${JSON.stringify(metadata, null, 2)}`;
    }
  }
  return logMessage;
}

@Injectable({ scope: Scope.DEFAULT })
export class LoggerService {
  private logger: Logger;
  private transportsMap = new Map<
    string,
    DailyRotateFile.DailyRotateFileTransportOptions
  >();

  constructor(private readonly configService: ConfigService) {
    this.logger = createLogger({
      level: 'info',
      format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // 设置时间戳格式
        format.printf((info) => {
          return printfMessagePayload(info);
        }),
      ),
      transports: [
        // 控制台输出
        new transports.Console({
          format: format.combine(
            format.colorize(), // 颜色化输出
            format.simple(), // 简单格式
          ),
        }),
        new SeqTransport({
          serverUrl: this.configService.get<string>('SEQ_HOST'),
          apiKey: this.configService.get<string>('SEQ_SECRET'),
          onError: (e) => {
            console.error(`SeqTransport Error`, e);
          },
          format: format.combine(
            format.timestamp({
              format: 'YYYY-MM-DD HH:mm:ss',
            }),
            format.printf((info: Logform.TransformableInfo) => {
              return printfMessagePayload(info);
            }),
          ),
          handleExceptions: true,
          handleRejections: true,
        }),
      ],
    });
  }

  private ensureTransport(category: LogCategoryName): void {
    if (!this.transportsMap.has(category)) {
      const transport = new DailyRotateFile({
        filename: `logs/${category}/%DATE%.log`,
        datePattern: 'YYYY-MM-DD', // 设置日期格式
        maxFiles: '7d', // 保留最近 7 天的日志文件
        level: 'info', // 日志级别为 info
        format: format.combine(
          filterTransportByCategory(category),
          format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss',
          }),
          format.printf((info: Logform.TransformableInfo) => {
            return printfMessagePayload(info);
          }),
        ),
      });
      this.logger.add(transport);
      this.transportsMap.set(category, transport);
    }
  }
  log(
    message: string,
    params: object | string = {},
    metadata: IBaseLogMetadata = defaultLogMetaData,
  ) {
    const logMethod = metadata.level || 'info';
    const logTitle =
      typeof params === 'string' ? message + ' ' + params : message;
    const logBody = {
      message: logTitle,
      ...(typeof params === 'object' ? params : {}),
      __LOG_NAME: metadata?.category,
    };
    this.ensureTransport(metadata.category);
    this.logger[logMethod](logBody);
  }
  error(
    message: string,
    err: Error | object = {},
    metadata: IBaseLogMetadata = defaultLogMetaData,
  ) {
    this.log(
      message,
      {
        message: err instanceof Error ? err?.message : message,
        stack: err instanceof Error ? err?.stack : '',
        ...err,
      },
      {
        ...metadata,
        level: 'error',
      },
    );
  }
}
