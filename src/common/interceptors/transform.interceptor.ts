import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map, tap, throwError, catchError } from 'rxjs';
import {
  getRequestContextStore,
  getResponseTime,
} from '../stores/request-context.store';
import { ApiOkResponseBody, LogCategoryNameMap } from '../types';
import { FastifyRequest } from 'fastify';
import { InjectLogger } from '../decorators/logger.decorator';
import { formatRequest } from '../utils/logger.utils';
import { API_CODE_CONSTANTS } from '../constants/api.constants';

// 通用的api相应格式
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiOkResponseBody<T>>
{
  constructor(
    @InjectLogger('http')
    private readonly httpLogger: LogCategoryNameMap['http'],
  ) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiOkResponseBody<T>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<FastifyRequest>();
    // this.logger.logRequest(request);
    this.httpLogger.log('Request', formatRequest(request));

    return next.handle().pipe(
      catchError((err: Error) => {
        const store = getRequestContextStore();
        const request_id = store?.get('request_id') as string;
        this.httpLogger.log(
          'Error',
          {
            request_id,
            message: err.message || 'unknown error',
            timestamp: Date.now(),
            error_type: err.constructor.name,
          },
          {
            level: 'error',
          },
        );
        return throwError(() => err);
      }),
      map((data) => this.formatResponse(data)),
      tap((data) => {
        // 记录响应日志
        this.httpLogger.log('Response', data);
      }),
    );
  }

  /**
   * 格式化成功响应
   */
  private formatResponse(data: any): ApiOkResponseBody<T> {
    const store = getRequestContextStore();
    return {
      code: API_CODE_CONSTANTS.SUCCESS,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data: data,
      msg: 'success',
      request_id: store?.get('request_id') as string,
      timestamp: Date.now(),
      response_time: getResponseTime(),
    };
  }
}
