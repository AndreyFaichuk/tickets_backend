import { HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { UsersService } from 'src/users/users.service';
import {
  RegisteredUserDto,
  RegistrationUserDto,
} from './dto/RegistrationUserDto';
import { CustomException } from 'src/exceptions/customExeption.exeption';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  static async hashPassword(password: string) {
    const saltOrRounds = 10;
    return await bcrypt.hash(password, saltOrRounds);
  }

  static async comparePasswords(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
  }

  async registration(
    registrationUser: RegistrationUserDto,
  ): Promise<RegisteredUserDto> {
    const existingUser = await this.usersService.findOneByEmail(
      registrationUser.email,
    );

    if (existingUser) {
      throw new CustomException(
        'A user with this email already exists!',
        HttpStatus.CONFLICT,
      );
    }

    const { password, ...rest } = registrationUser;

    console.log(registrationUser, 'registrationUser');

    const hashedPassword = await AuthService.hashPassword(password);

    const createdUser = await this.usersService.createNew({
      ...rest,
      password: hashedPassword,
    });

    return createdUser;
  }
}
