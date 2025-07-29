import { IsString, IsInt, IsEnum } from 'class-validator';
import { PaymentPeriod } from '../enums/payment-period.enum';

export class CreatePaymentDto {
  /** Username в вашей системе */
  @IsString()
  username: string;

  /** Сумма платежа */
  @IsInt()
  amount: number;

  /** Валюта, например "RUB" */
  @IsString()
  currency: string;

  /** Период продления (day, week, month, quarter, semiannual, annual) */
  @IsEnum(PaymentPeriod)
  period: PaymentPeriod;

  /** 🔐 Обязательная зашифрованная криптограмма карты */
  @IsString()
  cardCryptogramPacket: string;
}
