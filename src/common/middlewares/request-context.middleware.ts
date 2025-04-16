import { Injectable, NestMiddleware } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { Store, asyncLocalStorage } from '../stores/request-context.store';
import { v4 } from 'uuid';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use(req: FastifyRequest, res: FastifyReply, next: () => void) {
    const store: Store = new Map();
    asyncLocalStorage.run(store, () => {
      store.set('request_id', v4());
      store.set('start_time', process.hrtime());
      store.set('ip', req.ip);
      next();
    });
  }
}
