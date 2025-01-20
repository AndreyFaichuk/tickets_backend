import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsNotEmpty, IsString } from 'class-validator';
import { HydratedDocument, Types } from 'mongoose';

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
    type: [{ type: Types.ObjectId, ref: 'Todo' }],
    default: [],
  })
  cards: Types.ObjectId[];

  @Prop({
    isRequired: true,
    unique: false,
  })
  @IsNotEmpty()
  @IsString()
  creatorId: string;
}

export const ColumnSchema = SchemaFactory.createForClass(Column);
