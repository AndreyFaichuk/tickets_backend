import { ApiCookieAuth } from '@nestjs/swagger';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { RegistrationUserDto } from './dto/RegistrationUserDto';
import { Response } from 'express';

@ApiCookieAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('registration')
  async registration(
    @Body() registrationUserDto: RegistrationUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const registeredUser =
      await this.authService.registration(registrationUserDto);

    res.cookie('user_id', registeredUser._id, {
      maxAge: 36000,
    });

    return registeredUser;
  }
}
