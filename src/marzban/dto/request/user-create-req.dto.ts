import {
  IsEnum,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
} from 'class-validator';
import { DataLimitResetStrategy } from '../base/user-base.dto';

export class CreateUserDto {
  @IsString()
  username: string;

  @IsInt()
  expire: number | null;

  @IsOptional()
  @IsInt()
  data_limit: number;

  @IsOptional()
  @IsEnum(DataLimitResetStrategy)
  data_limit_reset_strategy: DataLimitResetStrategy;

  @IsOptional()
  @IsString()
  note: string;

  @IsOptional()
  @IsISO8601()
  on_hold_timeout: string | null;
}
