import { ApiCookieAuth } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { AuthService } from './auth.service';
import { RegistrationUserDto } from './dto/RegistrationUserDto';
import { LoginUserDto } from './dto/LoginUserDto';
import { CookieService } from 'src/cookie/cookie.service';
import { COOKIE_NAMES } from 'src/cookie/cookie.constants';

@ApiCookieAuth()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cookieService: CookieService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('registration')
  async registration(
    @Body() registrationUserDto: RegistrationUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const registeredUser =
      await this.authService.registration(registrationUserDto);

    this.cookieService.setCookie(res, COOKIE_NAMES.sessionId, registeredUser);

    return;
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const loggedInUser = await this.authService.login(loginUserDto);

    this.cookieService.setCookie(res, COOKIE_NAMES.sessionId, loggedInUser);

    return;
  }

  @Get('check')
  checkAuth(@Req() req: Request, @Res() res) {
    const userId = this.cookieService.validateCookie(
      req,
      COOKIE_NAMES.sessionId,
    );

    if (userId) {
      return res.json({ isAuthenticated: !!userId });
    }
  }
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  logout(@Res() res) {
    this.cookieService.clearCookie(res, COOKIE_NAMES.sessionId);
    res.send();
  }
}
