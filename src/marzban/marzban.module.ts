// marzban/marzban.module.ts
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TokenService } from './auth/token.service';
// import { buildAxios } from './auth/axios-factory';
import { MarzbanService } from './marzban.service';
import { MarzbanController } from './marzban.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HttpModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (cfg: ConfigService) => ({
        baseURL: cfg.get<string>('MARZBAN_BASE_URL'), // ← это HttpModuleOptions
        timeout: 10_000,
        maxRedirects: 5,
      }),
    }),
  ],
  controllers: [MarzbanController],
  providers: [TokenService, MarzbanService],
  exports: [MarzbanService],
})
export class MarzbanModule {}
