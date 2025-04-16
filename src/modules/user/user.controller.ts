import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@ApiTags('用户')
@Controller('user')
export class UserController {
  constructor(private readonly UserService: UserService) {}

  @Public()
  @ApiOperation({ summary: '登录' })
  @Post('/login')
  login(@Body() userDto: CreateUserDto) {
    return this.UserService.login(userDto);
  }

  @Public()
  @ApiOperation({ summary: '注册' })
  @Post('/register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.UserService.register(createUserDto);
  }

  @ApiOperation({summary:'token测试'})
  @Get('/test')
  test(){
    return 'passed'
  }

  @Public()
  @ApiOperation({ summary: '刷新token' })
  @Post('/token/refresh')
  refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.UserService.refreshToken(refreshTokenDto.refresh_token);
  }
}
