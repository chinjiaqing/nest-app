import { AsyncLocalStorage } from 'node:async_hooks';

export type Store = Map<string, any>;
// 上下文中间件，用户缓存请求的request_id 和 开始时间// 创建异步上下文存储
export const asyncLocalStorage = new AsyncLocalStorage<Store>();

export function getResponseTime() {
  const store = getRequestContextStore();
  const [sec, nanosec] = process.hrtime(
    store?.get('start_time') as [number, number],
  );
  // const responseTime = parseFloat((sec * 1e3 + nanosec / 1e6).toFixed(2));
  const responseTime = sec * 1e3 + nanosec / 1e6;
  return responseTime;
}

export const getRequestContextStore = (): Store | undefined => {
  return asyncLocalStorage.getStore();
};
