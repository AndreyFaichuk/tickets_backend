import { ApiProperty } from '@nestjs/swagger';
import { PriorityType } from '../todos.constants';

export class CreateTodoDto {
  @ApiProperty({ example: 'Todo name' })
  name: string;

  @ApiProperty({ example: 'Todo description' })
  description: string;

  @ApiProperty({ example: 90 })
  progress: number;

  @ApiProperty({ example: 'low, middle or high' })
  priority: PriorityType;
}
