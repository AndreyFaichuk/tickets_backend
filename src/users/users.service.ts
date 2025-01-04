import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  RegisteredUserDto,
  RegistrationUserDto,
} from 'src/auth/dto/RegistrationUserDto';
import { User } from 'src/schemas/users.schemas';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private usersModel: Model<User>) {}

  async findOneByEmail(email: string): Promise<User> {
    return this.usersModel.findOne({ email });
  }

  async createNew(
    registrationUser: RegistrationUserDto,
  ): Promise<RegisteredUserDto> {
    const registeredUser = new this.usersModel(registrationUser);
    const savedUser = await registeredUser.save();
    const result = savedUser.toObject();

    return { ...result, _id: result._id.toString() };
  }
}
