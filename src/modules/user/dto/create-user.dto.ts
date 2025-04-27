import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: '用户名', example: 'usernmae' })
  @IsNotEmpty({ message: '用户名不能为空' })
  readonly username: string;
  @ApiProperty({ description: '密码', example: 'password' })
  @IsNotEmpty({ message: '密码不能为空' })
  readonly password: string;
}

export class LoginRespDto {
  @ApiProperty({
    description: 'token',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImQzZTVlMGVjLTYwM2UtNGI4Ny04MzU5LWY2YmU1ZDRjYjFkZCIsImlhdCI6MTc0NDg2MDkzOSwiZXhwIjoxNzQ1NDY1NzM5fQ.n_QRXnCx6oX1l5_rX2mvSj23eMykw1Zdp01M-ankHt0',
  })
  token: string;

  @ApiProperty({
    description: 'refresh_token',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImQzZTVlMGVjLTYwM2UtNGI4Ny04MzU5LWY2YmU1ZDRjYjFkZCIsImlhdCI6MTc0NDg2MDkzOSwiZXhwIjoxNzQ1NDY1NzM5fQ.n_QRXnCx6oX1l5_rX2mvSj23eMykw1Zdp01M-ankHt0',
  })
  refresh_token: string;
}
