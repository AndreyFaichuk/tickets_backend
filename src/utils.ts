import mongoose, { Types } from 'mongoose';
import { CustomException } from './exceptions/customExeption.exeption';
import { HttpStatus } from '@nestjs/common';

export const getRandomItem = <T>(array: readonly T[]): T => {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
};

export const stringToObjectId = (id: string) => new Types.ObjectId(id);

export const validateObjectId = (id: string) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new CustomException(
      'Please, provide a valid Id!',
      HttpStatus.BAD_REQUEST,
    );
  }
};
