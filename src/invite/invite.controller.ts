import { Controller, Get, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { COOKIE_NAMES } from 'src/cookie/cookie.constants';
import { CookieService } from 'src/cookie/cookie.service';
import { WorkspacesService } from 'src/workspaces/workspaces.service';

@Controller('invite')
export class InviteController {
  constructor(
    private readonly workspaceService: WorkspacesService,
    private readonly cookieService: CookieService,
  ) {}

  @Get()
  async acceptInvite(@Query('token') token: string, @Req() req: Request) {
    const userId = this.cookieService.validateCookie(
      req,
      COOKIE_NAMES.sessionId,
    );

    return await this.workspaceService.addMemberByInviteToken(userId, token);
  }
}
