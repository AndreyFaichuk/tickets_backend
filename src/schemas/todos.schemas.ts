import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TodoDocument = HydratedDocument<Todo>;

@Schema()
export class Todo {
  @Prop({
    isRequired: true,
  })
  name: string;

  @Prop({
    isRequired: true,
  })
  description: string;

  @Prop({
    isRequired: true,
  })
  progress: number;
}

export const TodoSchema = SchemaFactory.createForClass(Todo);
