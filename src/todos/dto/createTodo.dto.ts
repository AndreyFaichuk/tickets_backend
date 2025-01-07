import { ApiProperty } from '@nestjs/swagger';

export class CreateTodoDto {
  @ApiProperty({ example: 'Todo name' })
  name: string;

  @ApiProperty({ example: 'Todo description' })
  description: string;

  @ApiProperty({ example: 90 })
  progress: number;
}
