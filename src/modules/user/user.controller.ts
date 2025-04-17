import { Controller, Get, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PublicApi } from 'src/common/decorators/public-api.decorator';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@ApiTags('用户')
@Controller('user')
export class UserController {
  constructor(private readonly UserService: UserService) {}

  @PublicApi()
  @ApiOperation({ summary: '登录' })
  @Post('/login')
  login(@Body() userDto: CreateUserDto) {
    return this.UserService.login(userDto);
  }

  @PublicApi()
  @ApiOperation({ summary: '注册' })
  @Post('/register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.UserService.register(createUserDto);
  }

  @ApiOperation({ summary: 'token测试' })
  @Get('/test')
  test() {
    return 'passed';
  }

  @PublicApi()
  @ApiOperation({ summary: '刷新token' })
  @Post('/refresh')
  refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.UserService.refreshToken(refreshTokenDto.refresh_token);
  }
}
