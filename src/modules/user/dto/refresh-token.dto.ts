import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ description: 'refresh token' })
  @IsNotEmpty({ message: 'refresh token 不能为空' })
  readonly refresh_token: string;
}
