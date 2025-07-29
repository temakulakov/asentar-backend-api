import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Transaction } from '../entities/transaction.entity';
import { TransactionStatus } from '../enums/transaction-status.enum';
import { PaymentPeriod } from '../enums/payment-period.enum';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { User } from '../../users/entities/user.entity';
import { WebhookPaymentDto } from '../dto/webhook-payment.dto';

@Injectable()
export class CloudPaymentsService {
  private readonly apiUrl: string;
  private readonly publicId: string;
  private readonly secretKey: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
    @InjectRepository(Transaction)
    private readonly txRepo: Repository<Transaction>,
  ) {
    this.publicId = this.config.getOrThrow('CLOUDPAYMENTS_PUBLIC_ID');
    this.secretKey = this.config.getOrThrow('CLOUDPAYMENTS_API_SECRET');
    this.apiUrl =
      this.config.get<string>('CLOUDPAYMENTS_API_URL') ||
      'https://api.cloudpayments.ru';
  }

  /**
   * Инициация платежа через CloudPayments
   * @returns URL для редиректа на платежную форму (3DS или всплывающее окно)
   */
  async createInvoice(dto: CreatePaymentDto): Promise<string> {
    const { username, amount, currency, period, cardCryptogramPacket } = dto;

    let resp;
    try {
      resp = await firstValueFrom(
        this.http.post(
          `${this.apiUrl}/payments/cards/charge`,
          {
            publicId: this.publicId,
            amount,
            currency,
            invoiceId: `${username}-${Date.now()}`,
            description: `VPN на ${period}`,
            jsonData: { username, period },
            cardCryptogramPacket, // ← здесь передаём криптограмм‑пакет
          },
          {
            auth: {
              username: this.publicId,
              password: this.secretKey,
            },
          },
        ),
      );
    } catch (err) {
      throw new HttpException(
        'CloudPayments init failed',
        HttpStatus.BAD_GATEWAY,
      );
    }

    // CloudPayments в зависимости от сценария возвращает в модели поле ConfirmationUrl или AcsUrl
    const model = resp.data?.Model || resp.data?.model;
    const url =
      model?.ConfirmationUrl ||
      model?.confirmationUrl ||
      model?.AcsUrl ||
      model?.acsUrl;

    if (typeof url !== 'string') {
      // Логируем для себя «сырые» данные, чтобы понять, что вернулось
      console.debug('CloudPayments response model:', model);
      throw new HttpException(
        'Invalid confirmation URL',
        HttpStatus.BAD_GATEWAY,
      );
    }

    // Сохраняем PENDING‑транзакцию
    const tx = this.txRepo.create({
      user: { username } as any,
      amount,
      currency,
      period,
      metadata: {}, // при желании сюда можно положить дополнительные данные
      status: TransactionStatus.PENDING,
    });
    await this.txRepo.save(tx);

    return url;
  }

  /**
   * Вебхук от CloudPayments (3DS или оплата сразу)
   */
  async handleWebhook(
    dto: WebhookPaymentDto, // вместо payload: any
    signature: string, // string и так типизирован
  ): Promise<void> {
    // TODO: добавить проверку подписи HMAC‑SHA256
    const { Status, JsonData } = dto.Payload;
    const { username, period } = JsonData;

    // Ищем PENDING‑транзакцию
    const tx = await this.txRepo.findOne({
      where: {
        user: { username } as User, // тип User
        period,
        status: TransactionStatus.PENDING,
      },
      relations: ['user'], // если нужно подтянуть связь
    });
    if (!tx) {
      throw new HttpException('Transaction not found', HttpStatus.NOT_FOUND);
    }

    // Обновляем статус
    tx.status =
      Status === TransactionStatus.COMPLETED
        ? TransactionStatus.COMPLETED
        : TransactionStatus.FAILED;
    await this.txRepo.save(tx);

    // TODO: после COMPLETED эмитить событие или вызвать UsersService.extendExpire()
  }
}
