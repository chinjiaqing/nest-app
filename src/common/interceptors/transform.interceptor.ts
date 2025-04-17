import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map, tap, throwError, catchError } from 'rxjs';
import { LoggerService } from 'src/modules/logger/logger.service';
import {
  getRequestContextStore,
  getResponseTime,
} from '../stores/request-context.store';
import { ApiOkResponse } from '../types';
import { FastifyRequest } from 'fastify';

// 通用的api相应格式
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiOkResponse<T>>
{
  constructor(private readonly logger: LoggerService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiOkResponse<T>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<FastifyRequest>();
    this.logger.logRequest(request);

    return next.handle().pipe(
      catchError((err: Error) => {
        const store = getRequestContextStore();
        const request_id = store?.get('request_id') as string;
        this.logger.error(
          'Error',
          {
            request_id,
            message: err.message || 'unknown error',
            timestamp: Date.now(),
            error_type: err.constructor.name,
          },
          err.stack || '',
        );
        return throwError(() => err);
      }),
      map((data) => this.formatResponse(data)),
      tap((data) => {
        // 记录响应日志
        this.logger.logResponse(data);
      }),
    );
  }

  /**
   * 格式化成功响应
   */
  private formatResponse(data: any): ApiOkResponse<T> {
    const store = getRequestContextStore();
    return {
      code: 0,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data: data,
      msg: 'success',
      request_id: store?.get('request_id') as string,
      timestamp: Date.now(),
      response_time: getResponseTime(),
    };
  }
}
