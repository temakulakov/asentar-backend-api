// marzban/auth/token.service.ts
import {
  Injectable,
  HttpException,
  HttpStatus,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { AxiosHeaders, AxiosRequestConfig, isAxiosError } from 'axios';

// ——— Ответ энд‑пойнта /api/admin/token ———
interface TokenDto {
  access_token: string;
  token_type: 'bearer';
}

@Injectable()
export class TokenService implements OnModuleInit {
  private token?: string; // ← актуальный токен
  private refreshing?: Promise<string>; // ← «в полёте» refresh

  constructor(
    private readonly http: HttpService,
    private readonly cfg: ConfigService,
  ) {}

  /** Подключаем интерцепторы *к общему* http.axiosRef */
  onModuleInit() {
    // ---------- Request ----------
    this.http.axiosRef.interceptors.request.use(async (config) => {
      if (!config.skipAuth && this.token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    // ---------- Response ----------
    this.http.axiosRef.interceptors.response.use(
      (r) => r,
      async (err) => {
        const { response, config } = err;

        if (response?.status === 401 && !config.__isRetry) {
          config.__isRetry = true;

          // ① сохраняем data, если его ещё нет
          (config as any)._savedData ??= config.data;

          // ...обновляем токен...
          await this.refreshTokenSafe();
          config.headers = {
            ...(config.headers ?? {}),
            Authorization: `Bearer ${this.token}`,
          };

          // ② восстанавливаем тело ЗАНОВО
          config.data = (config as any)._savedData;
          return this.http.axiosRef.request(config);
        }
        return Promise.reject(err);
      },
    );
  }

  private readonly log = new Logger(TokenService.name);

  private async fetchToken(): Promise<string> {
    /* ── 1. Формируем URL‑encoded body ─────────────────────────── */
    const body = new URLSearchParams({
      username: this.cfg.getOrThrow<string>('MARZBAN_ADMIN_USERNAME'),
      password: this.cfg.getOrThrow<string>('MARZBAN_ADMIN_PASSWORD'),
      grant_type: 'password', // надёжнее указать
    }).toString();

    /* ── 2. Шлём запрос *с флагом skipAuth* ─────────────────────── */
    try {
      const { data } = await lastValueFrom(
        this.http.post<TokenDto>('/admin/token', body, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          skipAuth: true, // <‑‑‑ главное
          timeout: 10_000,
        }),
      );

      this.log.debug(`Token received (${data.access_token.slice(0, 10)}… )`);
      this.token = data.access_token;
      return this.token;
    } catch (e) {
      /* ── 3. Подробно логируем AxiosError ──────────────────────── */
      if (isAxiosError(e)) {
        const { status, data } = e.response ?? {};
        this.log.error(
          `Auth failed: ${status ?? '???'}  ${JSON.stringify(data)}`,
          e.stack,
        );
      } else {
        this.log.error(`Unexpected auth error: ${e}`, (e as Error).stack);
      }
      /* ── 4. Прокидываем наружу понятное исключение ────────────── */
      throw new HttpException(
        'Cannot obtain Marzban token',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  /** Обёртка, чтобы несколько 401 не делали N запросов */
  private async refreshTokenSafe(): Promise<string> {
    if (!this.refreshing) {
      this.refreshing = this.fetchToken().finally(() => {
        this.refreshing = undefined; // обнулить после выполнения/ошибки
      });
    }

    return this.refreshing;
  }
}
