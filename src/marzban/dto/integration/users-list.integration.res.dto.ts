// marzban/dto/response/users-list.dto.ts
import { ApiProperty } from '@nestjs/swagger';

import { BaseUserDto } from '../base/user-base.dto';

export class UsersListDto {
  @ApiProperty({ type: [BaseUserDto] })
  users!: BaseUserDto[];

  @ApiProperty() total!: number;
}
