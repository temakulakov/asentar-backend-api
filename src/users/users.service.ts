import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { add } from 'date-fns';
import { Repository } from 'typeorm';
import { MarzbanService } from '../marzban/marzban.service';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FixedInboundsDto } from '../marzban/dto/integration/user-create.integration.req.dto';
import { ModifyUserIntegrationReqDto } from '../marzban/dto/integration/user-modify.integration.req.dto';
import { BaseUserDto } from '../marzban/dto/base/user-base.dto';
import { PaymentPeriod } from '../payments/enums/payment-period.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
    private readonly marzban: MarzbanService,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    // 1) create on Marzban
    const integ = await this.marzban.create({
      proxies: { vless: { flow: '' } },
      inbounds: new FixedInboundsDto(),

      username: dto.username,
      expire: dto.expire
        ? dto.expire
        : Math.floor((Date.now() + 24 * 60 * 60 * 1000) / 1000),
      data_limit: dto.data_limit,
      data_limit_reset_strategy: dto.data_limit_reset_strategy,
      status: dto.status,
      note: dto.note,
      on_hold_timeout: dto.on_hold_timeout,
      on_hold_expire_duration: dto.on_hold_expire_duration,
    });

    Logger.debug(integ);

    // 2) map to local entity
    const user = this.repo.create({
      vless: integ.proxies.vless.id,
      username: integ.username,
      telegramId: dto.telegramId,
      expireDate: integ.expire ? new Date(integ.expire * 1000) : new Date(),
      links: integ.links,
      subscriptionUrl: integ.subscription_url,
      status: integ.status,
    });

    // 3) save locally
    return this.repo.save(user);
  }

  findAll(): Promise<User[]> {
    return this.repo.find();
  }

  async findOne(username: string): Promise<User> {
    const u = await this.repo.findOne({ where: { username } });
    if (!u) throw new NotFoundException(`User ${username} not found`);
    return u;
  }

  async extendExpire(username: string, period: PaymentPeriod): Promise<void> {
    const user = await this.repo.findOne({ where: { username } });
    if (!user) throw new NotFoundException(`User ${username} not found`);

    // вычисляем новую дату
    const now = user.expireDate > new Date() ? user.expireDate : new Date();
    const next = (() => {
      switch (period) {
        case PaymentPeriod.DAY:
          return add(now, { days: 1 });
        case PaymentPeriod.WEEK:
          return add(now, { weeks: 1 });
        case PaymentPeriod.MONTH:
          return add(now, { months: 1 });
        case PaymentPeriod.QUARTER:
          return add(now, { months: 3 });
        case PaymentPeriod.SEMIANNUAL:
          return add(now, { months: 6 });
        case PaymentPeriod.ANNUAL:
          return add(now, { years: 1 });
        default:
          return now;
      }
    })();

    // синхронизируем с Marzban
    await this.marzban.update(username, {
      expire: Math.floor(next.getTime() / 1000),
    });

    // сохраняем локально
    user.expireDate = next;
    await this.repo.save(user);
  }

  async update(username: string, dto: UpdateUserDto): Promise<User> {
    // 1) Найти локального пользователя
    const user = await this.repo.findOne({ where: { username } });
    if (!user) {
      throw new NotFoundException(`User ${username} not found`);
    }

    // 2) Подготовить payload для Marzban (только согласованные поля)
    type SyncKey = keyof ModifyUserIntegrationReqDto;
    const syncKeys: SyncKey[] = [
      'expire',
      'data_limit',
      'data_limit_reset_strategy',
      'status',
      'on_hold_timeout',
      'on_hold_expire_duration',
    ];
    const marzbanPayload: ModifyUserIntegrationReqDto = {};
    for (const key of syncKeys) {
      const val = (dto as any)[key];
      if (val !== undefined) {
        marzbanPayload[key] = val;
      }
    }

    let updatedRemote: BaseUserDto | null = null;
    if (Object.keys(marzbanPayload).length > 0) {
      try {
        updatedRemote = await this.marzban.update(username, marzbanPayload);
        Logger.debug(`Marzban update succeeded for ${username}`);
      } catch (error) {
        Logger.error(
          `Marzban service error for ${username}`,
          error.stack || error.message,
        );
        // Если это внешняя ошибка (HTTP 4xx/5xx) – пробросим её
        if (error instanceof HttpException) {
          throw error;
        }
        // Иначе – сеть/таймаут => 500 Internal Server Error
        throw new HttpException(
          'Marzban API unreachable',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }

    // 3) Синхронизировать поля из ответа Marzban
    if (updatedRemote) {
      if (typeof updatedRemote.expire === 'number') {
        user.expireDate = new Date(updatedRemote.expire * 1000);
      }
      if (updatedRemote.status) {
        user.status = updatedRemote.status;
      }
    }

    // 4) Обновить локальные поля из DTO
    if (dto.telegramId !== undefined) {
      user.telegramId = dto.telegramId;
    }

    // 5) Сохранить изменения
    return this.repo.save(user);
  }

  async remove(vless: string): Promise<void> {
    const user = await this.findOne(vless);
    // first delete on Marzban
    await this.marzban.removeUser(user.username);
    // then delete locally
    await this.repo.delete({ vless });
  }
}
