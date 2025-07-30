import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [UsersService, ConfigService],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
