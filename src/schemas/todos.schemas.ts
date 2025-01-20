import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsMongoId, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import mongoose, { HydratedDocument } from 'mongoose';

export type TodoDocument = HydratedDocument<Todo>;

@Schema({
  versionKey: false,
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
}

export const TodoSchema = SchemaFactory.createForClass(Todo);
