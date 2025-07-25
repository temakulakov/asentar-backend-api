import { ApiProperty } from '@nestjs/swagger';

export class NodeUsageDto {
  @ApiProperty({ description: 'ID узла', nullable: true, example: 1 })
  node_id!: number | null;

  @ApiProperty({ description: 'Имя узла', example: 'node‑01' })
  node_name!: string;

  @ApiProperty({
    description: 'Использованный трафик (байт)',
    example: 123456789,
  })
  used_traffic!: number;
}

export class UserUsageResDto {
  @ApiProperty({ description: 'Имя пользователя', example: 'alice' })
  username!: string;

  @ApiProperty({ type: [NodeUsageDto] })
  usages!: NodeUsageDto[];
}
