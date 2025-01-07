import { HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { UsersService } from 'src/users/users.service';
import { RegistrationUserDto } from './dto/RegistrationUserDto';
import { CustomException } from 'src/exceptions/customExeption.exeption';
import { LoginUserDto } from './dto/LoginUserDto';
import { UserDocument } from 'src/schemas/users.schemas';

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
  ): Promise<UserDocument> {
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

    const createdUser = await this.usersService.createNew({
      ...rest,
      password: hashedPassword,
    });

    return createdUser;
  }

  async login(loginUser: LoginUserDto): Promise<UserDocument> {
    const existingUser = await this.usersService.findOneByEmail(
      loginUser.email,
      { isRememberMe: loginUser.isRememberMe },
    );

    if (!existingUser) {
      throw new CustomException(
        'User with following email was not found, please, register first!',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const { password } = existingUser;

    console.log(existingUser, 'loggedInUserloggedInUserloggedInUser 64');

    const arePasswordsMatch = await AuthService.comparePasswords(
      loginUser.password,
      password,
    );

    if (!arePasswordsMatch) {
      throw new CustomException(
        'Passwords were not match!',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return existingUser;
  }
}
