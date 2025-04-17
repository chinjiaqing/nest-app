import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('user')
export class User extends BaseEntity {
  @Column({ length: 50, comment: '用户名' })
  username: string;

  @Column({ length: 200, comment: '密码' })
  password: string;
}
