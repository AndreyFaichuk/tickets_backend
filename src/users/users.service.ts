import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RegistrationUserDto } from 'src/auth/dto/RegistrationUserDto';

import { User } from 'src/schemas/users.schemas';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private usersModel: Model<User>) {}

  async findOneByEmail(email: string): Promise<User> {
    return this.usersModel.findOne({ email });
  }

  async createNew(registrationUser: RegistrationUserDto): Promise<User> {
    const registeredUser = new this.usersModel(registrationUser);
    return registeredUser.save();
  }
}
