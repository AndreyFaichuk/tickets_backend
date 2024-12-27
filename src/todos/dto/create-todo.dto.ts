import { ApiProperty } from '@nestjs/swagger';
import mongoose from 'mongoose';

export class Id {
  @ApiProperty()
  _id: mongoose.Types.ObjectId;
}
export class CreateTodoDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  progress: number;
}

export class UpdateTodoDto extends CreateTodoDto {
  @ApiProperty()
  _id: Id;
}
