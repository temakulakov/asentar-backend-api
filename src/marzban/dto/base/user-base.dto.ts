// user-response.dto.ts

import {
  IsString,
  IsOptional,
  IsInt,
  IsEnum,
  IsISO8601,
  IsArray,
  IsBoolean,
  ValidateNested,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

export class VlessProxyDto {
  @IsUUID()
  id: string;

  @IsString()
  @IsOptional()
  flow: string;
}

export class ProxiesDto {
  @ValidateNested()
  @Type(() => VlessProxyDto)
  vless: VlessProxyDto;

  // можно добавить vmess и другие протоколы по аналогии
}

export class InboundsDto {
  [key: string]: string[];
}

export class ExcludedInboundsDto {
  [key: string]: string[];
}

export enum DataLimitResetStrategy {
  NO_RESET = 'no_reset',
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}

export enum UserStatus {
  ACTIVE = 'active',
  DISABLED = 'disabled',
  LIMITED = 'limited',
  EXPIRED = 'expired',
  ON_HOLD = 'on_hold',
}

export class AdminDto {
  @IsString()
  username: string;

  @IsBoolean()
  is_sudo: boolean;

  @IsInt()
  telegram_id: number;

  @IsOptional()
  @IsString()
  discord_webhook: string | null;

  @IsInt()
  users_usage: number;
}

export class BaseUserDto {
  @ValidateNested()
  @Type(() => ProxiesDto)
  proxies: ProxiesDto;

  @IsOptional()
  @IsInt()
  expire: number | null;

  @IsInt()
  data_limit: number;

  @IsEnum(DataLimitResetStrategy)
  data_limit_reset_strategy: DataLimitResetStrategy;

  @ValidateNested()
  @Type(() => InboundsDto)
  inbounds: InboundsDto;

  @IsOptional()
  @IsString()
  note: string | null;

  @IsOptional()
  @IsISO8601()
  sub_updated_at: string | null;

  @IsOptional()
  @IsString()
  sub_last_user_agent: string | null;

  @IsOptional()
  @IsISO8601()
  online_at: string | null;

  @IsOptional()
  @IsInt()
  on_hold_expire_duration: number | null;

  @IsOptional()
  @IsISO8601()
  on_hold_timeout: string | null;

  @IsOptional()
  @IsInt()
  auto_delete_in_days: number | null;

  @IsOptional()
  @IsString()
  next_plan: string | null;

  @IsString()
  username: string;

  @IsEnum(UserStatus)
  status: UserStatus;

  @IsInt()
  used_traffic: number;

  @IsInt()
  lifetime_used_traffic: number;

  @IsISO8601()
  created_at: string;

  @IsArray()
  @IsString({ each: true })
  links: string[];

  @IsOptional()
  @IsString()
  subscription_url: string | null;

  @ValidateNested()
  @Type(() => ExcludedInboundsDto)
  excluded_inbounds: ExcludedInboundsDto;

  @ValidateNested()
  @Type(() => AdminDto)
  admin: AdminDto;
}
