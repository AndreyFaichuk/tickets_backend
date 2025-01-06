import { ApiCookieAuth } from '@nestjs/swagger';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { Response } from 'express';

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
}
