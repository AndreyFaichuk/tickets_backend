import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  IsEmail,
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsString,
  Length,
  IsUrl,
} from 'class-validator';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({
  versionKey: false,
})
export class User {
  @Prop({ required: true })
  @IsNotEmpty()
  @IsString()
  @Length(1)
  firstName: string;

  @Prop({ required: true })
  @IsNotEmpty()
  @IsString()
  @Length(1)
  lastName: string;

  @Prop({ required: true, unique: true })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @Prop({ required: true })
  @IsNotEmpty()
  @IsString()
  @Length(8, 128)
  password: string;

  @Prop({ required: true })
  @IsNotEmpty()
  @IsBoolean()
  isRememberMe: boolean;

  @Prop({ required: true })
  @IsNotEmpty()
  @IsString()
  country: string;

  @Prop({ required: true })
  @IsNotEmpty()
  @IsDateString()
  dateOfBirth: string;

  @Prop({ required: true })
  @IsNotEmpty()
  @IsUrl()
  avatarUrl: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
