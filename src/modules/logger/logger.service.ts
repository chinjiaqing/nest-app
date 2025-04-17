import { Injectable } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { loggerConstants } from 'src/common/constants/logger.constants';
import { getRequestContextStore } from 'src/common/stores/request-context.store';
import { ApiBadResponse, ApiOkResponse } from 'src/common/types';
import { createLogger, transports, format, Logger } from 'winston';
import 'winston-daily-rotate-file';

@Injectable()
export class LoggerService {
  private logger: Logger;

  constructor() {
    this.logger = createLogger({
      level: 'info',
      format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // 设置时间戳格式
        format.printf(({ timestamp, level, message, ...metadata }) => {
          // 确保时间戳在日志的最前面，并且处理 metadata（如 params）
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          let logMessage = `${timestamp} [${level}] : ${message}`;

          // 如果有 metadata（附加的对象），将它们格式化为 JSON
          if (Object.keys(metadata).length > 0) {
            if (metadata.message !== 'message') {
              logMessage += ` | ${JSON.stringify(metadata, null, 2)}`;
            }
          }
          return logMessage;
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
        // 使用 daily-rotate-file 来实现按日期生成不同日志文件
        new transports.DailyRotateFile({
          filename: 'logs/%DATE%.log', // 文件名中包含日期
          datePattern: 'YYYY-MM-DD', // 设置日期格式
          maxFiles: '7d', // 保留最近 7 天的日志文件
          level: 'info', // 日志级别为 info
          format: format.combine(
            format.timestamp({
              format: 'YYYY-MM-DD HH:mm:ss',
            }),
            format.printf((info) => {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              const paramsInfo = JSON.parse(JSON.stringify(info));
              // 避免 message 字段在日志中作为 key 出现
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              delete paramsInfo.message;
              return `${info.timestamp as string} [${info.level}] : ${info.message as string} ${
                Object.keys(info).length
                  ? JSON.stringify(paramsInfo, null, 2)
                  : ''
              }`;
            }),
          ),
        }),
      ],
    });
  }

  log(message: string, params: object = {}) {
    if (typeof params === 'object' && Object.keys(params).length > 0) {
      // 如果 params 对象存在，则将日志以自定义格式输出
      const logMessage = {
        message,
        ...params,
        level: 'info', // 设定日志级别为 info
      };
      this.logger.info(logMessage);
    } else {
      this.logger.info(message);
    }
  }

  error(message: string, params: object = {}, trace: string = '') {
    if (typeof params === 'object' && Object.keys(params).length > 0) {
      // 如果 params 对象存在，则将日志以自定义格式输出
      const logMessage = {
        message,
        ...params,
        level: 'error', // 设定日志级别为 error
        trace, // 如果有异常堆栈信息，可以添加到日志中
      };
      this.logger.error(logMessage);
    } else {
      this.logger.error(message);
    }
  }

  warn(message: string, params: object = {}) {
    if (typeof params === 'object' && Object.keys(params).length > 0) {
      // 如果 params 对象存在，则将日志以自定义格式输出
      const logMessage = {
        message,
        ...params,
        level: 'warn', // 设定日志级别为 warn
      };
      this.logger.warn(logMessage);
    } else {
      this.logger.warn(message);
    }
  }

  debug(message: string, params: object = {}) {
    if (typeof params === 'object' && Object.keys(params).length > 0) {
      // 如果 params 对象存在，则将日志以自定义格式输出
      const logMessage = {
        message,
        ...params,
        level: 'debug', // 设定日志级别为 debug
      };
      this.logger.debug(logMessage);
    } else {
      this.logger.debug(message);
    }
  }

  info(message: string, params: object = {}) {
    if (typeof params === 'object' && Object.keys(params).length > 0) {
      // 如果 params 对象存在，则将日志以自定义格式输出
      const logMessage = {
        message,
        ...params,
        level: 'info', // 设定日志级别为 info
      };
      this.logger.info(logMessage);
    } else {
      this.logger.info(message);
    }
  }

  /**
   * 敏感信息过滤器
   */
  private filterSensitive(obj: Record<string, any>): Record<string, any> {
    if (!obj) return {};
    return Object.keys(obj).reduce((acc, key) => {
      if (loggerConstants.SENSITIVE_KEYS.includes(key.toLowerCase())) {
        acc[key] = '******';
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        acc[key] = obj[key];
      }
      return acc;
    }, {});
  }

  // 规范存储 Request
  logRequest(request: FastifyRequest) {
    const { method, url, headers, body, query } = request;
    const store = getRequestContextStore();
    const request_id = store?.get('request_id') as string;
    this.log('Request', {
      method,
      url,
      headers: this.filterSensitive(headers),
      query: this.filterSensitive(query as Record<string, any>),
      body: this.filterSensitive(body as Record<string, any>),
      request_id,
      ip: store?.get('ip') as string,
    });
  }

  logResponse(response: ApiOkResponse | ApiBadResponse) {
    this.log('Response', response);
  }
}
