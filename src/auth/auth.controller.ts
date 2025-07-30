// src/auth/auth.controller.ts
import { Controller, Post, Body, Res, HttpStatus, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('signin')
  async signin(
    @Body('initData') initData: string,
    @Res() res: Response,
    @Req() req: Request, // можно оставить, если нужны заголовки/сессии
  ) {
    const { accessToken, refreshToken } = await this.auth.signin(initData);
    const opts = this.auth.getCookieOptions();

    res
      .cookie('ACCESS_TOKEN', accessToken, opts)
      .cookie('REFRESH_TOKEN', refreshToken, opts)
      .status(HttpStatus.OK)
      .send(true);
  }
}
