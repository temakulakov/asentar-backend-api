import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { IPaymentService } from '../interfaces/payment-service.interface';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Transaction } from '../entities/transaction.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PaymentService {
  constructor(
    @Inject('PAYMENT_SERVICE')
    private readonly paymentClient: IPaymentService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Transaction)
    private readonly txRepo: Repository<Transaction>,
  ) {}

  async pay(dto: CreatePaymentDto): Promise<Transaction> {
    const user = await this.userRepo.findOneBy({ vless: dto.userId });
    if (!user) throw new BadRequestException('User not found');

    const tx = await this.paymentClient.createPayment(dto);

    // продление подписки после успешной оплаты
    if (tx.status === 'Completed') {
      user.expireDate = new Date(
        user.expireDate.getTime() + 7 * 24 * 3600 * 1000,
      );
      await this.userRepo.save(user);
    }
    return tx;
  }

  async callback(payload: any): Promise<void> {
    await this.paymentClient.handleCallback(payload);
  }
}
