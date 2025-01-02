import { HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { UsersService } from 'src/users/users.service';
import { RegistrationUserDto } from './dto/RegistrationUserDto';
import { User } from 'src/schemas/users.schemas';
import { CustomException } from 'src/exceptions/customExeption.exeption';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  static async hashPassword(password: string) {
    const salt = await bcrypt.genSalt();
    return await bcrypt.hash(password, salt);
  }

  static async comparePasswords(password: string) {
    const hash = await AuthService.hashPassword(password);

    return await bcrypt.compare(password, hash);
  }

  async registration(registrationUser: RegistrationUserDto): Promise<User> {
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

    const hashedPassword = await AuthService.hashPassword(password);

    const createdUser = this.usersService.createNew({
      ...rest,
      password: hashedPassword,
    });

    return createdUser;
  }
}
