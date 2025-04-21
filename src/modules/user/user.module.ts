import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { JWT_CONSTANTS } from 'src/common/constants/jwt.constants';
import JwtAuthStrategy from 'src/common/strategies/jwt-auth.strategy';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret: JWT_CONSTANTS.secret,
      signOptions: {
        expiresIn: JWT_CONSTANTS.expiresIn,
      },
    }),
    RedisModule,
  ],
  controllers: [UserController],
  providers: [UserService, JwtAuthStrategy],
})
export class UserModule {}
