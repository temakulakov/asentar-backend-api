// src/marzban/dto/integration/user-modify.integration.req.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';

/** Возможные стратегии «обнуления» лимита */
export enum DataLimitReset {
  NO_RESET = 'no_reset',
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}

/** Возможные статусы пользователя */
export enum UserStatus {
  ACTIVE = 'active',
  DISABLED = 'disabled',
  ON_HOLD = 'on_hold',
}

/** PATCH/PUT‑тело запроса к /api/user/{username} */
export class ModifyUserIntegrationReqDto {
  @ApiPropertyOptional({
    type: Object,
    description: 'proxy‑настройки (protocol ➜ settings)',
  })
  proxies?: Record<string, Record<string, unknown>>;

  @ApiPropertyOptional({
    type: Object,
    description: 'привязка inbound‑тегов (protocol ➜ tags[])',
  })
  inbounds?: Record<string, string[]>;

  @ApiPropertyOptional({
    example: 0,
    description: 'UNIX‑время окончания, 0 — без ограничения, null — не менять',
  })
  expire?: number | null;

  @ApiPropertyOptional({
    example: 0,
    description: 'лимит в МБ, 0 — без ограничения, null — не менять',
  })
  data_limit?: number | null;

  @ApiPropertyOptional({ enum: DataLimitReset })
  data_limit_reset_strategy?: DataLimitReset;

  @ApiPropertyOptional({ enum: UserStatus })
  status?: UserStatus;

  @ApiPropertyOptional({ nullable: true })
  note?: string | null;

  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true })
  on_hold_timeout?: string | null;

  @ApiPropertyOptional({ nullable: true })
  on_hold_expire_duration?: number | null;
}
