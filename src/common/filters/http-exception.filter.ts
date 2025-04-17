import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBadResponse } from '../types';
import {
  getRequestContextStore,
  getResponseTime,
} from '../stores/request-context.store';
import { LoggerService } from 'src/modules/logger/logger.service';
import { apiMessageConstants } from '../constants/api-message.constants';

@Catch(HttpException)
export class HttpExceptionFilter<T> implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    console.log(
      '%c [ exception ]-19',
      'font-size:13px; background:pink; color:#bf2c9f;',
      exception,
    );
    const ctx = host.switchToHttp(); // 获取请求上下文
    const response = ctx.getResponse(); // 获取请求上下文中的 response对象
    const status = exception.getStatus(); // 获取异常状态码
    const exceptionResponse: any = exception.getResponse();
    const store = getRequestContextStore();
    let validMessage = '';
    if (typeof exceptionResponse === 'object') {
      validMessage =
        typeof exceptionResponse.message === 'string'
          ? exceptionResponse.message
          : Array.isArray(exceptionResponse.message)
            ? exceptionResponse.message[0]
            : '';
    }
    const message = exception.message
      ? exception.message
      : `${status >= 500 ? 'Service Error' : 'Client Error'}`;

    // jwt 认证失败时，自定义消息
    if (exception instanceof UnauthorizedException) {
      validMessage = apiMessageConstants.UNAUTH;
    }
    const errorResponse: ApiBadResponse = {
      data: null,
      msg: validMessage || message,
      code: -1,
      request_id: store?.get('request_id'),
      response_time: getResponseTime(),
      timestamp: Date.now(),
    };

    // 设置返回的状态码， 请求头，发送错误信息
    response.status(status);
    response.header('Content-Type', 'application/json; charset=utf-8');
    response.send(errorResponse);
    this.logger.info('Response', errorResponse);
  }
}
