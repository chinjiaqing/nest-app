import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { v1 } from 'uuid';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        if(data instanceof BadRequestException) {
          return {
            msg: data.message,
            code:-1,
            data:null,
            request_id:v1()
          }
        }else{
          return {
            data,
            code: 0,
            msg: '请求成功',
            request_id:v1()
          };
        }
      }),
    );
  }
}
