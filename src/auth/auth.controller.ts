import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Response,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegistrationUserDto } from './dto/RegistrationUserDto';
import { ApiCookieAuth } from '@nestjs/swagger';

@ApiCookieAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('registration')
  async registration(
    @Body() registrationUserDto: RegistrationUserDto,
    @Response() res,
  ) {
    return this.authService.registration(registrationUserDto);
  }
}
