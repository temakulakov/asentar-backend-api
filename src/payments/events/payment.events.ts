// src/payments/events/payment.events.ts
import { PaymentPeriod } from '../enums/payment-period.enum';

export class PaymentCompletedEvent {
  constructor(
    public readonly username: string,
    public readonly period: PaymentPeriod,
  ) {}
}

export class PaymentFailedEvent {
  constructor(
    public readonly username: string,
    public readonly reason: string,
  ) {}
}
