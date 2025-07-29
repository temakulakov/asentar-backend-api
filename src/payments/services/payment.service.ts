// src/payments/services/payment.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import {
  PaymentCompletedEvent,
  PaymentFailedEvent,
} from '../events/payment.events';
import { UsersService } from '../../users/users.service';

@Injectable()
export class PaymentService {
  constructor(private readonly users: UsersService) {}

  /** Подписываемся на успешную оплату */
  @OnEvent('payment.completed')
  async handleCompleted(event: PaymentCompletedEvent) {
    Logger.log(
      `Payment completed for ${event.username}, period=${event.period}`,
    );
    // здесь продлеваем срок у пользователя
    await this.users.extendExpire(event.username, event.period as any);
  }

  /** Подписываемся на неудачу */
  @OnEvent('payment.failed')
  handleFailed(event: PaymentFailedEvent) {
    Logger.warn(`Payment failed for ${event.username}: ${event.reason}`);
  }
}
