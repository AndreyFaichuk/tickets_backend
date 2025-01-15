import { IsMongoId, IsInt } from 'class-validator';

export class MoveCardDto {
  @IsMongoId()
  fromColumnId: string;

  @IsMongoId()
  toColumnId: string;

  @IsMongoId()
  todoId: string;

  @IsInt()
  fromTodoIndex: number;

  @IsInt()
  toTodoIndex: number;
}
