import {
    ArgumentsHost,
    BadRequestException,
    Catch,
    ExceptionFilter,
    HttpException,
  } from '@nestjs/common';
  import { v1 } from 'uuid';
  
  @Catch(BadRequestException)
  export class BadRequestExceptionFilter<T> implements ExceptionFilter {
    catch(exception: BadRequestException, host: ArgumentsHost) {
      console.log('%c [ exception ]-13', 'font-size:13px; background:pink; color:#bf2c9f;', exception)
      const ctx = host.switchToHttp(); // 获取请求上下文
      const response = ctx.getResponse(); // 获取请求上下文中的 response对象
      const status = exception.getStatus(); // 获取异常状态码
      
  
      // 设置返回的状态码， 请求头，发送错误信息
      response.status(status);
      response.header('Content-Type', 'application/json; charset=utf-8');
      response.send({
        code:-1
      });
    }
  }
  