import { IsOptional, IsString } from 'class-validator';
import { Todo } from 'src/schemas/todos.schemas';

export class UpdateColumnDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  card?: Todo;
}
