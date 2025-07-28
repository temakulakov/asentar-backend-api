import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'transactions' })
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.transactions)
  user: User;

  @Column('int')
  amount: number; // сумма в копейках или рублях

  @Column('varchar', { length: 50 })
  currency: string;

  @Column('varchar', { length: 100 })
  status: string;

  @Column('simple-json', { nullable: true })
  metadata: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
