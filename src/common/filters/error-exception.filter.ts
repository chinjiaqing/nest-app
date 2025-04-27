import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { ApiBadResponseBody, IBaseLogger } from '../types';
import {
  getRequestContextStore,
  getResponseTime,
} from '../stores/request-context.store';
import { FastifyReply } from 'fastify';
import { JsonWebTokenError } from '@nestjs/jwt';
import { API_MESSAGES_CONSTANTS } from '../constants/api-message.constants';
import { InjectLogger } from '../decorators/logger.decorator';
import { formatResponse } from '../utils/logger.utils';
import { API_CODE_CONSTANTS } from '../constants/api.constants';

@Catch()
export class GlobalErrorExceptionFilter implements ExceptionFilter {
  constructor(
    @InjectLogger('http')
    private readonly httpLogger: IBaseLogger,
  ) {}

  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp(); // 获取请求上下文
    const response = ctx.getResponse<FastifyReply>(); // 获取请求上下文中的 response对象
    let statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR; // 获取异常状态码
    const store = getRequestContextStore();
    let message: string = exception.message
      ? exception.message
      : 'Internal server error';

    if (exception instanceof JsonWebTokenError) {
      statusCode = HttpStatus.UNAUTHORIZED;
      message = API_MESSAGES_CONSTANTS.UNAUTH;
    }

    const resp: ApiBadResponseBody = {
      code: API_CODE_CONSTANTS.FAILED,
      data: null,
      timestamp: Date.now(),
      msg: message,
      request_id: store?.get('request_id') as string,
      response_time: getResponseTime(),
    };
    response.status(statusCode);
    response.header('Content-Type', 'application/json; charset=utf-8');
    response.send(resp);
    this.httpLogger.log('Response', formatResponse(resp));
  }
}
