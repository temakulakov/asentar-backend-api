// src/users/entities/user.entity.ts
import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { UserStatus } from '../../marzban/dto/base/user-base.dto';
import { Transaction } from '../../payments/entities/transaction.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryColumn('uuid')
  username: string;

  @Column('uuid')
  vless: string;

  @Column('bigint', { unique: true })
  telegramId: number;

  @Column('datetime')
  expireDate: Date;

  @Column('simple-json')
  links: string[];

  @Column('varchar', { length: 512, nullable: true })
  subscriptionUrl: string | null;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  /** Связь «один пользователь — много транзакций» */
  @OneToMany(() => Transaction, (tx) => tx.user)
  transactions: Transaction[];

  /** Новое поле — роли пользователя (пару примеров: 'admin','user') */
  @Column('simple-array', { nullable: true })
  roles: string[];
}
