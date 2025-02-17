import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsNotEmpty, IsString } from 'class-validator';
import { HydratedDocument, Types } from 'mongoose';

export type CommentDocument = HydratedDocument<Comment>;

@Schema({
  versionKey: false,
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class Comment {
  @Prop({
    unique: false,
  })
  @IsNotEmpty()
  @IsString()
  comment: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  creator: Types.ObjectId;

  @Prop({
    isRequired: true,
  })
  @IsNotEmpty()
  @IsString()
  todoId: string;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
