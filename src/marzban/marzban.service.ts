import { lastValueFrom, Observable } from 'rxjs';

import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { AxiosResponse, isAxiosError } from 'axios';

import { CreateUserIntegrationReqDto } from './dto/integration/user-create.integration.req.dto';
import { CreateUserIntegrationResDto } from './dto/integration/user-create.integration.res.dto';
import { MarzbanErrorDto } from './dto/integration/user.errors.integration.res';
import { BaseUserDto } from './dto/base/user-base.dto';
import { UsersListQueryDto } from './dto/integration/users-list.integration.req.dto';
import { UsersListDto } from './dto/integration/users-list.integration.res.dto';
import { ModifyUserIntegrationReqDto } from './dto/integration/user-modify.integration.req.dto';
import { GetExpiredUsersQueryDto } from './dto/integration/get-expired-users.integration.req.dto';
import { UserUsageResDto } from './dto/integration/user-usage.integration.res.dto';
import {
  DeleteExpiredUsersQueryDto,
  DeleteExpiredUsersResDto,
} from './dto/integration/delete‑expired‑users.integration.req.dto';
import { RemoveUserResDto } from './dto/integration/remove‑user.integration.res.dto';
import { RevokeUserSubscriptionResDto } from './dto/integration/revoke‑subscription.integration.res.dto';

@Injectable()
export class MarzbanService {
  private base: string;

  constructor(
    private readonly http: HttpService,
    private readonly cfg: ConfigService,
  ) {
    this.base = this.cfg.getOrThrow('MARZBAN_BASE_URL');
  }

  /** Универсальный helper → всегда возвращает data либо кидает HttpException */
  private async call<TResp, TReq = unknown>(
    fn: () => Observable<AxiosResponse<TResp, TReq>>,
  ): Promise<TResp> {
    try {
      return (await lastValueFrom(fn())).data;
    } catch (err) {
      // «Чужая» ошибка Axios
      if (isAxiosError(err) && err.response) {
        const { status, data } = err.response;
        // 401 оставляем Interceptor’у
        if (status === HttpStatus.UNAUTHORIZED) throw err;
        // Отражаем ошибку наверх тем же телом/статусом
        throw new HttpException(
          data as MarzbanErrorDto, // наш DTO
          status as HttpStatus,
        );
      }
      throw err; // network/timeout и прочие
    }
  }

  /* --- Create user --- */
  async create(
    dto: CreateUserIntegrationReqDto,
  ): Promise<CreateUserIntegrationResDto> {
    const body: CreateUserIntegrationReqDto = {
      username: dto.username,
      proxies: {
        vless: {
          flow: '',
        },
      },
      inbounds: { vless: ['VLESS TCP REALITY'] },
      expire: dto.expire,
      data_limit: dto.data_limit,
      data_limit_reset_strategy: dto.data_limit_reset_strategy,
      status: dto.status,
      note: dto.note,
      on_hold_timeout: dto.on_hold_timeout,
      on_hold_expire_duration: dto.on_hold_expire_duration,
    };

    return this.call(() =>
      this.http.post<CreateUserIntegrationResDto, CreateUserIntegrationReqDto>(
        `${this.base}/user`,
        body,
      ),
    );
  }

  async findOne(username: string): Promise<BaseUserDto> {
    return this.call(() =>
      this.http.get<BaseUserDto>(
        `${this.base}/user/${encodeURIComponent(username)}`,
      ),
    );
  }

  async findAll(query: UsersListQueryDto): Promise<UsersListDto> {
    return this.call(() =>
      this.http.get<UsersListDto>(`${this.base}/users`, { params: query }),
    );
  }

  async update(
    username: string,
    dto: ModifyUserIntegrationReqDto,
  ): Promise<BaseUserDto> {
    return this.call(() =>
      this.http.put<BaseUserDto, ModifyUserIntegrationReqDto>(
        `${this.base}/user/${encodeURIComponent(username)}`,
        dto,
      ),
    );
  }

  async getExpiredUsers(query: GetExpiredUsersQueryDto): Promise<string[]> {
    return this.call(() =>
      this.http.get<string[]>(`${this.base}/users/expired`, { params: query }),
    );
  }

  async getUserUsage(
    username: string,
    params?: { start?: string; end?: string },
  ): Promise<UserUsageResDto> {
    return this.call(() =>
      this.http.get<UserUsageResDto>(`${this.base}/user/${username}/usage`, {
        params,
      }),
    );
  }

  /* --- Revoke current subscription for a user --- */
  revokeSubscription(username: string): Promise<RevokeUserSubscriptionResDto> {
    return this.call(() =>
      this.http.post<RevokeUserSubscriptionResDto>(
        `${this.base}/user/${username}/revoke_sub`, // POST /api/user/{username}/revoke_sub
      ),
    );
  }

  /* --- Remove a single user --- */
  removeUser(username: string): Promise<RemoveUserResDto> {
    return this.call(() =>
      this.http.delete<RemoveUserResDto>( // DELETE /api/user/{username}
        `${this.base}/user/${username}`,
      ),
    );
  }

  /* --- Delete ALL (or a range of) expired users --- */
  deleteExpiredUsers(
    query: DeleteExpiredUsersQueryDto = {},
  ): Promise<DeleteExpiredUsersResDto> {
    return this.call(() =>
      this.http.delete<DeleteExpiredUsersResDto>(
        `${this.base}/users/expired`, // DELETE /api/users/expired
        { params: query },
      ),
    );
  }
}
