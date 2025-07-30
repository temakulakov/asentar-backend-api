// src/auth/auth.service.ts
import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { parse, isValid } from '@telegram-apps/init-data-node';
import * as jwt from 'jsonwebtoken';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import { CookieOptions } from 'express';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly config: ConfigService,
  ) {}

  /**
   * 1) Проверяет и парсит initData,
   * 2) Находит пользователя,
   * 3) Генерирует JWT,
   * 4) Возвращает user + токены.
   */
  async signin(initData: string): Promise<{
    user: User;
    accessToken: string;
    refreshToken: string;
  }> {
    // 0) Убедимся, что токен бота есть в конфиге
    const botToken = this.config.get<string>('TG_BOT_TOKEN');
    if (!botToken) {
      throw new InternalServerErrorException(
        'TG_BOT_TOKEN не настроен в переменных окружения',
      );
    }

    // 1) Валидируем подпись данных
    if (!isValid(initData, botToken)) {
      throw new BadRequestException('AUTH__INVALID_INITDATA');
    }

    // 2) Парсим initData
    const parsed = parse(initData);
    const tgId = parsed.user?.id;
    if (!tgId) {
      throw new BadRequestException('AUTH__INVALID_INITDATA');
    }

    // 3) Ищем пользователя по Telegram ID
    const user = await this.users.findOneByTg(tgId);
    if (!user) {
      throw new BadRequestException('AUTH__USER_NOT_FOUND');
    }

    // 4) Формируем payload и генерируем токены
    const payload = {
      username: user.username,
      telegramId: user.telegramId,
      roles: user.roles,
    };
    const accessToken = jwt.sign(
      payload,
      this.config.get<string>('JWT_AT_SECRET')!,
      { expiresIn: '5m' },
    );
    const refreshToken = jwt.sign(
      payload,
      this.config.get<string>('JWT_RT_SECRET')!,
      { expiresIn: '7d' },
    );

    return { user, accessToken, refreshToken };
  }

  /**
   * Общие опции для установки cookies
   */
  getCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: true,
      path: '/',
      sameSite: 'strict',
    };
  }
}
