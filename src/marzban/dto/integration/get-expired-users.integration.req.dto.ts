import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsISO8601, IsOptional } from 'class-validator';

export class GetExpiredUsersQueryDto {
  @ApiPropertyOptional({
    description: 'Вернёт юзеров, у которых `expire` < этой даты (ISO‑8601)',
    example: '2025-08-01T00:00:00Z',
  })
  @IsOptional()
  @IsISO8601()
  expired_before?: string;

  @ApiPropertyOptional({
    description: 'Вернёт юзеров, у которых `expire` > этой даты (ISO‑8601)',
    example: '2025-05-01T00:00:00Z',
  })
  @IsOptional()
  @IsISO8601()
  expired_after?: string;
}
