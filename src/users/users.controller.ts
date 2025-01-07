import { Controller, Get, HttpCode, HttpStatus, Req } from '@nestjs/common';
import { Request } from 'express';

import { UsersService } from './users.service';
import { CookieService } from 'src/cookie/cookie.service';
import { COOKIE_NAMES } from 'src/cookie/cookie.constants';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly cookieService: CookieService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Get('me')
  async getCurrentUser(@Req() req: Request) {
    const userId = this.cookieService.validateCookie(
      req,
      COOKIE_NAMES.sessionId,
    );

    return await this.usersService.findCurrent(userId);
  }
}
