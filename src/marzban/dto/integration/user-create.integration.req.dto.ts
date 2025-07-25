import {
  IsString,
  IsOptional,
  IsInt,
  IsEnum,
  IsISO8601,
  IsDefined,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  DataLimitResetStrategy,
  InboundsDto,
  UserStatus,
  VlessProxyDto,
} from '../base/user-base.dto';

export class CreateProxiesDto {
  @ValidateNested()
  @Type(() => VlessProxyDto)
  vless: Pick<VlessProxyDto, 'flow'>; // Только поле `flow`, `id` не нужен на создание
}

export class FixedInboundsDto extends InboundsDto {
  constructor() {
    super();
    this.vless = ['VLESS TCP REALITY'];
  }
}

export class CreateUserIntegrationReqDto {
  @IsString()
  username: string;

  @ValidateNested()
  @Type(() => CreateProxiesDto)
  proxies: CreateProxiesDto;

  @ValidateNested()
  @Type(() => FixedInboundsDto)
  inbounds: FixedInboundsDto = new FixedInboundsDto();

  @IsOptional()
  @IsInt()
  expire?: number;

  @IsOptional()
  @IsInt()
  data_limit?: number;

  @IsOptional()
  @IsEnum(DataLimitResetStrategy)
  data_limit_reset_strategy?: DataLimitResetStrategy;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsISO8601()
  on_hold_timeout?: string;

  @IsOptional()
  @IsInt()
  on_hold_expire_duration?: number;
}
