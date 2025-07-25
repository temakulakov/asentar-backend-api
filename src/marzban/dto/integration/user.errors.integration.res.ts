// marzban-error.dto.ts
import { IsArray, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class Marzban409Dto {
  @IsString() detail!: string; // "User already exists"
}

export class ValidationItemDto {
  @IsArray() loc!: (string | number)[];
  @IsString() msg!: string;
  @IsString() type!: string;
}

export class Marzban422Dto {
  @ValidateNested({ each: true })
  @Type(() => ValidationItemDto)
  detail!: ValidationItemDto[];
}

/** Универсальное объединение, чтобы проще писать generic’и */
export type MarzbanErrorDto =
  | Marzban409Dto
  | Marzban422Dto
  | Record<string, any>;
