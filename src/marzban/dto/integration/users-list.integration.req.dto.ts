// marzban/dto/request/users-list.query.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { BaseUserDto } from '../base/user-base.dto';

/** Query‑параметры GET /api/users */
export class UsersListQueryDto {
  @ApiPropertyOptional({ type: Number, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number;

  @ApiPropertyOptional({ type: Number, minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;

  /** Марзбан разрешает массив username[]=a&username[]=b */
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsString({ each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  username?: string[];

  @ApiPropertyOptional({})
  @IsOptional()
  @IsEnum(BaseUserDto)
  status?: BaseUserDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sort?: string;
}
