import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IPaymentService } from '../interfaces/payment-service.interface';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { Transaction } from '../entities/transaction.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';

interface CloudPaymentsResponse {
  Model?: { Receipt?: { Status: string } };
  Success?: boolean;

  [key: string]: any;
}

@Injectable()
export class CloudPaymentsService implements IPaymentService {
  private readonly apiUrl = 'https://api.cloudpayments.ru';
  private readonly publicId: string;
  private readonly apiSecret: string;
  private readonly logger = new Logger(CloudPaymentsService.name);

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
    @InjectRepository(Transaction)
    private readonly txRepo: Repository<Transaction>,
  ) {
    const pub = this.config.get<string>('CLOUDPAYMENTS_PUBLIC_ID');
    const sec = this.config.get<string>('CLOUDPAYMENTS_API_SECRET');
    if (!pub || !sec) {
      throw new Error('CloudPayments credentials are not set in config');
    }
    this.publicId = pub;
    this.apiSecret = sec;
  }

  async createPayment(dto: CreatePaymentDto): Promise<Transaction> {
    // вызов CloudPayments Init
    const request$ = this.http.post<CloudPaymentsResponse>(
      `${this.apiUrl}/payments/charge`,
      {
        Amount: dto.amount,
        Currency: dto.currency || 'RUB',
        AccountId: dto.userId,
        Description: `Оплата подписки на 1 неделю`,
      },
      {
        auth: { username: this.publicId, password: this.apiSecret },
      },
    );
    const response: AxiosResponse<CloudPaymentsResponse> =
      await firstValueFrom(request$);
    const data = response.data;

    // сохраняем транзакцию
    const status =
      data.Model?.Receipt?.Status ?? (data.Success ? 'Completed' : 'Failed');
    const tx = this.txRepo.create({
      user: { vless: dto.userId } as any,
      amount: dto.amount,
      currency: dto.currency || 'RUB',
      status,
      metadata: data,
    });
    return this.txRepo.save(tx);
  }

  async handleCallback(payload: any): Promise<void> {
    // TODO: verify signature, обновить статус транзакции, продлить подписку
    this.logger.debug('Callback payload received', payload);
  }
}
