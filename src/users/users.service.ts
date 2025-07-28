import { Injectable, NotFoundException } from '@nestjs/common';

import { Repository } from 'typeorm';
import { MarzbanService } from '../marzban/marzban.service';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FixedInboundsDto } from '../marzban/dto/integration/user-create.integration.req.dto';

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
      expire: dto.expire,
      data_limit: dto.data_limit,
      data_limit_reset_strategy: dto.data_limit_reset_strategy,
      status: dto.status,
      note: dto.note,
      on_hold_timeout: dto.on_hold_timeout,
      on_hold_expire_duration: dto.on_hold_expire_duration,
    });

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

  async findOne(vless: string): Promise<User> {
    const u = await this.repo.findOne({ where: { vless } });
    if (!u) throw new NotFoundException(`User ${vless} not found`);
    return u;
  }

  async update(vless: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(vless);

    // optionally sync back to Marzban:
    const needsMarzban: Partial<UpdateUserDto> = {};
    for (const k of [
      'expire',
      'data_limit',
      'data_limit_reset_strategy',
      'status',
      'on_hold_timeout',
      'on_hold_expire_duration',
    ] as const) {
      if (dto[k] !== undefined) (needsMarzban as any)[k] = dto[k];
    }
    if (Object.keys(needsMarzban).length) {
      await this.marzban.update(user.username, needsMarzban as any);
    }

    // merge local changes
    Object.assign(user, dto);
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
