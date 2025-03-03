import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import mongoose, { HydratedDocument } from 'mongoose';
import { PriorityType } from 'src/todos/todos.constants';

export type TodoDocument = HydratedDocument<Todo>;

@Schema({
  versionKey: false,
  timestamps: { createdAt: 'created_at' },
})
export class Todo {
  @Prop({
    isRequired: true,
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @Prop({
    isRequired: true,
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @Prop({
    isRequired: true,
  })
  @IsNotEmpty()
  @IsNumber()
  progress: number;

  @Prop({
    type: mongoose.Types.ObjectId,
    ref: 'Column',
    required: true,
  })
  @IsMongoId()
  columnId: string;

  @Prop({
    required: true,
  })
  @IsNotEmpty()
  priority: PriorityType;

  @Prop({
    isRequired: true,
  })
  @IsArray()
  attachmentsUrls: string[];

  @Prop({
    unique: false,
    default: 0,
  })
  @IsNotEmpty()
  @IsNumber()
  totalComments: number;
}

export const TodoSchema = SchemaFactory.createForClass(Todo);
