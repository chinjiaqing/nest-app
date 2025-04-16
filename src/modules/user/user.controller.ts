import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('用户')
@Controller('user')
export class UserController {
  constructor(private readonly UserService: UserService) {}

  @ApiOperation({summary:'创建文章'})
  @Post('/create')
  create(@Body() createUserDto: CreateUserDto) {
    return this.UserService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.UserService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.UserService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.UserService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.UserService.remove(+id);
  }
}
