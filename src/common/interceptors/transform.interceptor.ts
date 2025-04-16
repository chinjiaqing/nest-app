import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map, tap, throwError, catchError } from 'rxjs';
import { LoggerService } from 'src/modules/logger/logger.service';
import { v1, v4 } from 'uuid';
import { AsyncLocalStorage } from 'node:async_hooks';

// 通用的api相应格式
interface ApiResponse<T> {
  code: number;
  data: T;
  msg: string;
  request_id: string;
  timestamp: number;
}

// 上下文中间件，用户缓存请求的request_id 和 开始时间// 创建异步上下文存储
const asyncLocalStorage = new AsyncLocalStorage<Map<string, any>>();

// 请求上下文中间件（需在入口模块注册）
@Injectable()
export class RequestContextMiddleware {
  use(req: any, res: any, next: () => void) {
    const store = new Map();
    asyncLocalStorage.run(store, () => {
      store.set('request_id', v4());
      store.set('start_time', process.hrtime());
      next();
    });
  }
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  // 敏感字段过滤列表
  private static SENSITIVE_KEYS = ['password', 'token', 'authorization'];
  // 需要保留的原始响应字段
  private static PRESERVE_KEYS = ['code', 'message', 'msg', 'pagination'];

  constructor(private readonly logger: LoggerService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();

    // 记录请求日志（带敏感信息过滤）
    this.logRequest(request);

    return next.handle().pipe(
      catchError((err) => {
        // 统一错误处理
        return throwError(() => this.formatError(err));
      }),
      map((data) => this.formatResponse(data)),
      tap((data) => {
        // 记录响应日志
        this.logResponse(request, data);
      }),
    );
  }

  /**
   * 格式化成功响应
   */
  private formatResponse(data: any): ApiResponse<T> {
    const preserved = {};
    // 保留关键字段
    TransformInterceptor.PRESERVE_KEYS.forEach((key) => {
      if (data?.[key] !== undefined) {
        preserved[key] = data[key];
        delete data[key];
      }
    });

    return {
      code: preserved['code'] || 0,
      data: data?.data ?? data,
      msg: preserved['message'] || 'Success',
      request_id: asyncLocalStorage.getStore()?.get('request_id'),
      timestamp: Date.now(),
      ...preserved,
    };
  }

  /**
   * 格式化错误响应
   */
  private formatError(error: any) {
    const status = error.getStatus?.() || 500;
    const message = error.response?.message || error.message || error.msg;

    return {
      code: -1,
      msg: message,
      request_id: asyncLocalStorage.getStore()?.get('request_d'),
      timestamp: Date.now(),
    };
  }

  /**
   * 记录请求日志（带敏感信息过滤）
   */
  private logRequest(request: any) {
    const { method, url, headers, body, query } = request;
    const request_id = asyncLocalStorage.getStore()?.get('request_id');
    this.logger.log('Request', {
      method,
      url,
      headers: this.filterSensitive(headers),
      query: this.filterSensitive(query),
      body: this.filterSensitive(body),
      request_id,
    });
  }

  /**
   * 记录响应日志
   */
  private logResponse(request: any, response: ApiResponse<T>) {
    const [sec, nanosec] = process.hrtime(
      asyncLocalStorage.getStore()?.get('start_time'),
    );
    const responseTime = (sec * 1e3 + nanosec / 1e6).toFixed(2) + 'ms';
    console.log('----response---',response)
    this.logger.log('Response', {
      method: request.method,
      url: request.url,
      code: response.code,
      response_time:responseTime,
      request_id: asyncLocalStorage.getStore()?.get('request_id'),
    });
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
        acc[key] = obj[key];
      }
      return acc;
    }, {});
  }
}
