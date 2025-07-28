import { CreatePaymentDto } from '../dto/create-payment.dto';
import { Transaction } from '../entities/transaction.entity';

export interface IPaymentService {
  createPayment(dto: CreatePaymentDto): Promise<Transaction>;

  handleCallback(payload: any): Promise<void>;
}
