import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsInt } from 'class-validator';

export class MoveCardDto {
  @ApiProperty({ example: '678fa2627ad3f0da1282d374' })
  @IsMongoId()
  fromColumnId: string;

  @ApiProperty({ example: '678fa2627ad3f0da1282d374' })
  @IsMongoId()
  toColumnId: string;

  @ApiProperty({ example: '678fa2627ad3f0da1282d374' })
  @IsMongoId()
  todoId: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  toTodoIndex: number;
}
