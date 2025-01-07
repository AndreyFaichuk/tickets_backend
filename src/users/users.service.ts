import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RegistrationUserDto } from 'src/auth/dto/RegistrationUserDto';
import { CustomException } from 'src/exceptions/customExeption.exeption';
import { User, UserDocument } from 'src/schemas/users.schemas';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private usersModel: Model<UserDocument>,
  ) {}

  async findOneByEmail(
    email: string,
    updateFields?: Partial<UserDocument>,
  ): Promise<UserDocument | null> {
    if (updateFields) {
      return this.usersModel.findOneAndUpdate(
        { email },
        { $set: updateFields },
        { new: true },
      );
    }

    return this.usersModel.findOne({ email });
  }

  async createNew(
    registrationUser: RegistrationUserDto,
  ): Promise<UserDocument> {
    const registeredUser = new this.usersModel(registrationUser);
    const savedUser = await registeredUser.save();
    return savedUser;
  }

  async findCurrent(_id: string): Promise<UserDocument | null> {
    const user = await this.usersModel
      .findById(_id)
      .select('-password -isRememberMe')
      .exec();

    if (!user) {
      throw new CustomException('User not found', HttpStatus.NOT_FOUND);
    }

    return user;
  }
}
