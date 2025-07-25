import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MarzbanModule } from './marzban/marzban.module';
import {ConfigModule} from "@nestjs/config";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env', // или массив для среды: ['.env.local','.env']
    }),
    MarzbanModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
