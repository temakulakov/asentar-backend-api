// src/payments/dto/webhook-payment.dto.ts
import { IsString, IsEnum, IsInt, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionStatus } from '../enums/transaction-status.enum';
import { PaymentPeriod } from '../enums/payment-period.enum';

export class JsonDataDto {
  @IsString()
  username: string;

  @IsEnum(PaymentPeriod)
  period: PaymentPeriod;
}

export class CloudPaymentsPayloadDto {
  @IsString()
  InvoiceId: string;

  @IsEnum(TransactionStatus)
  Status: TransactionStatus;

  @IsInt()
  Amount: number;

  @IsString()
  Currency: string;

  @ValidateNested()
  @Type(() => JsonDataDto)
  JsonData: JsonDataDto;
}

export class WebhookPaymentDto {
  @ValidateNested()
  @Type(() => CloudPaymentsPayloadDto)
  Payload: CloudPaymentsPayloadDto;
}
