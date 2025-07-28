import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

import { MarzbanModule } from '../marzban/marzban.module';
import { User } from './entities/user.entity';

// import { PaymentsModule } from '../payments/payments.module'; // placeholder

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    MarzbanModule,
    // PaymentsModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
