import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
} from '@nestjs/common';
import { ApiBadResponse } from '../types';
import {
  getRequestContextStore,
  getResponseTime,
} from '../stores/request-context.store';
import { LoggerService } from 'src/modules/logger/logger.service';
import { FastifyReply } from 'fastify';

@Catch()
export class GlobalErrorExceptionFilter<T> implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp(); // 获取请求上下文
    const response = ctx.getResponse<FastifyReply>(); // 获取请求上下文中的 response对象
    const statusCode = exception.getStatus?.() || 500; // 获取异常状态码
    const store = getRequestContextStore();
    const message = exception.message ? exception.message : 'Internal server error';

    const resp: ApiBadResponse = {
      code: exception?.code || -1,
      data: null,
      timestamp: Date.now(),
      msg: message,
      request_id: store?.get('request_id'),
      response_time: getResponseTime(),
    };
    response.status(statusCode);
    response.header('Content-Type', 'application/json; charset=utf-8');
    response.send(resp);
    this.logger.info('Response', resp);
  }
}
