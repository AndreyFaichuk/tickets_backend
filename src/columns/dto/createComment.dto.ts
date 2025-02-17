import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsString } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ example: '<p>comment text</p>' })
  @IsString()
  comment: string;

  @ApiProperty({ example: '678fa2627ad3f0da1282d374' })
  @IsMongoId()
  todoId: string;
}
