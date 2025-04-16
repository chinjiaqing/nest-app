import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcryptjs from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../redis/redis.service';
import { jwtConstants } from 'src/common/constants/jwt.constants';

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
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

  generateTokens(user: User) {
    const access_token = this.jwtService.sign(
      { id: user.id },
      {
        secret: jwtConstants.secret,
        expiresIn: jwtConstants.expiresIn,
      },
    );

    const refresh_token = this.jwtService.sign(
      { id: user.id },
      {
        secret: jwtConstants.refreshSecret,
        expiresIn: jwtConstants.refreshExpiresIn,
      },
    );
    return {
      access_token,
      refresh_token,
    };
  }

  async login(loginData: CreateUserDto) {
    const user = await this.userRepository.findOne({
      where: {
        username: loginData.username,
      },
    });
    if (!user) throw new BadRequestException(`用户不存在`);
    const pass: boolean = bcryptjs.compareSync(
      loginData.password,
      user.password,
    );
    if (!pass) throw new BadRequestException('用户名或密码错误');
    const payload = {
      username: user.username,
      id: user.id,
    };
    const tokens = this.generateTokens(user);
    return {
      ...payload,
      ...tokens,
    };
  }

  async register(createUserDto: CreateUserDto) {
    let { username, password } = createUserDto;
    username = username.trim();
    if (!username) {
      throw new BadRequestException('用户名不能为空');
    }
    if (username.length > 20 || username.length < 6) {
      throw new BadRequestException('用户名应在6-20个字符之间');
    }
    if (!password) {
      throw new BadRequestException('密码不能为空');
    }
    if (password.length < 6 || password.length > 20) {
      throw new BadRequestException('密码应在6-20个字符之间');
    }
    const user = await this.userRepository.findOne({ where: { username } });
    if (user) {
      throw new BadRequestException('用户名已存在');
      // throw new Error('用户名已存在')
      throw new HttpException('用户名已存在', HttpStatus.BAD_REQUEST);
    }
    password = bcryptjs.hashSync(password, 10);
    this.redisService.set(username, password);
    return await this.userRepository.save({ username, password });
  }

  async refreshToken(refresh_token: string) {
    let userId = '';
    try {
      const { id } = this.jwtService.verify(refresh_token,{
        secret: jwtConstants.refreshSecret
      });
      userId = id;
    } catch (err) {
      throw new HttpException(
        '身份已过期，请重新登录[2]',
        HttpStatus.FORBIDDEN,
      );
    }
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user) {
      const tokens = this.generateTokens(user);
      return tokens;
    } else {
      throw new HttpException('身份已过期，请重新登录', HttpStatus.FORBIDDEN);
    }
  }
}
