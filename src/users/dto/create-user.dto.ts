import {
  // IsUUID,
  IsInt,
  IsOptional,
  IsEnum,
  IsISO8601,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  DataLimitResetStrategy,
  UserStatus as MarzbanStatus,
} from '../../marzban/dto/base/user-base.dto';

export class CreateUserDto {
  @ApiProperty({ description: 'UUID username for both local & Marzban' })
  @IsString()
  username: string;

  @ApiProperty({ description: 'Telegram numeric ID' })
  @IsInt()
  telegramId: number;

  /** --- Below fields are passed through to MarzbanService.create() --- */

  @ApiProperty({ required: false, description: 'UNIX expire timestamp (sec)' })
  @IsOptional()
  @IsInt()
  expire?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  data_limit?: number;

  @ApiProperty({ required: false, enum: DataLimitResetStrategy })
  @IsOptional()
  @IsEnum(DataLimitResetStrategy)
  data_limit_reset_strategy?: DataLimitResetStrategy;

  @ApiProperty({ required: false, enum: MarzbanStatus })
  @IsOptional()
  @IsEnum(MarzbanStatus)
  status?: MarzbanStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({ required: false, format: 'date-time' })
  @IsOptional()
  @IsISO8601()
  on_hold_timeout?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  on_hold_expire_duration?: number;
}
