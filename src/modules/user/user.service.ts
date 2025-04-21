import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcryptjs from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../redis/redis.service';
import { JWT_CONSTANTS } from 'src/common/constants/jwt.constants';
import { JwtUserCheckedPayload } from 'src/common/types';

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
        secret: JWT_CONSTANTS.secret,
        expiresIn: JWT_CONSTANTS.expiresIn,
      },
    );

    const refresh_token = this.jwtService.sign(
      { id: user.id },
      {
        secret: JWT_CONSTANTS.refreshSecret,
        expiresIn: JWT_CONSTANTS.refreshExpiresIn,
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
    return await this.userRepository.save({ username, password });
  }

  async refreshToken(refresh_token: string) {
    const payload = this.jwtService.verify<JwtUserCheckedPayload>(
      refresh_token,
      {
        secret: JWT_CONSTANTS.refreshSecret,
      },
    );
    // 判断refresh_token已经被消费，处于redis黑名单中
    const isRevoked = await this.redisService.exists(
      `blacklist:${refresh_token}`,
    );
    if (isRevoked) throw new UnauthorizedException();
    const { id } = payload;
    const user = await this.userRepository.findOne({ where: { id } });
    if (user) {
      const tokens = this.generateTokens(user);
      await this.redisService.set(
        `blacklist:${refresh_token}`,
        'revoked',
        'EX',
        payload.exp - Math.floor(Date.now() / 1000),
      );
      return tokens;
    } else {
      throw new UnauthorizedException();
    }
  }
}
