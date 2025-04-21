import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { PublicApi } from './common/decorators/public-api.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @PublicApi()
  getHello(): string {
    return this.appService.getHello();
  }
}
