import { Controller, Post, Body } from '@nestjs/common';
import { PaymentService } from './services/payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  initiate(@Body() dto: CreatePaymentDto) {
    return this.paymentService.pay(dto);
  }

  @Post('callback')
  callback(@Body() payload: any) {
    return this.paymentService.callback(payload);
  }
}
