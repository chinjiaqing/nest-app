import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiExtraModels,
  getSchemaPath,
} from '@nestjs/swagger';
import { ApiBadResponseDto, ApiOkResponseDto } from '../dtos/api-response.dto';

export const ApiBaseResponse = <T>(model: Type<T>, isRoot = false) => {
  const extraSchema = isRoot
    ? {
        $ref: getSchemaPath(model),
      }
    : {
        properties: {
          data: {
            $ref: getSchemaPath(model),
          },
        },
      };
  return applyDecorators(
    ApiExtraModels(ApiOkResponseDto, model),
    ApiOkResponse({
      description: '成功响应',
      schema: {
        allOf: [
          {
            $ref: getSchemaPath(ApiOkResponseDto),
          },
          extraSchema,
        ],
      },
      //   type: model ? ApiOkResponseDto<T> : ApiOkResponseDto<T>,
    }),
    ApiBadRequestResponse({
      description: '错误响应',
      type: ApiBadResponseDto,
    }),
  );
};
