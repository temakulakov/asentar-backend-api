import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Transaction } from './entities/transaction.entity';
import { User } from '../users/entities/user.entity';
import { CloudPaymentsService } from './services/cloud-payments.service';
import { PaymentService } from './services/payment.service';
import { PaymentsController } from './payments.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ConfigModule,
    HttpModule,
    TypeOrmModule.forFeature([Transaction, User]),
  ],
  controllers: [PaymentsController],
  providers: [
    PaymentService,
    {
      provide: 'PAYMENT_SERVICE',
      useClass: CloudPaymentsService,
    },
    CloudPaymentsService,
  ],
  exports: [PaymentService],
})
export class PaymentsModule {}
