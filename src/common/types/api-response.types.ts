/**
 * 标准 API 响应格式
 * @template T 数据类型
 */
export interface ApiOkResponse<T = unknown> {
  code: number;
  data: T;
  msg: string;
  request_id: string;
  timestamp: number;
  response_time: number;
}

export interface ApiBadResponse {
  code: number;
  data: null;
  msg: string;
  request_id: string;
  timestamp: number;
  response_time: number;
}
