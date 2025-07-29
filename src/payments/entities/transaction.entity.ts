// src/payments/entities/transaction.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { PaymentPeriod } from '../enums/payment-period.enum';
import { TransactionStatus } from '../enums/transaction-status.enum';

@Entity({ name: 'transactions' })
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Внешний ключ к таблице users.username */
  @ManyToOne(() => User, (user) => user.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_username', referencedColumnName: 'username' })
  user: User;

  /** Сумма платежа */
  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  /** Валюта (например, 'RUB', 'USD') */
  @Column('varchar', { length: 3 })
  currency: string;

  /** Период подписки, на который оплачено */
  @Column({
    type: 'enum',
    enum: PaymentPeriod,
  })
  period: PaymentPeriod;

  /** Дополнительные данные или метаданные */
  @Column('simple-json', { nullable: true })
  metadata: Record<string, any> | null;

  /** Статус транзакции (Pending, Completed, Failed и т.д.) */
  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
