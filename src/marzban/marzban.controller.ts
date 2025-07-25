import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MarzbanService } from './marzban.service';
import { CreateUserIntegrationReqDto } from './dto/integration/user-create.integration.req.dto';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UsersListDto } from './dto/integration/users-list.integration.res.dto';
import { UsersListQueryDto } from './dto/integration/users-list.integration.req.dto';
import { BaseUserDto } from './dto/base/user-base.dto';
import { ModifyUserIntegrationReqDto } from './dto/integration/user-modify.integration.req.dto';
import { GetExpiredUsersQueryDto } from './dto/integration/get-expired-users.integration.req.dto';
import { UserUsageResDto } from './dto/integration/user-usage.integration.res.dto';
import {
  DeleteExpiredUsersQueryDto,
  DeleteExpiredUsersResDto,
} from './dto/integration/delete‑expired‑users.integration.req.dto';
import { RemoveUserResDto } from './dto/integration/remove‑user.integration.res.dto';
import { RevokeUserSubscriptionResDto } from './dto/integration/revoke‑subscription.integration.res.dto';

@Controller('marzban')
export class MarzbanController {
  constructor(private readonly svc: MarzbanService) {}

  @Post()
  create(@Body() dto: CreateUserIntegrationReqDto) {
    return this.svc.create(dto);
  }

  @Get(':username')
  @ApiOkResponse({ type: BaseUserDto })
  findOne(@Param('username') username: string) {
    return this.svc.findOne(username);
  }

  @Get()
  @ApiOkResponse({ type: UsersListDto })
  findAll(@Query() query: UsersListQueryDto) {
    return this.svc.findAll(query);
  }

  @Put(':username')
  @ApiOperation({ summary: 'Modify user (Marzban)' })
  @ApiOkResponse({
    type: BaseUserDto,
    description: 'Успешно: изменённый пользователь',
  })
  @ApiBadRequestResponse({
    description: '422 / 409 — ошибка валидации или «User already exists»',
  })
  @ApiNotFoundResponse({ description: '404 — пользователь не найден' })
  @ApiUnauthorizedResponse({ description: '401 — token expired/invalid' })
  async update(
    @Param('username') username: string,
    @Body() dto: ModifyUserIntegrationReqDto,
  ): Promise<BaseUserDto> {
    return this.svc.update(username, dto);
  }

  @Get('users/expired')
  @ApiOperation({ summary: 'Список истёкших пользователей' })
  @ApiQuery({ name: 'expired_before', required: false, type: String })
  @ApiQuery({ name: 'expired_after', required: false, type: String })
  @ApiOkResponse({ type: [String] })
  @HttpCode(HttpStatus.OK)
  getExpired(@Query() q: GetExpiredUsersQueryDto) {
    return this.svc.getExpiredUsers(q);
  }

  @Get('user/:username/usage')
  @ApiOperation({ summary: 'Трафик пользователя по узлам' })
  @ApiParam({ name: 'username', type: String })
  @ApiQuery({ name: 'start', required: false, type: String })
  @ApiQuery({ name: 'end', required: false, type: String })
  @ApiOkResponse({ type: UserUsageResDto })
  @HttpCode(HttpStatus.OK)
  getUsage(
    @Param('username') username: string,
    @Query('start') start?: string,
    @Query('end') end?: string,
  ) {
    return this.svc.getUserUsage(username, { start, end });
  }

  @Post(':username/revoke-sub')
  @ApiOperation({ summary: 'Revoke current subscription for user' })
  @ApiParam({ name: 'username', type: String })
  @ApiOkResponse({ type: RevokeUserSubscriptionResDto })
  async revokeSub(
    @Param('username') username: string,
  ): Promise<RevokeUserSubscriptionResDto> {
    return this.svc.revokeSubscription(username);
  }

  /* ---------- remove user ---------- */
  @Delete(':username')
  @ApiOperation({ summary: 'Delete user entirely' })
  @ApiParam({ name: 'username', type: String })
  @ApiOkResponse({ type: RemoveUserResDto })
  async remove(@Param('username') username: string): Promise<RemoveUserResDto> {
    return this.svc.removeUser(username);
  }

  /* ---------- delete expired users ---------- */
  @Delete('users/expired')
  @ApiOperation({ summary: 'Delete users whose expiry is in the past' })
  @ApiQuery({
    name: 'expired_before',
    required: false,
    type: String,
    format: 'date-time',
  })
  @ApiQuery({
    name: 'expired_after',
    required: false,
    type: String,
    format: 'date-time',
  })
  @ApiOkResponse({ type: DeleteExpiredUsersResDto })
  async deleteExpired(
    @Query() dto: DeleteExpiredUsersQueryDto,
  ): Promise<DeleteExpiredUsersResDto> {
    return this.svc.deleteExpiredUsers(dto);
  }
}
