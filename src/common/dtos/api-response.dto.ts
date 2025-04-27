import { ApiProperty } from '@nestjs/swagger';
import { API_CODE_CONSTANTS } from '../constants/api.constants';

export class BaseResponseDto<T = any> {
  @ApiProperty({
    example: API_CODE_CONSTANTS.SUCCESS,
    description: '-1失败，200成功',
  })
  code: number = API_CODE_CONSTANTS.SUCCESS;

  @ApiProperty({ description: '业务数据' })
  data: T;

  @ApiProperty({ example: 'success', description: '消息提示' })
  msg: string;

  @ApiProperty({
    example: '02af33e1-6170-421e-a430-f3c5ccdd4f46',
    description: '请求唯一ID',
  })
  request_id: string;

  @ApiProperty({ example: 1745391526742, description: '时间戳' })
  timestamp: number;

  @ApiProperty({ example: 15, description: '响应耗时(ms)' })
  response_time: number;
}

export class ApiOkResponseDto<T = any> extends BaseResponseDto<T> {
  @ApiProperty({ example: 0, description: '-1失败，0成功' })
  code: number = API_CODE_CONSTANTS.SUCCESS;
}

export class ApiBadResponseDto extends BaseResponseDto {
  @ApiProperty({
    example: API_CODE_CONSTANTS.FAILED,
    description: '-1失败，0成功',
  })
  code: number = API_CODE_CONSTANTS.FAILED;

  @ApiProperty({ example: 'error message', description: '错误信息' })
  msg: string = 'error message';

  @ApiProperty({ example: null, description: '业务数据' })
  data: any = null;
}
