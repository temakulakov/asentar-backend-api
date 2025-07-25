import { ApiProperty } from '@nestjs/swagger';

export class ExpiredUsersResDto {
  @ApiProperty({ type: [String] })
  data!: string[];
}
