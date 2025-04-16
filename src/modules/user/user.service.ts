import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcryptjs from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

export interface UserRo {
  list: User[];
  count: number;
  totalPages: number;
  currentPage: number;
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly JwtService: JwtService,
  ) {}

  async login(loginData: CreateUserDto) {
    const user = await this.userRepository.findOne({
      where: {
        username: loginData.username,
      },
    });
    if (!user) return new BadRequestException(`用户不存在`);
    const pass: boolean = bcryptjs.compareSync(
      loginData.password,
      user.password,
    );
    if (!pass) return new BadRequestException('用户名或密码错误');
    const payload = {
      username: user.username,
      id: user.id,
    };
    return {
      ...payload,
      access_token: this.JwtService.sign({ id: payload.id }),
    };
  }

  async register(createUserDto: CreateUserDto) {
    let { username, password } = createUserDto;
    username = username.trim();
    if (!username) {
      return new BadRequestException('用户名不能为空');
    }
    if (username.length > 20 || username.length < 6) {
      return new BadRequestException('用户名应在6-20个字符之间');
    }
    if (!password) {
      return new BadRequestException('密码不能为空');
    }
    if (password.length < 6 || password.length > 20) {
      return new BadRequestException('密码应在6-20个字符之间');
    }
    const user = await this.userRepository.findOne({ where: { username } });
    if (user) {
      return new BadRequestException('用户名已存在');
    }
    password = bcryptjs.hashSync(password, 10);
    return await this.userRepository.save({ username, password });
  }

  async findAll(page: number = 1, pageSize: number = 10): Promise<UserRo> {
    const [users, totalCount] = await this.userRepository.findAndCount({
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { created_at: 'DESC' },
    });
    return {
      list: users,
      count: totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: page,
    };
  }

  async findOne(id: string) {
    return await this.userRepository.findOne({ where: { id } });
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
