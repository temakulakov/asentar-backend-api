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
  @Column('uuid')
  vless: string;

  @PrimaryColumn('uuid', { unique: true })
  username: string;

  /** --- Telegram User --- **/

  @Column('bigint')
  telegramId: number;

  @Column('datetime')
  expireDate: Date;

  @Column('simple-json')
  links: string[];

  // ← Here we explicitly tell TypeORM “this is a VARCHAR”
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

  @OneToMany(() => Transaction, (tx) => tx.user)
  transactions: Transaction[];
}
