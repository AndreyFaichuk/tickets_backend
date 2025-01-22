import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RegistrationUserDto } from 'src/auth/dto/RegistrationUserDto';
import { AvatarService } from 'src/avatar/avatar.service';
import { CustomException } from 'src/exceptions/customExeption.exeption';
import { User, UserDocument } from 'src/schemas/users.schemas';
import { UploadService } from 'src/upload/upload.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private usersModel: Model<UserDocument>,
    private readonly uploadService: UploadService,
    private readonly avatarService: AvatarService,
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
    const avatarBuffer = await this.avatarService.generateAvatar(
      registrationUser.firstName,
      registrationUser.lastName,
    );

    const avatarName = `${registrationUser.firstName}_${registrationUser.lastName}.png`;

    await this.uploadService.upload(avatarName, avatarBuffer);

    const avatarUrl = await this.uploadService.getFileUrl(avatarName);

    const userWithGeneratedAvatar = { ...registrationUser, avatarUrl };

    const registeredUser = new this.usersModel(userWithGeneratedAvatar);

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
