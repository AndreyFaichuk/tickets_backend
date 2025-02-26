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
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  creatorId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Workspace',
    required: true,
  })
  workspaceId: Types.ObjectId;
}

export const ColumnSchema = SchemaFactory.createForClass(Column);
