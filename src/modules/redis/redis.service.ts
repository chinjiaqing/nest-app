import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
@Injectable()
export class RedisService {
  private redisClient: Redis;

  constructor() {
    this.redisClient = new Redis({
      host: '127.0.0.1',
      port: 6379,
      password: '123456',
      db: 0,
    });
  }

  async get(key: string): Promise<string | null> {
    return await this.redisClient.get(key);
  }

  async set(key: string, value: string, ...args: any[]): Promise<void> {
    await this.redisClient.set(key, value, ...args);
  }

  async exists(key: string) {
    return await this.redisClient.exists(key);
  }

  async onModuleDestroy() {
    await this.redisClient.quit();
  }
}
