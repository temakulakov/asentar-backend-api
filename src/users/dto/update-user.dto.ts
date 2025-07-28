import { IsOptional, IsInt, IsEnum, IsISO8601 } from 'class-validator';

import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  DataLimitResetStrategy,
  UserStatus as MarzbanStatus,
} from '../../marzban/dto/base/user-base.dto';

export class UpdateUserDto {
  @ApiPropertyOptional({ description: 'Telegram numeric ID' })
  @IsOptional()
  @IsInt()
  telegramId?: number;

  /** Fields to sync back to Marzban if you like */
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  expire?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  data_limit?: number | null;

  @ApiPropertyOptional({ enum: DataLimitResetStrategy })
  @IsOptional()
  @IsEnum(DataLimitResetStrategy)
  data_limit_reset_strategy?: DataLimitResetStrategy;

  @ApiPropertyOptional({ enum: MarzbanStatus })
  @IsOptional()
  @IsEnum(MarzbanStatus)
  status?: MarzbanStatus;

  @ApiPropertyOptional({ format: 'date-time', nullable: true })
  @IsOptional()
  @IsISO8601()
  on_hold_timeout?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsInt()
  on_hold_expire_duration?: number | null;
}
