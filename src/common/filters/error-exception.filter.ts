import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { ApiBadResponse } from '../types';
import {
  getRequestContextStore,
  getResponseTime,
} from '../stores/request-context.store';
import { LoggerService } from 'src/modules/logger/logger.service';
import { FastifyReply } from 'fastify';
import { JsonWebTokenError } from '@nestjs/jwt';
import { apiMessageConstants } from '../constants/api-message.constants';

@Catch()
export class GlobalErrorExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp(); // 获取请求上下文
    const response = ctx.getResponse<FastifyReply>(); // 获取请求上下文中的 response对象
    let statusCode: number = 500; // 获取异常状态码
    const store = getRequestContextStore();
    let message: string = exception.message
      ? exception.message
      : 'Internal server error';

    if (exception instanceof JsonWebTokenError) {
      statusCode = 401;
      message = apiMessageConstants.UNAUTH;
    }

    const resp: ApiBadResponse = {
      code: -1,
      data: null,
      timestamp: Date.now(),
      msg: message,
      request_id: store?.get('request_id') as string,
      response_time: getResponseTime(),
    };
    response.status(statusCode);
    response.header('Content-Type', 'application/json; charset=utf-8');
    response.send(resp);
    this.logger.info('Response', resp);
  }
}
