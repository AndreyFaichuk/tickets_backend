import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { HydratedDocument } from 'mongoose';
import { Todo } from './todos.schemas';

export type ColumnDocument = HydratedDocument<Column>;

@Schema({
  versionKey: false,
})
export class Column {
  @Prop({
    unique: false,
    isRequired: true,
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @Prop({
    type: [Todo],
    default: [],
    unique: false,
  })
  @IsArray()
  cards: Todo[];

  @Prop({
    isRequired: true,
    unique: false,
  })
  @IsNotEmpty()
  @IsString()
  creatorId: string;
}

export const ColumnSchema = SchemaFactory.createForClass(Column);
