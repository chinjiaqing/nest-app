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
  // 敏感字段过滤列表
  private static SENSITIVE_KEYS = ['password', 'token', 'authorization'];
  // 需要保留的原始响应字段
  // private static PRESERVE_KEYS = ['code', 'message', 'pagination'];

  constructor(private readonly logger: LoggerService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiOkResponse<T>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<FastifyRequest>();

    // 记录请求日志（带敏感信息过滤）
    this.logRequest(request);

    return next.handle().pipe(
      catchError((err: Error) => {
        const store = getRequestContextStore();
        const request_id = store?.get('request_id') as string;
        this.logger.error('Error', {
          request_id,
          message: err.message || 'unknown error',
          stack: err.stack || '',
          timestamp: Date.now(),
          error_type: err.constructor.name,
        });
        return throwError(() => err);
      }),
      map((data) => this.formatResponse(data)),
      tap((data) => {
        // 记录响应日志
        this.logResponse(data);
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

  /**
   * 记录请求日志（带敏感信息过滤）
   */
  private logRequest(request: FastifyRequest) {
    const { method, url, headers, body, query } = request;
    const store = getRequestContextStore();
    const request_id = store?.get('request_id') as string;
    this.logger.log('Request', {
      method,
      url,
      headers: this.filterSensitive(headers),
      query: this.filterSensitive(query as Record<string, any>),
      body: this.filterSensitive(body as Record<string, any>),
      request_id,
      ip: store?.get('ip') as string,
    });
  }

  /**
   * 记录响应日志
   */
  private logResponse(response: ApiOkResponse<T>) {
    this.logger.log('Response', response);
  }

  /**
   * 敏感信息过滤器
   */
  private filterSensitive(obj: Record<string, any>): Record<string, any> {
    if (!obj) return {};

    return Object.keys(obj).reduce((acc, key) => {
      if (TransformInterceptor.SENSITIVE_KEYS.includes(key.toLowerCase())) {
        acc[key] = '******';
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        acc[key] = obj[key];
      }
      return acc;
    }, {});
  }
}
