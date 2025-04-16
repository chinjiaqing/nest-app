import { HttpException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

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
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    let { username, password } = createUserDto;
    username = username.trim();
    if (!username) {
      throw new HttpException('用户名不能为空', 401);
    }
    if (username.length > 20 || username.length < 6) {
      throw new HttpException('用户名应在6-20个字符之间', 401);
    }
    if (!password) {
      throw new HttpException('密码不能为空', 401);
    }
    if (password.length < 6 || password.length > 20) {
      throw new HttpException('密码应在6-20个字符之间', 401);
    }
    const user = await this.usersRepository.findOne({ where: { username } });
    if (user) {
      throw new HttpException('用户名已存在', 401);
    }
    return await this.usersRepository.save({ username, password });
  }

  async findAll(page: number = 1, pageSize: number = 10): Promise<UserRo> {
    const [users, totalCount] = await this.usersRepository.findAndCount({
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
    return await this.usersRepository.findOne({ where: { id } });
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
