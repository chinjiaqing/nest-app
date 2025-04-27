import { FastifyRequest } from 'fastify';
import { LOGGER_CONSTANTS } from '../constants/logger.constants';
import { getRequestContextStore } from '../stores/request-context.store';
import {
  ApiBadResponseBody,
  ApiOkResponseBody,
  LogCategoryNameMap,
} from '../types';

export const generateLoggerToken = <T extends keyof LogCategoryNameMap>(
  category: T,
): `Logger:${Capitalize<T>}` => {
  return `Logger:${category[0].toUpperCase() + category.slice(1)}` as `Logger:${Capitalize<T>}`;
};

/**
 * 敏感词过滤
 * @param obj
 * @returns
 */
function filterSensitive(obj: Record<string, any>): Record<string, any> {
  if (!obj) return {};
  return Object.keys(obj).reduce((acc, key) => {
    if (key in LOGGER_CONSTANTS.SENSITIVE_KEYS) {
      acc[key] = '******';
    } else {
      acc[key] = obj[key] as string;
    }
    return acc;
  }, {});
}

/**
 * 格式化 request 到日志
 * @param request
 * @returns
 */
export function formatRequest(request: FastifyRequest) {
  const { method, url, headers, body, query } = request;
  const store = getRequestContextStore();
  const request_id = store?.get('request_id') as string;
  return {
    method,
    url,
    headers: filterSensitive(headers),
    query: filterSensitive(query as Record<string, any>),
    body: filterSensitive(body as Record<string, any>),
    request_id,
    ip: store?.get('ip') as string,
  };
}

/**
 * 格式化 response 到日志
 * @param response
 * @returns
 */
export function formatResponse(
  response: ApiOkResponseBody<any> | ApiBadResponseBody,
) {
  return response;
}
