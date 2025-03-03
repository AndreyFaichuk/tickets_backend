import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { HydratedDocument, Types } from 'mongoose';
import * as crypto from 'crypto';

export type WorkspaceDocument = HydratedDocument<Comment>;

@Schema({
  versionKey: false,
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class Workspace {
  @Prop({
    unique: true,
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  creator: Types.ObjectId;

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'User' }],
    default: [],
  })
  members: Types.ObjectId[];

  @Prop({
    unique: false,
    default: 0,
  })
  @IsNotEmpty()
  @IsNumber()
  totalColumns: number;

  @Prop({
    unique: false,
    default: 0,
  })
  @IsNotEmpty()
  @IsNumber()
  totalTickets: number;

  @Prop({ unique: true, default: () => crypto.randomBytes(16).toString('hex') })
  @IsString()
  inviteToken: string;
}
export const WorkspaceSchema = SchemaFactory.createForClass(Workspace);
