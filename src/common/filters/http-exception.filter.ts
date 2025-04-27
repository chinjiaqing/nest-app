import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpExceptionBody,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBadResponseBody, LogCategoryNameMap } from '../types';
import {
  getRequestContextStore,
  getResponseTime,
} from '../stores/request-context.store';
import { API_MESSAGES_CONSTANTS } from '../constants/api-message.constants';
import { FastifyReply, FastifyRequest } from 'fastify';
import { InjectLogger } from '../decorators/logger.decorator';
import { formatRequest, formatResponse } from '../utils/logger.utils';
import { API_CODE_CONSTANTS } from '../constants/api.constants';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(
    @InjectLogger('http')
    private readonly httpLogger: LogCategoryNameMap['http'],
  ) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp(); // 获取请求上下文
    const request = ctx.getRequest<FastifyRequest>();
    const response = ctx.getResponse<FastifyReply>(); // 获取请求上下文中的 response对象
    const status = exception.getStatus(); // 获取异常状态码
    const exceptionResponse = exception.getResponse() as HttpExceptionBody;
    const store = getRequestContextStore();
    let validMessage = '';
    if (typeof exceptionResponse === 'object') {
      validMessage =
        typeof exceptionResponse.message === 'string' ||
        typeof exceptionResponse.message === 'number'
          ? exceptionResponse.message + ''
          : Array.isArray(exceptionResponse.message)
            ? exceptionResponse.message[0]
            : '';
    }
    const message = exception.message
      ? exception.message
      : `${status >= 500 ? 'Service Error' : 'Client Error'}`;

    // jwt 认证失败时，自定义消息
    if (exception instanceof UnauthorizedException) {
      validMessage = API_MESSAGES_CONSTANTS.UNAUTH;
    }
    if (status === (HttpStatus.NOT_FOUND as number)) {
      validMessage = API_MESSAGES_CONSTANTS.NOT_FOUNT;
    }
    const errorResponse: ApiBadResponseBody = {
      data: null,
      msg: validMessage || message,
      code: API_CODE_CONSTANTS.FAILED,
      request_id: store?.get('request_id') as string,
      response_time: getResponseTime(),
      timestamp: Date.now(),
    };

    // 设置返回的状态码， 请求头，发送错误信息
    response.status(status);
    response.header('Content-Type', 'application/json; charset=utf-8');
    response.send(errorResponse);
    this.httpLogger.log('Request', formatRequest(request));
    this.httpLogger.log('Response', formatResponse(errorResponse));
  }
}
