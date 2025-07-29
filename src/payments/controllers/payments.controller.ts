// src/payments/controllers/payments.controller.ts
import {
  Controller,
  Post,
  Param,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CloudPaymentsService } from '../services/cloud-payments.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { WebhookPaymentDto } from '../dto/webhook-payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly cloud: CloudPaymentsService) {}

  @Post(':provider/create')
  async create(
    @Param('provider') provider: string,
    @Body() dto: CreatePaymentDto,
  ) {
    // пока единственный провайдер — CloudPaymentsService
    return {
      url: await this.cloud.createInvoice(dto),
    };
  }

  @Post(':provider/webhook')
  @HttpCode(HttpStatus.OK)
  async webhook(
    @Param('provider') provider: string,
    @Body() payload: WebhookPaymentDto,
    @Headers('x-signature') signature: string,
  ) {
    await this.cloud.handleWebhook(payload, signature);
    return 'OK';
  }
}
