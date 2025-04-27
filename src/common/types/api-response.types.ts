import type {
  ApiBadResponseDto,
  ApiOkResponseDto,
} from '../dtos/api-response.dto';

/**
 * 标准 API 响应格式
 * @template T 数据类型
 */

export type ApiOkResponseBody<T> = Omit<ApiOkResponseDto<T>, never>;
export type ApiBadResponseBody = Omit<ApiBadResponseDto, never>;
