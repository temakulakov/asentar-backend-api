// src/payments/payments.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { Transaction } from './entities/transaction.entity';
import { CloudPaymentsService } from './services/cloud-payments.service';
import { PaymentService } from './services/payment.service';
import { PaymentsController } from './controllers/payments.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    ConfigModule,
    HttpModule,
    TypeOrmModule.forFeature([Transaction]),
    EventEmitterModule, // чтобы провайдеры могли получать emitter
    UsersModule,
  ],
  providers: [CloudPaymentsService, PaymentService],
  controllers: [PaymentsController],
  exports: [PaymentService],
})
export class PaymentsModule {}
