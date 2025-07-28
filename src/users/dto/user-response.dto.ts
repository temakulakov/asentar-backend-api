import { ApiProperty } from '@nestjs/swagger';
import { UserStatus } from '../../marzban/dto/base/user-base.dto';

export class UserResponseDto {
  @ApiProperty()
  vless: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  telegramId: number;

  @ApiProperty({ type: String, format: 'date-time' })
  expireDate: Date;

  @ApiProperty({ type: [String] })
  links: string[];

  @ApiProperty()
  subscriptionUrl: string;

  @ApiProperty({ enum: UserStatus })
  status: UserStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
