import { ApiProperty } from '@nestjs/swagger';

export class DeleteExpiredUsersQueryDto {
  /** UTC ISO date‑time – delete users that expired *before* this instant */
  @ApiProperty({ required: false, type: String, format: 'date-time' })
  expired_before?: string;

  /** UTC ISO date‑time – delete users that expired *after* this instant */
  @ApiProperty({ required: false, type: String, format: 'date-time' })
  expired_after?: string;
}

export class DeleteExpiredUsersResDto {
  @ApiProperty({ type: [String] })
  usernames!: string[];
}
